"""
Statement Parser Service
Parses PDF and CSV bank/credit card statements into a common transaction format.
Supports Sri Lankan bank formats: BOC, Sampath, NDB, HNB, Cargills, Commercial Bank.
"""
import re
import csv
import io
from datetime import datetime, date
from typing import List, Dict, Optional

# ─────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────────────────────────────────────

# Common date formats found in Sri Lankan bank statements
DATE_FORMATS = [
    "%d/%m/%Y", "%d-%m-%Y", "%d %b %Y", "%d-%b-%Y",
    "%d/%m/%y", "%d-%m-%y", "%d %B %Y",
    "%Y-%m-%d", "%m/%d/%Y",
]

CATEGORY_KEYWORDS = {
    "Groceries":               ["keells", "cargills", "food city", "laugfs", "sathosa", "grocery", "supermarket", "arpico"],
    "Dining & Entertainment":  ["restaurant", "cafe", "kfc", "mcdonalds", "pizza", "coffee", "bar ", "hotel", "cinema", "theatre", "kumbuk", "nuga gama", "dutch burgher"],
    "Transport":               ["uber", "pickme", "fuel", "ioc", "ceypetco", "parking", "bus", "train", "taxi", "toll", "vehicle"],
    "Utilities":               ["ceb", "leco", "water board", "nwsdb", "slt", "dialog", "mobitel", "airtel", "hutch", "electricity", "internet", "broadband"],
    "Healthcare":              ["pharmacy", "hospital", "clinic", "doctor", "apollo", "nawaloka", "asiri", "lanka hospital", "dentist", "medical"],
    "Shopping":                ["amazon", "ebay", "aliexpress", "clothing", "fashion", "shoes", "uniqlo", "cottonon", "softlogic", "singhe"],
    "Education":               ["school", "university", "coursera", "udemy", "tuition", "books", "institute", "academy"],
    "Insurance":               ["insurance", "aia", "union assurance", "ceylinco", "prudential", "allianz"],
}


def _guess_category(description: str) -> str:
    desc_lower = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "Other"


def _parse_date(date_str: str) -> Optional[date]:
    date_str = date_str.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def _clean_amount(amount_str: str) -> Optional[float]:
    """Strip currency symbols, commas, spaces and convert to float."""
    cleaned = re.sub(r"[^\d.]", "", amount_str.replace(",", ""))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# CSV Parser
# ─────────────────────────────────────────────────────────────────────────────

# Column name aliases — maps common bank CSV header names to our fields
DATE_ALIASES     = ["date", "txn date", "transaction date", "value date", "posted date", "trans date"]
DESC_ALIASES     = ["description", "narration", "particulars", "details", "merchant", "transaction details", "remarks"]
AMOUNT_ALIASES   = ["amount", "debit", "withdrawal", "dr", "debit amount"]
CREDIT_ALIASES   = ["credit", "deposit", "cr", "credit amount"]
ACCOUNT_ALIASES  = ["account", "card", "card number", "account number"]


def _normalize_header(header: str) -> str:
    return header.strip().lower().replace("_", " ").replace("-", " ")


def _find_column(headers_lower: List[str], aliases: List[str]) -> Optional[int]:
    for i, h in enumerate(headers_lower):
        if any(alias in h for alias in aliases):
            return i
    return None


def parse_csv(content: bytes, account_name: str = "Imported") -> List[Dict]:
    """
    Parse a bank CSV statement. Auto-detects column positions.
    Returns list of transaction dicts.
    """
    text = content.decode("utf-8-sig", errors="replace")  # handle BOM
    
    # Sniff delimiter
    try:
        dialect = csv.Sniffer().sniff(text[:2048], delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel  # fallback to comma

    reader = csv.reader(io.StringIO(text), dialect)
    rows = list(reader)

    if not rows:
        return []

    # Find the header row (first row with recognisable column names)
    header_row_idx = 0
    headers_lower = []
    for idx, row in enumerate(rows[:10]):
        candidate = [_normalize_header(c) for c in row]
        if _find_column(candidate, DATE_ALIASES) is not None:
            header_row_idx = idx
            headers_lower = candidate
            break

    if not headers_lower:
        return []

    col_date   = _find_column(headers_lower, DATE_ALIASES)
    col_desc   = _find_column(headers_lower, DESC_ALIASES)
    col_debit  = _find_column(headers_lower, AMOUNT_ALIASES)
    col_credit = _find_column(headers_lower, CREDIT_ALIASES)

    if col_date is None or col_desc is None:
        return []

    transactions = []
    for row in rows[header_row_idx + 1:]:
        if len(row) < 2:
            continue

        date_str = row[col_date].strip() if col_date < len(row) else ""
        parsed_date = _parse_date(date_str)
        if not parsed_date:
            continue

        description = row[col_desc].strip() if col_desc < len(row) else ""
        if not description:
            continue

        # Determine amount — if we have separate debit/credit columns, use debit
        amount = None
        if col_debit is not None and col_debit < len(row):
            amount = _clean_amount(row[col_debit])

        # If debit is empty/zero, check credit column
        if (amount is None or amount == 0) and col_credit is not None and col_credit < len(row):
            credit_val = _clean_amount(row[col_credit])
            if credit_val and credit_val > 0:
                # Credits to account (incoming money) — skip or mark differently
                # For now we include credits as negative (income)
                amount = -credit_val

        if amount is None or amount <= 0:
            # Skip zero/empty rows and credits
            if amount is None or amount == 0:
                continue

        transactions.append({
            "date": parsed_date.isoformat(),
            "description": description,
            "amount": abs(amount),
            "category": _guess_category(description),
            "account": account_name,
        })

    return transactions


# ─────────────────────────────────────────────────────────────────────────────
# PDF Parser
# ─────────────────────────────────────────────────────────────────────────────

# Regex patterns for common Sri Lankan bank statement transaction rows
# Pattern: date, description, optional ref, amount(s)
PDF_TRANSACTION_PATTERNS = [
    # BOC / Sampath / NDB style: DD/MM/YYYY  Description  Amount  Balance
    r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s{2,}(.+?)\s{2,}([\d,]+\.\d{2})\s+([\d,]+\.\d{2})",
    # DD Mon YYYY  Description  Amount
    r"(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s{2,}(.+?)\s{2,}([\d,]+\.\d{2})",
    # DD/MM/YY Description Amount
    r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})\s{1,}(.+?)\s{2,}([\d,]+\.\d{2})",
    # HNB style: includes transaction code
    r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+\w+\s+(.+?)\s+([\d,]+\.\d{2})",
]

# Lines to skip in PDFs (headers, page numbers, footers, etc.)
SKIP_PATTERNS = [
    r"^page\s+\d+", r"^statement of account", r"^account number",
    r"^date\s+description", r"^opening balance", r"^closing balance",
    r"^total\s+", r"^\s*$", r"^brought forward", r"^carried forward",
    r"^balance\s+", r"^\d+\s+of\s+\d+", r"^customer",
]


def _should_skip_line(line: str) -> bool:
    line_lower = line.strip().lower()
    return any(re.match(p, line_lower) for p in SKIP_PATTERNS)


def parse_pdf(content: bytes, account_name: str = "Imported") -> List[Dict]:
    """
    Extract transactions from a PDF bank statement using pdfplumber.
    Returns list of transaction dicts.
    """
    try:
        import pdfplumber
    except ImportError:
        raise RuntimeError("pdfplumber is not installed. Run: pip install pdfplumber")

    transactions = []

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            # Try table extraction first (structured PDFs)
            tables = page.extract_tables()
            for table in tables:
                txns = _parse_pdf_table(table, account_name)
                transactions.extend(txns)

            # If no tables found, fall back to raw text line parsing
            if not tables:
                text = page.extract_text() or ""
                txns = _parse_pdf_text(text, account_name)
                transactions.extend(txns)

    # Deduplicate by (date, description, amount)
    seen = set()
    unique = []
    for t in transactions:
        key = (t["date"], t["description"][:30], t["amount"])
        if key not in seen:
            seen.add(key)
            unique.append(t)

    return unique


def _parse_pdf_table(table: List, account_name: str) -> List[Dict]:
    """Parse a table extracted from a PDF page."""
    if not table or len(table) < 2:
        return []

    # Treat first row as header
    headers = [_normalize_header(str(c or "")) for c in table[0]]
    col_date  = _find_column(headers, DATE_ALIASES)
    col_desc  = _find_column(headers, DESC_ALIASES + ["particulars"])
    col_debit = _find_column(headers, AMOUNT_ALIASES)
    col_credit = _find_column(headers, CREDIT_ALIASES)

    # If no structured headers found, try positional heuristic
    if col_date is None:
        # Assume: col0=date, col1=description, col2 or col3=amount
        col_date, col_desc, col_debit = 0, 1, 2

    transactions = []
    for row in table[1:]:
        if not row:
            continue
        try:
            date_str = str(row[col_date] or "").strip()
            parsed_date = _parse_date(date_str)
            if not parsed_date:
                continue

            description = str(row[col_desc] or "").strip() if col_desc < len(row) else ""
            if not description or _should_skip_line(description):
                continue

            amount = None
            if col_debit is not None and col_debit < len(row):
                amount = _clean_amount(str(row[col_debit] or ""))
            if (amount is None or amount == 0) and col_credit is not None and col_credit < len(row):
                amount = _clean_amount(str(row[col_credit] or ""))

            if not amount or amount <= 0:
                continue

            transactions.append({
                "date": parsed_date.isoformat(),
                "description": description,
                "amount": amount,
                "category": _guess_category(description),
                "account": account_name,
            })
        except (IndexError, TypeError):
            continue

    return transactions


def _parse_pdf_text(text: str, account_name: str) -> List[Dict]:
    """Parse raw text extracted from a PDF page using regex patterns."""
    transactions = []

    for line in text.split("\n"):
        line = line.strip()
        if not line or _should_skip_line(line):
            continue

        for pattern in PDF_TRANSACTION_PATTERNS:
            match = re.search(pattern, line)
            if match:
                groups = match.groups()
                date_str = groups[0]
                description = groups[1].strip()
                # Last number group before balance is usually the transaction amount
                amount_str = groups[-2] if len(groups) >= 4 else groups[-1]

                parsed_date = _parse_date(date_str)
                amount = _clean_amount(amount_str)

                if parsed_date and amount and amount > 0 and description:
                    transactions.append({
                        "date": parsed_date.isoformat(),
                        "description": description,
                        "amount": amount,
                        "category": _guess_category(description),
                        "account": account_name,
                    })
                break  # stop at first matching pattern for this line

    return transactions


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def parse_file(filename: str, content: bytes, account_name: str = "Imported") -> List[Dict]:
    """
    Dispatch to the correct parser based on file extension.
    Returns list of parsed transaction dicts ready for preview.
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "csv":
        return parse_csv(content, account_name)
    elif ext == "pdf":
        return parse_pdf(content, account_name)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Please upload a PDF or CSV file.")
