from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid
from . import models, schemas, crud, database
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="BrickByBrick API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
UPLOAD_DIR = "backend/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to BrickByBrick API"}

# --- Categories ---
@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@app.get("/categories/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db, category_id, category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    success = crud.delete_category(db, category_id)
    if not success:
         raise HTTPException(status_code=404, detail="Category not found")
    return {"ok": True}

# --- SubCategories ---
@app.post("/sub_categories/", response_model=schemas.SubCategory)
def create_sub_category(sub_category: schemas.SubCategoryCreate, db: Session = Depends(get_db)):
    return crud.create_sub_category(db=db, sub_category=sub_category)

@app.get("/sub_categories/", response_model=List[schemas.SubCategory])
def read_sub_categories(category_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_sub_categories(db, category_id=category_id, skip=skip, limit=limit)

@app.put("/sub_categories/{sub_category_id}", response_model=schemas.SubCategory)
def update_sub_category(sub_category_id: int, sub_category: schemas.SubCategoryCreate, db: Session = Depends(get_db)):
    db_sub = crud.update_sub_category(db, sub_category_id, sub_category)
    if db_sub is None:
        raise HTTPException(status_code=404, detail="SubCategory not found")
    return db_sub

@app.delete("/sub_categories/{sub_category_id}")
def delete_sub_category(sub_category_id: int, db: Session = Depends(get_db)):
    success = crud.delete_sub_category(db, sub_category_id)
    if not success:
         raise HTTPException(status_code=404, detail="SubCategory not found")
    return {"ok": True}

# --- Phases ---
@app.post("/phases/", response_model=schemas.ConstructionPhase)
def create_phase(phase: schemas.ConstructionPhaseCreate, db: Session = Depends(get_db)):
    return crud.create_phase(db=db, phase=phase)

@app.get("/phases/", response_model=List[schemas.ConstructionPhase])
def read_phases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_phases(db, skip=skip, limit=limit)

@app.put("/phases/{phase_id}", response_model=schemas.ConstructionPhase)
def update_phase(phase_id: int, phase: schemas.ConstructionPhaseCreate, db: Session = Depends(get_db)):
    db_phase = crud.update_phase(db, phase_id, phase)
    if db_phase is None:
        raise HTTPException(status_code=404, detail="Phase not found")
    return db_phase

@app.delete("/phases/{phase_id}")
def delete_phase(phase_id: int, db: Session = Depends(get_db)):
    success = crud.delete_phase(db, phase_id)
    if not success:
         raise HTTPException(status_code=404, detail="Phase not found")
    return {"ok": True}



# --- Tags ---
@app.post("/tags/", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db=db, tag=tag)

@app.get("/tags/", response_model=List[schemas.Tag])
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_tags(db, skip=skip, limit=limit)

@app.put("/tags/{tag_id}", response_model=schemas.Tag)
def update_tag(tag_id: int, tag: schemas.TagCreate, db: Session = Depends(get_db)):
    db_tag = crud.update_tag(db, tag_id, tag)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    success = crud.delete_tag(db, tag_id)
    if not success:
         raise HTTPException(status_code=404, detail="Tag not found")
    return {"ok": True}

# --- Expenses ---
@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db=db, expense=expense)

@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_expenses(db, skip=skip, limit=limit)

@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = crud.update_expense(db, expense_id, expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    success = crud.delete_expense(db, expense_id)
    if not success:
         raise HTTPException(status_code=404, detail="Expense not found")
    return {"ok": True}


# --- Attachments ---
@app.post("/expenses/{expense_id}/attachments/", response_model=schemas.ExpenseAttachmentBase)
async def create_attachment(expense_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Verify expense exists
    # For now we rely on the FK constraint in the DB or we can add a check if needed.
    # To keep it simple and efficient, we proceed. Models have FK.
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Create DB record
    # Store relative path for serving
    relative_path = f"/static/uploads/{unique_filename}"
    return crud.create_attachment(
        db=db,
        expense_id=expense_id,
        filename=file.filename,
        file_path=relative_path,
        file_size=0 # We will fix file size later if needed or get it from os.path.getsize(file_path)
    )

@app.delete("/attachments/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db)):
    # Get attachment to find file path
    attachment = crud.get_attachment(db, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    # Delete file from disk
    # file_path in DB is relative URL e.g. /static/uploads/..., we need system path.
    # UPLOAD_DIR is backend/static/uploads
    filename = os.path.basename(attachment.file_path)
    system_path = os.path.join(UPLOAD_DIR, filename)
    
    if os.path.exists(system_path):
        os.remove(system_path)
        
    # Delete from DB
    crud.delete_attachment(db, attachment_id)
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
