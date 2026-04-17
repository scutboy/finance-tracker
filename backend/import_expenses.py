import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import SessionLocal
from app.db.models import User, Expense, Subscription, Debt
import os

def parse_date(date_str):
    if pd.isna(date_str):
        return None
    try:
        if isinstance(date_str, datetime):
            return date_str.date()
        return datetime.strptime(date_str.strip(), "%d/%m/%y").date()
    except Exception as e:
        print(f"Error parsing date {date_str}: {e}")
        return None

def main():
    db = SessionLocal()
    user = db.query(User).filter(User.email == 'test@test.com').first()
    if not user:
        print("User not found.")
        return
        
    excel_path = '../Bank_Transactions_Feb-Apr_2026.xlsx'
    if not os.path.exists(excel_path):
        excel_path = 'Bank_Transactions_Feb-Apr_2026.xlsx'
        
    if not os.path.exists(excel_path):
        print(f"Excel file not found at {excel_path}")
        return
        
    df = pd.read_excel(excel_path, skiprows=1)
    
    sub_keywords = {
        'CLAUDE.AI': ('Claude.ai', 6000),      
        'RUNPOD.IO': ('RunPod', 3000),
        'OPENROUTER': ('OpenRouter', 3000),
        'OBSIDIAN CA': ('Obsidian', 1500),
        'OCULUS VR': ('Oculus/Meta', 0),
        'EVERNOTE': ('Evernote', 0),
        'DIALOG TELECOM': ('Dialog Telecom', 0),
        'APPLE.COM': ('Apple Services', 0),
        'NETFLIX': ('Netflix', 0),
        'GEFORCE NOW': ('GeForce Now', 0)
    }
    
    debit_transactions = df[df['Txn Type'] == 'Debit']
    
    for idx, row in debit_transactions.iterrows():
        merchant = str(row.get('Merchant / Description', '')).strip()
        if pd.isna(row.get('Amount')):
            continue
        amount = float(row.get('Amount'))
        if amount <= 0:
            continue
            
        date_val = parse_date(row.get('Date'))
        if not date_val:
            continue
            
        account = str(row.get('Account Type', '')).strip()
        if pd.isna(account) or account == 'nan':
            account = 'Unknown'
            
        category = "Other"
        if "restaurant" in merchant.lower() or "cafe" in merchant.lower() or "uber eats" in merchant.lower() or "pickme food" in merchant.lower():
            category = "Dining"
        elif "pizza" in merchant.lower() or "kfc" in merchant.lower() or "mcdonalds" in merchant.lower() or "barista" in merchant.lower():
            category = "Dining"
        elif "keells" in merchant.lower() or "cargills" in merchant.lower() or "arpico" in merchant.lower() or "glomark" in merchant.lower() or "super mart" in merchant.lower():
            category = "Groceries"
        elif "pharmacy" in merchant.lower() or "hospital" in merchant.lower() or "medical" in merchant.lower() or "echannelling" in merchant.lower():
            category = "Healthcare"
        elif "transfer" in merchant.lower() or "atm" in merchant.lower():
            category = "Transfer/Cash"
        elif "electricity" in merchant.lower() or "water" in merchant.lower() or "telecom" in merchant.lower() or "dialog" in merchant.lower():
            category = "Utilities"
        elif "book" in merchant.lower() or "ielts" in merchant.lower():
            category = "Education"
        
        exists = db.query(Expense).filter(
            Expense.user_id == user.id,
            Expense.date == date_val,
            Expense.amount == amount,
            Expense.description == merchant
        ).first()
        
        if not exists:
            linked_card_id = None
            if "credit card" in account.lower():
                card = db.query(Debt).filter(Debt.user_id == user.id, Debt.type == 'Credit Card', Debt.name.ilike(f"%{row.get('Bank', '')}%")).first()
                if card:
                    linked_card_id = card.id
                    # Automatically update card balance
                    card.balance += amount
            
            new_expense = Expense(
                user_id=user.id,
                date=date_val,
                description=merchant,
                amount=amount,
                category=category,
                account=account,
                linked_card_id=linked_card_id
            )
            db.add(new_expense)
            
        upper_merchant = merchant.upper()
        for key, (sub_name, default_amt) in sub_keywords.items():
            if key in upper_merchant:
                sub_exists = db.query(Subscription).filter(
                    Subscription.user_id == user.id,
                    Subscription.name == sub_name
                ).first()
                if not sub_exists:
                    new_sub = Subscription(
                        user_id=user.id,
                        name=sub_name,
                        amount=amount if amount > 0 else default_amt,
                        billing_day=date_val.day,
                        category="Software/Media",
                        status="active",
                        currency="LKR"
                    )
                    db.add(new_sub)
                break

    db.commit()
    db.close()

if __name__ == '__main__':
    main()
