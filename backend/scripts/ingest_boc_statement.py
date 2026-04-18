import pdfplumber
import re
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# DB Setup
DATABASE_URL = "sqlite:////Users/hiruniwickremasinghe/Documents/Vibe Coding Projects/Finance Tracker/backend/finance_tracker.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

PDF_PATH = "/Users/hiruniwickremasinghe/Documents/Vibe Coding Projects/Finance Tracker/Bank Statements/BOC Debit Account Statement.pdf"

def parse_boc_date(date_str):
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").date()
    except:
        return None

def ingest():
    db = SessionLocal()
    user_id = 1 # Assuming user 1 for now, but should ideally fetch the real user
    
    print("Extracting PDF...")
    all_rows = []
    
    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            # Extracting text line by line
            lines = page.extract_text().split("\n")
            # BOC pattern: DD-MM-YYYY DD-MM-YYYY [Description] [Debit/Credit] [Balance]
            # Some descriptions wrap to next line, we need to handle that if possible
            # Simplified: look for lines starting with a date
            current_date = None
            for line in lines:
                parts = line.split()
                if len(parts) >= 8 and re.match(r'^\d{2}-\d{2}-\d{4}$', parts[0]):
                    try:
                        tx_date = parts[0]
                        # parts[-1] val, [-2] serial, [-3] code, [-4] balance, [-5] credit, [-6] debit
                        balance_str = parts[-4]
                        credit_str = parts[-5]
                        debit_str = parts[-6]
                        desc = " ".join(parts[2:-6]).strip()
                        
                        dt = parse_boc_date(tx_date)
                        if not dt: continue
                        
                        # Handle Debit vs Credit
                        is_expense = debit_str != '-' and debit_str != '0.00'
                        amount_str = debit_str if is_expense else credit_str
                        amount = float(amount_str.replace(",", ""))
                        
                        all_rows.append({
                            "date": dt,
                            "description": desc,
                            "amount": amount,
                            "type": "expense" if is_expense else "income"
                        })
                    except Exception as e:
                        # print(f"Skip line: {line} - {e}")
                        continue

    print(f"Found {len(all_rows)} transactions in PDF.")
    
    # Ingest with deduplication
    count = 0
    for row in all_rows:
        # Check for duplicate
        if row["type"] == "expense":
            exists = db.execute(text("SELECT 1 FROM expenses WHERE user_id=:u AND date=:d AND amount=:a AND description=:desc"), 
                              {"u": user_id, "d": row["date"], "a": row["amount"], "desc": row["description"]}).fetchone()
            if not exists:
                # Classification logic
                is_transfer = False
                desc_lower = row["description"].lower()
                category = "Other"
                
                if "cc payment" in desc_lower or "cc - paym" in desc_lower:
                    category = "Debt"
                    is_transfer = False # CC Payment from debit is a "real" expense per user pref
                elif "gold loan" in desc_lower:
                    category = "Debt"
                    is_transfer = True # Gold loan is hidden from dashboard
                    row["description"] = "Gold Loan Payment (Masked)"
                elif "personal" in desc_lower or row["description"] == "CRS" or " CRS " in row["description"] or row["description"].startswith("CRS "):
                    is_transfer = True
                    category = "Transfer"
                elif "sms alert" in desc_lower or "monthly fee" in desc_lower or "service charge" in desc_lower:
                    category = "Fees"
                    
                db.execute(text("INSERT INTO expenses (user_id, date, description, amount, category, account, is_transfer, created_at) "
                                "VALUES (:u, :d, :desc, :a, :cat, :acc, :it, :ca)"),
                           {"u": user_id, "d": row["date"], "desc": row["description"], "a": row["amount"], 
                            "cat": category, "acc": "BOC Current Account", "it": is_transfer, "ca": datetime.utcnow()})
                count += 1
            else:
                # Update existing if needed (e.g. if we want to force is_transfer flags)
                pass
        else:
            # Income
            exists = db.execute(text("SELECT id, is_transfer FROM income WHERE user_id=:u AND date=:d AND amount=:a AND description=:desc"), 
                              {"u": user_id, "d": row["date"], "a": row["amount"], "desc": row["description"]}).fetchone()
            
            is_transfer = False
            desc_lower = row["description"].lower()
            if "personal" in desc_lower or "crs " in desc_lower or row["description"].startswith("CRS"):
                is_transfer = True
            
            if not exists:
                category = "Other"
                if "slips in" in row["description"].lower():
                    category = "Salary"
                
                db.execute(text("INSERT INTO income (user_id, date, description, amount, category, account, is_transfer, created_at) "
                                "VALUES (:u, :d, :desc, :a, :cat, :acc, :it, :ca)"),
                           {"u": user_id, "d": row["date"], "desc": row["description"], "a": row["amount"], 
                            "cat": category, "acc": "BOC Current Account", "it": is_transfer, "ca": datetime.utcnow()})
                count += 1
            else:
                # Sync is_transfer for existing income
                db.execute(text("UPDATE income SET is_transfer = :it WHERE id = :id"), {"it": is_transfer, "id": exists[0]})
                
    db.commit()
    print(f"Successfully ingested {count} new transactions.")

if __name__ == "__main__":
    ingest()
