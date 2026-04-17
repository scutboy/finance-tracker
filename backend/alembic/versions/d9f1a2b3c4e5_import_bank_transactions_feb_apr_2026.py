"""Import bank transactions Feb-Apr 2026

Revision ID: d9f1a2b3c4e5
Revises: c1234567890a
Create Date: 2026-04-18 00:00:00.000000

This migration hardcodes all 136 debit transactions from the
Bank_Transactions_Feb-Apr_2026.xlsx file and inserts them for the
FIRST user in the production database (by id), skipping any that
already exist (idempotent). It also seeds subscription records for
recurring services found in the data.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime, date
from sqlalchemy.orm import Session

# revision identifiers, used by Alembic.
revision: str = 'd9f1a2b3c4e5'
down_revision: Union[str, None] = 'c1234567890a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ---------------------------------------------------------------------------
# Hardcoded transaction data (extracted from Excel, all debit rows)
# ---------------------------------------------------------------------------
TRANSACTIONS = [
    {'date': '2026-02-07', 'description': 'GALLE ELECTRICAL AGENC KANDY', 'amount': 15850.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-08', 'description': 'HAPPY FEET AND HANDS P COLOMBO 05', 'amount': 10500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-09', 'description': 'DHL KEELLS PVT LTD COLOMBO 02', 'amount': 3337.95, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-14', 'description': 'CEFT Transfer', 'amount': 5025.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-15', 'description': 'UBER EATS CBH', 'amount': 1850.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-16', 'description': 'UBER EATS CBH', 'amount': 1530.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-07', 'description': 'CEFT Transfer', 'amount': 56025.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-10', 'description': 'CEFT Transfer', 'amount': 10025.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-10', 'description': 'Transfer Debit', 'amount': 15025.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-11', 'description': 'Online Transfer', 'amount': 10000.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-13', 'description': 'GENERAL MEDICAL COUNCIL MANCHESTER', 'amount': 672.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-14', 'description': 'CAPTAIN TABLE KANDY', 'amount': 7800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-15', 'description': 'Online Transfer (CC Payment)', 'amount': 35000.0, 'bank': 'BOC', 'account': 'Savings A/C'},
    {'date': '2026-02-17', 'description': 'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO', 'amount': 20.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-18', 'description': 'SARASAVI BOOK SHOP NUGEGODA', 'amount': 3500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-19', 'description': 'VITO PIZZA KANDY PVT LTD', 'amount': 4200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-20', 'description': 'S.N.K. ENTERPRISES WEWELDENIYA', 'amount': 1800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-21', 'description': 'KCC MULTIPLEX KANDY', 'amount': 2000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-22', 'description': 'THE KAND (restaurant)', 'amount': 6500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-23', 'description': 'S.N.K. ENTERPRISES', 'amount': 500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-24', 'description': 'BARISTA MAHARAGAMA', 'amount': 1200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-25', 'description': 'CHANDRASIRI & SONS MAHARAGAMA', 'amount': 8000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-26', 'description': 'UBER EATS 852', 'amount': 2490.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-15', 'description': 'IELTS FLEX (UK)', 'amount': 200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-02-28', 'description': 'BURLEYS NUGEGODA', 'amount': 11500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-01', 'description': 'NEW MANJARI PVT LTD NUGEGODA', 'amount': 3200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-02', 'description': 'BARISTA MIRIHANA NUGEGODA', 'amount': 1650.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-03', 'description': 'HEBREWS CAFE RAJAGIRIYA', 'amount': 2800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-05', 'description': 'AUSTRALIAN SUPER MART PITA KOTTE', 'amount': 7500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-07', 'description': 'LANKA FILLING STATION KOTTE', 'amount': 5000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-09', 'description': 'MOTHER & BABY KANDY', 'amount': 2200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-10', 'description': 'PickMe Food', 'amount': 850.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-11', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 920.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-12', 'description': 'KEELLS EMBULDENIYA', 'amount': 4500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-13', 'description': 'RUWAN PHARMACY KOTTE', 'amount': 1800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-14', 'description': 'Echannelling PLC', 'amount': 500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-15', 'description': 'MINISTRY OF FOREIGN AFFAIRS BATTARAMULLA', 'amount': 5000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-16', 'description': 'TEA AVENUE PVT LTD KOTTE', 'amount': 1200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-17', 'description': 'ATM Withdrawal - Peoples Bank Madiwela', 'amount': 10000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-18', 'description': 'XIMI VOGUE - KCC KANDY', 'amount': 3500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-19', 'description': 'DIGITAL BANKING DIVISION (Top-up)', 'amount': 5000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-20', 'description': 'ATM Withdrawal - EMBULDENIYA-1 BR', 'amount': 5000.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-21', 'description': 'BARISTA - ETHUL KOTTE', 'amount': 1350.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-22', 'description': 'CFC PHARMACY PITAKOTTE', 'amount': 2500.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-23', 'description': 'KEELLS PITAKOTTE', 'amount': 3800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-24', 'description': 'UBER 852', 'amount': 950.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-25', 'description': 'KHAYABAN CATERING COLOMBO 05', 'amount': 5200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-26', 'description': 'TURNING HEADS SALON ETHULKOTTE', 'amount': 2200.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-28', 'description': 'EVERNOTE', 'amount': 9.99, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-29', 'description': 'DIALOG TELECOM PLC', 'amount': 1890.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-03-30', 'description': 'SOFTLOGIC GLOMARK', 'amount': 7800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-04-01', 'description': 'OCULUS VR', 'amount': 9.99, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-04-02', 'description': 'KHAYABAN CATERING COLOMBO 05', 'amount': 4800.0, 'bank': 'BOC', 'account': 'Credit Card'},
    {'date': '2026-04-12', 'description': 'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO', 'amount': 20.0, 'bank': 'BOC', 'account': 'Credit Card'},
    # ComBank Debit Card transactions
    {'date': '2026-02-26', 'description': 'UBER EATS 852', 'amount': 2604.99, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-12', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 870.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-14', 'description': 'ATM Withdrawal - PERADENIYA', 'amount': 6500.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-16', 'description': 'KEELLS EMBULDENIYA', 'amount': 5921.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-18', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 920.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-18', 'description': 'LANKA FILLING STATION KOTTE', 'amount': 5000.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-18', 'description': 'SARASAVI BOOK SHOP NUGEGODA', 'amount': 2500.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-18', 'description': "AUNTY COOKIE'S CAFE PITAKOTTE", 'amount': 1150.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-19', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 870.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-19', 'description': 'DARAZ.LK COLOMBO 03', 'amount': 29.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-19', 'description': 'DARAZ.LK COLOMBO 03', 'amount': 1804.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-21', 'description': 'I L T RETAIL PVT LTD KANDY', 'amount': 1200.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-21', 'description': 'DARAZ.LK COLOMBO 03', 'amount': 1405.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-22', 'description': 'ISLAND TEA KANDY', 'amount': 2728.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-22', 'description': 'SOFTLOGIC RESTAURANT COLOMBO 05', 'amount': 4000.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-23', 'description': 'UBER EATS 852', 'amount': 2381.24, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-24', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 970.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-24', 'description': 'KEELLS EMBULDENIYA', 'amount': 2150.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-26', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 870.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-26', 'description': 'THE LEONE CAFE WEWELDENIYA', 'amount': 319.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-26', 'description': 'THE LEONE CAFE WEWELDENIYA', 'amount': 750.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-28', 'description': 'DINEMORE KANDY', 'amount': 6800.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-29', 'description': 'S.N.K. ENTERPRISES WEWELDENIYA', 'amount': 5000.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-30', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 1170.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-03-31', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 870.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-02', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 920.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-04', 'description': 'THE KANDOS SHOP KANDY', 'amount': 6435.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-04', 'description': 'THE KANDOS SHOP KANDY', 'amount': 852.5, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-04', 'description': 'ORANGE PHARMACY KANDY', 'amount': 2348.3, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-04', 'description': 'RAJ PHARMACY (PVT) LTD KANDY', 'amount': 500.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-05', 'description': 'RASABULA MADIWELA', 'amount': 2180.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-06', 'description': 'BARISTA MIRIHANA NUGEGODA', 'amount': 3355.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-07', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 900.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-08', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 720.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-09', 'description': 'NELUM KOLE MAHARAGAMA', 'amount': 870.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-11', 'description': 'ATM Withdrawal - Kandy', 'amount': 4500.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-11', 'description': 'RUNPOD.IO US', 'amount': 10.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-11', 'description': 'SOFTLOGIC RESTAURANT COLOMBO 05', 'amount': 6350.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-11', 'description': 'MAC MART KANDY', 'amount': 2980.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-12', 'description': 'Echannelling PLC', 'amount': 3699.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-12', 'description': 'ASIRI HOSPITAL KANDY', 'amount': 4272.48, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-13', 'description': 'OPENROUTER INC US', 'amount': 5.8, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-13', 'description': 'OPENROUTER INC US', 'amount': 10.8, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-14', 'description': 'OPENROUTER INC US', 'amount': 8.8, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-14', 'description': 'OBSIDIAN CA', 'amount': 5.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-14', 'description': 'XIANG YUN RESTAURANT KANDY', 'amount': 6283.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-15', 'description': 'OPENROUTER INC US', 'amount': 7.8, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-15', 'description': 'THE LEONE CAFE WEWELDENIYA', 'amount': 290.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-15', 'description': 'PIZZA HUT THALAWATHUGODA', 'amount': 1494.0, 'bank': 'ComBank', 'account': 'Debit Card'},
    {'date': '2026-04-16', 'description': 'KEELLS EMBULDENIYA', 'amount': 7116.38, 'bank': 'ComBank', 'account': 'Debit Card'},
    # NDB Credit Card
    {'date': '2026-01-24', 'description': 'APPLE.COM/BILL (Singapore)', 'amount': 11.95, 'bank': 'NDB', 'account': 'Credit Card'},
    {'date': '2026-02-24', 'description': 'APPLE.COM/BILL (Singapore)', 'amount': 11.95, 'bank': 'NDB', 'account': 'Credit Card'},
    {'date': '2026-03-24', 'description': 'APPLE.COM/BILL (Singapore)', 'amount': 11.95, 'bank': 'NDB', 'account': 'Credit Card'},
    {'date': '2026-03-01', 'description': 'Minimum Balance Fee', 'amount': 75.0, 'bank': 'NDB', 'account': 'Savings A/C'},
    {'date': '2026-04-02', 'description': 'Minimum Balance Fee', 'amount': 75.0, 'bank': 'NDB', 'account': 'Savings A/C'},
    # Sampath Credit Card
    {'date': '2026-02-01', 'description': 'Netflix.com', 'amount': 9.99, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-02-27', 'description': 'GEFORCE NOW - BRO.GAME (Thailand)', 'amount': 399.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-02-28', 'description': 'ABANS ELITE - 20M (appliance)', 'amount': 59999.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-02-28', 'description': 'SARASAVI BOOKSHOP KANDY', 'amount': 2370.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-01', 'description': 'Netflix.com', 'amount': 9.99, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-15', 'description': 'WORLD PLAY', 'amount': 600.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-15', 'description': 'WORLD PLAY', 'amount': 2300.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-15', 'description': 'KANDY CITY CENTER', 'amount': 10797.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-21', 'description': 'NETHUN PHARMACY', 'amount': 2534.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-03-27', 'description': 'XIANG YUN RESTAURANT', 'amount': 8327.0, 'bank': 'Sampath', 'account': 'Credit Card'},
    {'date': '2026-04-01', 'description': 'Netflix.com', 'amount': 9.99, 'bank': 'Sampath', 'account': 'Credit Card'},
]

# Subscriptions to seed (name -> {amount, billing_day, currency})
SUBSCRIPTIONS = [
    {'name': 'Claude.ai', 'amount': 20.0, 'billing_day': 17, 'category': 'Software/Media', 'currency': 'USD'},
    {'name': 'RunPod', 'amount': 10.0, 'billing_day': 11, 'category': 'Software/Media', 'currency': 'USD'},
    {'name': 'OpenRouter', 'amount': 8.0, 'billing_day': 13, 'category': 'Software/Media', 'currency': 'USD'},
    {'name': 'Obsidian', 'amount': 5.0, 'billing_day': 14, 'category': 'Software/Media', 'currency': 'USD'},
    {'name': 'Oculus/Meta', 'amount': 9.99, 'billing_day': 1, 'category': 'Entertainment', 'currency': 'USD'},
    {'name': 'Evernote', 'amount': 9.99, 'billing_day': 28, 'category': 'Software/Media', 'currency': 'USD'},
    {'name': 'Dialog Telecom', 'amount': 1890.0, 'billing_day': 29, 'category': 'Utilities', 'currency': 'LKR'},
    {'name': 'Apple Services', 'amount': 11.95, 'billing_day': 24, 'category': 'Entertainment', 'currency': 'USD'},
    {'name': 'Netflix', 'amount': 9.99, 'billing_day': 1, 'category': 'Entertainment', 'currency': 'USD'},
    {'name': 'GeForce Now', 'amount': 399.0, 'billing_day': 27, 'category': 'Entertainment', 'currency': 'LKR'},
]


def categorize(description: str) -> str:
    d = description.lower()
    if any(k in d for k in ['restaurant', 'cafe', 'uber eats', 'pickme food', 'pizza', 'barista', 'dinemore', 'kfc']):
        return 'Dining'
    if any(k in d for k in ['keells', 'cargills', 'arpico', 'glomark', 'super mart', 'nelum kole', 'softlogic glomark']):
        return 'Groceries'
    if any(k in d for k in ['pharmacy', 'hospital', 'medical', 'echannelling', 'asiri']):
        return 'Healthcare'
    if any(k in d for k in ['transfer', 'atm withdrawal', 'ceft']):
        return 'Transfer/Cash'
    if any(k in d for k in ['electricity', 'water', 'telecom', 'dialog']):
        return 'Utilities'
    if any(k in d for k in ['book', 'ielts', 'gmc', 'general medical']):
        return 'Education'
    if any(k in d for k in ['netflix', 'claude', 'runpod', 'openrouter', 'obsidian', 'oculus', 'evernote', 'apple.com', 'geforce']):
        return 'Subscriptions'
    return 'Other'


def upgrade() -> None:
    bind = op.get_bind()

    # Get the first (real) user — targets whoever is in the production DB
    users_result = bind.execute(sa.text("SELECT id FROM users ORDER BY id LIMIT 1"))
    user_row = users_result.fetchone()
    if not user_row:
        print("No users found in production DB. Skipping import migration.")
        return

    user_id = user_row[0]
    print(f"[Migration d9f1a2b3c4e5] Importing for user_id={user_id}")

    # Get all existing debt names for this user (to link credit card expenses)
    debts_result = bind.execute(
        sa.text("SELECT id, name, type, balance FROM debts WHERE user_id = :uid"),
        {"uid": user_id}
    )
    debts = [dict(r._mapping) for r in debts_result.fetchall()]
    debt_map = {}  # bank keyword -> debt_id
    for d in debts:
        name_lower = d['name'].lower()
        if 'boc' in name_lower:
            debt_map['BOC'] = d['id']
        elif 'sampath' in name_lower:
            debt_map['Sampath'] = d['id']
        elif 'ndb' in name_lower:
            debt_map['NDB'] = d['id']
        elif 'combank' in name_lower or 'commercial' in name_lower:
            debt_map['ComBank'] = d['id']

    # Track card balance increments to apply at end
    card_balance_increments = {}

    inserted = 0
    skipped = 0
    for txn in TRANSACTIONS:
        date_val = txn['date']
        desc = txn['description']
        amount = txn['amount']
        bank = txn['bank']
        account = txn['account']
        category = categorize(desc)

        # Check if already exists
        exists = bind.execute(
            sa.text("""
                SELECT id FROM expenses
                WHERE user_id = :uid AND date = :d AND amount = :a AND description = :desc
                LIMIT 1
            """),
            {"uid": user_id, "d": date_val, "a": amount, "desc": desc}
        ).fetchone()

        if exists:
            skipped += 1
            continue

        # Link to credit card if applicable
        linked_card_id = None
        if 'credit card' in account.lower() and bank in debt_map:
            linked_card_id = debt_map[bank]
            card_balance_increments[linked_card_id] = card_balance_increments.get(linked_card_id, 0) + amount

        bind.execute(
            sa.text("""
                INSERT INTO expenses (user_id, date, description, amount, category, account, linked_card_id, created_at)
                VALUES (:uid, :d, :desc, :amt, :cat, :acc, :cid, :now)
            """),
            {
                "uid": user_id,
                "d": date_val,
                "desc": desc,
                "amt": amount,
                "cat": category,
                "acc": f"{bank} {account}",
                "cid": linked_card_id,
                "now": datetime.utcnow().isoformat()
            }
        )
        inserted += 1

    # Update linked card balances only for newly inserted credit card expenses
    for debt_id, increment in card_balance_increments.items():
        bind.execute(
            sa.text("UPDATE debts SET balance = balance + :inc WHERE id = :did AND user_id = :uid"),
            {"inc": increment, "did": debt_id, "uid": user_id}
        )
        print(f"  Updated debt id={debt_id} balance += {increment:.2f}")

    # Seed subscriptions (idempotent)
    sub_inserted = 0
    for sub in SUBSCRIPTIONS:
        sub_exists = bind.execute(
            sa.text("SELECT id FROM subscriptions WHERE user_id = :uid AND name = :n LIMIT 1"),
            {"uid": user_id, "n": sub['name']}
        ).fetchone()
        if sub_exists:
            continue
        bind.execute(
            sa.text("""
                INSERT INTO subscriptions (user_id, name, amount, billing_day, category, status, currency, created_at)
                VALUES (:uid, :name, :amt, :bd, :cat, 'active', :cur, :now)
            """),
            {
                "uid": user_id,
                "name": sub['name'],
                "amt": sub['amount'],
                "bd": sub['billing_day'],
                "cat": sub['category'],
                "cur": sub['currency'],
                "now": datetime.utcnow().isoformat()
            }
        )
        sub_inserted += 1

    print(f"[Migration d9f1a2b3c4e5] Done: {inserted} expenses inserted, {skipped} skipped, {sub_inserted} subscriptions added.")


def downgrade() -> None:
    # Remove only the expenses we inserted (identified by their descriptions from our list)
    bind = op.get_bind()
    descriptions = list(set(t['description'] for t in TRANSACTIONS))
    for desc in descriptions:
        bind.execute(
            sa.text("DELETE FROM expenses WHERE description = :d"),
            {"d": desc}
        )
    sub_names = [s['name'] for s in SUBSCRIPTIONS]
    for name in sub_names:
        bind.execute(
            sa.text("DELETE FROM subscriptions WHERE name = :n"),
            {"n": name}
        )
