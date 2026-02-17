from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app, get_db
from backend.models import Base
from backend import schemas

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_expense_with_vendor():
    # 1. Create a Category
    response = client.post(
        "/categories/",
        json={"title": "Test Category", "description": "For testing purposes"}
    )
    assert response.status_code == 200
    category_id = response.json()["id"]

    # 2. Create an Expense with vendor
    expense_data = {
        "title": "Hardware Store Visit",
        "amount": 150.50,
        "category_id": category_id,
        "vendor": "Home Depot",
        "notes": "Bought some nails"
    }
    response = client.post("/expenses/", json=expense_data)
    assert response.status_code == 200
    data = response.json()
    assert data["vendor"] == "Home Depot"
    assert data["title"] == "Hardware Store Visit"
    
    expense_id = data["id"]

    # 3. Read the Expense
    response = client.get("/expenses/")
    assert response.status_code == 200
    expenses = response.json()
    # Find the expense we just created
    created_expense = next((e for e in expenses if e["id"] == expense_id), None)
    assert created_expense is not None
    assert created_expense["vendor"] == "Home Depot"

def test_update_expense_vendor():
    # 1. Create a Category (if not exists from previous tests or assume fresh db)
    # Ideally tests should clean up, but for simplicity we create new one
    response = client.post(
        "/categories/",
        json={"title": "Update Test Category", "description": "For update testing"}
    )
    category_id = response.json()["id"]

    # 2. Create an Expense without vendor
    expense_data = {
        "title": "Plumber",
        "amount": 200.00,
        "category_id": category_id
    }
    response = client.post("/expenses/", json=expense_data)
    expense_id = response.json()["id"]

    # 3. Update the Expense to add vendor
    update_data = {
        "title": "Plumber",
        "amount": 200.00,
        "category_id": category_id,
        "vendor": "Mario Bros Plumbing"
    }
    response = client.put(f"/expenses/{expense_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["vendor"] == "Mario Bros Plumbing"
