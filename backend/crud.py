from sqlalchemy.orm import Session
from . import models, schemas
from fastapi import HTTPException

# --- Category CRUD ---
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(title=category.title, description=category.description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    db_category.title = category.title
    db_category.description = category.description
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return False
    # Check for active expenses
    if db_category.expenses:
        raise HTTPException(status_code=400, detail="Could not delete category due to existing expenses.")
    db.delete(db_category)
    db.commit()
    return True

# --- SubCategory CRUD ---
def get_sub_category(db: Session, sub_category_id: int):
    return db.query(models.SubCategory).filter(models.SubCategory.id == sub_category_id).first()

def get_sub_categories(db: Session, category_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.SubCategory)
    if category_id:
        query = query.filter(models.SubCategory.category_id == category_id)
    return query.offset(skip).limit(limit).all()

def create_sub_category(db: Session, sub_category: schemas.SubCategoryCreate):
    db_sub_category = models.SubCategory(**sub_category.dict())
    db.add(db_sub_category)
    db.commit()
    db.refresh(db_sub_category)
    return db_sub_category

def update_sub_category(db: Session, sub_category_id: int, sub_category: schemas.SubCategoryCreate):
    db_sub_category = get_sub_category(db, sub_category_id)
    if not db_sub_category:
        return None
    db_sub_category.title = sub_category.title
    db_sub_category.description = sub_category.description
    db_sub_category.category_id = sub_category.category_id
    db.commit()
    db.refresh(db_sub_category)
    return db_sub_category

def delete_sub_category(db: Session, sub_category_id: int):
    db_sub_category = get_sub_category(db, sub_category_id)
    if not db_sub_category:
        return False
    # Check for active expenses
    if db_sub_category.expenses:
        raise HTTPException(status_code=400, detail="Could not delete sub-category due to existing expenses.")
    db.delete(db_sub_category)
    db.commit()
    return True

# --- Construction Phase CRUD ---
def get_phase(db: Session, phase_id: int):
    return db.query(models.ConstructionPhase).filter(models.ConstructionPhase.id == phase_id).first()

def get_phases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ConstructionPhase).offset(skip).limit(limit).all()

def create_phase(db: Session, phase: schemas.ConstructionPhaseCreate):
    db_phase = models.ConstructionPhase(**phase.dict())
    db.add(db_phase)
    db.commit()
    db.refresh(db_phase)
    return db_phase

def update_phase(db: Session, phase_id: int, phase: schemas.ConstructionPhaseCreate):
    db_phase = get_phase(db, phase_id)
    if not db_phase:
        return None
    db_phase.title = phase.title
    db_phase.description = phase.description
    db.commit()
    db.refresh(db_phase)
    return db_phase

def delete_phase(db: Session, phase_id: int):
    db_phase = get_phase(db, phase_id)
    if not db_phase:
        return False
    # Check for active expenses
    if db_phase.expenses:
        raise HTTPException(status_code=400, detail="Could not delete phase due to existing expenses.")
    db.delete(db_phase)
    db.commit()
    return True

# --- Tag CRUD ---
def get_tag(db: Session, tag_id: int):
    return db.query(models.Tag).filter(models.Tag.id == tag_id).first()

def get_tags(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Tag).offset(skip).limit(limit).all()

def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def update_tag(db: Session, tag_id: int, tag: schemas.TagCreate):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return None
    db_tag.title = tag.title
    db.commit()
    db.refresh(db_tag)
    return db_tag

def delete_tag(db: Session, tag_id: int):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return False
    # Check for active expenses
    if db_tag.expenses:
        raise HTTPException(status_code=400, detail="Could not delete tag due to existing expenses.")
    db.delete(db_tag)
    db.commit()
    return True

# --- Expense CRUD ---
def get_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Expense).offset(skip).limit(limit).all()

def create_expense(db: Session, expense: schemas.ExpenseCreate):
    expense_data = expense.dict()
    tag_ids = expense_data.pop('tags', [])
    
    db_expense = models.Expense(**expense_data)
    
    if tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()
        db_expense.tags = tags

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        return False
    db.delete(db_expense)
    db.commit()
    return True

def update_expense(db: Session, expense_id: int, expense: schemas.ExpenseCreate):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        return None
    
    # Update fields
    db_expense.title = expense.title
    db_expense.amount = expense.amount
    db_expense.purchase_date = expense.purchase_date
    db_expense.category_id = expense.category_id
    db_expense.sub_category_id = expense.sub_category_id
    db_expense.phase_id = expense.phase_id
    db_expense.phase_id = expense.phase_id
    db_expense.notes = expense.notes
    db_expense.vendor = expense.vendor
    
    # Update tags
    # Always update tags if provided (empty list means remove all tags)
    tag_ids = expense.tags
    tags = db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()
    db_expense.tags = tags
    
    db.commit()
    db.refresh(db_expense)
    return db_expense
