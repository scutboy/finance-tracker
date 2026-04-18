import re
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import models
from app.db.database import get_db
from app.api.deps import get_current_user

router = APIRouter()

# ── Bank SMS patterns ────────────────────────────────────────────────────────

PATTERNS = [
    {
        "bank": "BOC",
        "account": "Boc Generic Account",
        "type": "expense",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.\d{2})\s+has been (?:debited|spent|paid).*?(\d{2}[-/][\w/]+[-/]\d{2,4}).*?(?:at|from|@)\s+(.+?)(?:\.|$)",
            re.IGNORECASE | re.DOTALL
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "BOC",
        "account": "Boc Generic Account",
        "type": "income",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.\d{2})\s+has been credited.*?(\d{2}[-/][\w/]+[-/]\d{2,4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None},
    },
    {
        "bank": "ComBank",
        "account": "ComBank Debit Card",
        "type": "expense",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.?\d*)\s+(?:debited|spent|paid).*?on\s+(\d{2}/\d{2}/\d{4})\s+(?:at|@)\s+(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "ComBank",
        "account": "ComBank Debit Card",
        "type": "income",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.?\d*)\s+credited.*?on\s+(\d{2}/\d{2}/\d{4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": None},
    },
    {
        "bank": "Sampath",
        "account": "Sampath Credit Card",
        "type": "expense",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.\d{2})\s+(?:has been )?(?:debited|spent|paid).*?Sampath.*?(\d{2}[-/][\w/]+[-/]\d{2,4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "NDB",
        "account": "NDB Card",
        "type": "expense",
        "re": re.compile(
            r"NDB.*?(?:Rs\.?|LKR)\s*([\d,]+\.\d{2}).*?(\d{2}[-/][\w/]+[-/]\d{2,4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "NTB",
        "account": "NTB AMEX",
        "type": "expense",
        "re": re.compile(
            r"(?:NTB|AMEX|Nations).*?(?:Rs\.?|LKR)\s*([\d,]+\.\d{2}).*?(\d{2}[-/][\w/]+[-/]\d{2,4}).*?(?:at|@)\s*(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
    {
        "bank": "ComBank",
        "account": "ComBank Debit Card",
        "type": "expense",
        "re": re.compile(
            r"Purchase at\s+(.+?)\s+for\s+(?:Rs\.?|LKR)\s*([\d,]+\.?\d*)\s+on\s+(\d{2}[-/][\w/]+[-/]\d{2,4})",
            re.IGNORECASE
        ),
        "groups": {"amount": 2, "date": 3, "description": 1},
    },
    {
        "bank": "Universal",
        "account": "Unrecognized Account",
        "type": "expense",
        "re": re.compile(
            r"(?:Rs\.?|LKR)\s*([\d,]+\.?\d*).*?(\d{2}[-/][\w/]+[-/]\d{2,4}).*?(?:at|from|@|to)\s+(.+?)(?:\.|$)",
            re.IGNORECASE
        ),
        "groups": {"amount": 1, "date": 2, "description": 3},
    },
]

TRANSFER_KEYWORDS = [
    'digital banking division', 'ceft', 'personal transfer',
    'boc transfer', 'online transfer', 'internet transfer',
    'fund transfer', 'interbank'
]

def parse_date(raw: str) -> str:
    """Normalise various date formats to YYYY-MM-DD."""
    raw = raw.strip()
    # Handle 2-digit years common in SMS (e.g. 17/04/26)
    for fmt in ("%d/%m/%Y", "%d-%b-%Y", "%d-%b-%y", "%d/%m/%y"):
        try:
            dt = datetime.strptime(raw, fmt)
            # If 2-digit year was parsed as very old (e.g. 1926), fix it to 2000s
            if dt.year < 2000:
                dt = dt.replace(year=dt.year + 2000)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return raw

def classify(description: str, base_type: str) -> str:
    desc_lower = (description or "").lower()
    if any(kw in desc_lower for kw in TRANSFER_KEYWORDS):
        return "transfer"
    return base_type


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/parse")
def parse_sms(
    payload: dict,
    current_user: models.User = Depends(get_current_user)
):
    """Parse raw SMS text and return classified transactions + unmatched lines."""
    raw = payload.get("raw_text", "")
    results = []
    seen = set()
    unmatched_lines = []
    
    # Split by double newlines or single newlines that look like separate messages
    lines = [l.strip() for l in re.split(r'\n+', raw) if l.strip()]

    for line in lines:
        line_matched = False
        for p in PATTERNS:
            match = p["re"].search(line)
            if match:
                line_matched = True
                g = p["groups"]
                try:
                    amount = float(match.group(g["amount"]).replace(",", ""))
                    date_str = parse_date(match.group(g["date"]))
                    description = (
                        match.group(g["description"]).strip()
                        if g["description"] and match.group(g["description"])
                        else p["bank"] + " transaction"
                    )
                except Exception:
                    continue

                key = (date_str, amount, description[:30])
                if key in seen:
                    continue
                seen.add(key)

                txn_type = classify(description, p["type"])
                results.append({
                    "bank": p["bank"],
                    "account": p["account"],
                    "type": txn_type,
                    "date": date_str,
                    "description": description[:100],
                    "amount": amount,
                    "category": "Other",
                    "confidence": "high",
                })
                break # Move to next line once one pattern matches
        
        if not line_matched:
            unmatched_lines.append(line)

    # Sort by date
    results.sort(key=lambda x: x["date"], reverse=True)
    return {
        "parsed": results, 
        "unmatched_lines": unmatched_lines,
        "count": len(results)
    }


@router.post("/confirm")
def confirm_sms(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Save confirmed transactions to the database."""
    saved, skipped = 0, 0

    for txn in payload.get("transactions", []):
        try:
            if txn["type"] == "expense":
                db.add(models.Expense(
                    user_id=current_user.id,
                    date=datetime.strptime(txn["date"], "%Y-%m-%d").date(),
                    description=txn["description"],
                    amount=txn["amount"],
                    category=txn.get("category", "Other"),
                    account=txn["account"],
                    is_transfer=False,
                ))
            elif txn["type"] == "income":
                db.add(models.Income(
                    user_id=current_user.id,
                    date=datetime.strptime(txn["date"], "%Y-%m-%d").date(),
                    description=txn["description"],
                    amount=txn["amount"],
                    category="Other",
                    account=txn["account"],
                ))
            elif txn["type"] == "transfer":
                db.add(models.Transfer(
                    user_id=current_user.id,
                    date=datetime.strptime(txn["date"], "%Y-%m-%d").date(),
                    from_account=txn["account"],
                    to_account="Unknown",
                    amount=txn["amount"],
                    description=txn["description"],
                ))
            saved += 1
        except Exception:
            skipped += 1

    db.commit()
    return {"saved": saved, "skipped": skipped}
