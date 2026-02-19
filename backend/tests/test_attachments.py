from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..database import Base, get_db
from ..main import app, UPLOAD_DIR
import os
import shutil
import pytest

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_attachments.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
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

@pytest.fixture(scope="module", autouse=True)
def setup_teardown():
    # Setup: Create upload dir if not exists (though main does it)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield
    # Teardown: Remove test DB and uploads
    if os.path.exists("./test_attachments.db"):
        os.remove("./test_attachments.db")
    # Clean up uploads created during tests? 
    # For safety we might only delete files created by tests, but simpler to leave them or use a temp dir.
    # We'll leave them for now to avoid deleting real uploads if config matches.

def test_create_expense_and_upload_attachment():
    # 1. Create Category
    res_cat = client.post("/categories/", json={"title": "Test Category"})
    assert res_cat.status_code == 200
    cat_id = res_cat.json()["id"]

    # 2. Create Expense
    res_exp = client.post("/expenses/", json={
        "title": "Test Expense",
        "amount": 100.0,
        "date": "2023-01-01",
        "category_id": cat_id,
        "vendor": "Test Vendor"
    })
    assert res_exp.status_code == 200
    expense_id = res_exp.json()["id"]

    # 3. Upload Attachment
    # Create a dummy file
    filename = "test_file.txt"
    with open(filename, "wb") as f:
        f.write(b"Hello World")
    
    with open(filename, "rb") as f:
        res_upload = client.post(
            f"/expenses/{expense_id}/attachments/",
            files={"file": (filename, f, "text/plain")}
        )
    
    assert res_upload.status_code == 200
    data = res_upload.json()
    assert data["filename"] == filename
    assert "id" in data
    assert os.path.exists(os.path.join(UPLOAD_DIR, os.path.basename(data["file_path"])))

    attachment_id = data["id"]
    
    # 4. Verify Attachment in Expense
    res_get = client.get(f"/expenses/") # Expense list should include attachments?
    # Our schema includes them, let's check
    data_list = res_get.json()
    my_expense = next(e for e in data_list if e["id"] == expense_id)
    assert len(my_expense["attachments"]) == 1
    assert my_expense["attachments"][0]["id"] == attachment_id

    # 5. Delete Attachment
    res_del = client.delete(f"/attachments/{attachment_id}")
    assert res_del.status_code == 200
    
    # Verify file deleted
    assert not os.path.exists(os.path.join(UPLOAD_DIR, os.path.basename(data["file_path"])))
    
    # Verify removed from expense
    res_get_after = client.get(f"/expenses/")
    data_list_after = res_get_after.json()
    my_expense_after = next(e for e in data_list_after if e["id"] == expense_id)
    assert len(my_expense_after["attachments"]) == 0

    # Cleanup
    if os.path.exists(filename):
        os.remove(filename)

