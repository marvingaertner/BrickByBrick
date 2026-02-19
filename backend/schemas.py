from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import date
import os

# --- Base Schemas ---
class CategoryBase(BaseModel):
    title: str
    description: Optional[str] = None

class SubCategoryBase(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int

class ConstructionPhaseBase(BaseModel):
    title: str
    description: Optional[str] = None

class ExpenseBase(BaseModel):
    title: str
    amount: float
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    notes: Optional[str] = None
    category_id: int
    sub_category_id: Optional[int] = None
    phase_id: Optional[int] = None
    vendor: Optional[str] = None
    tags: List[int] = []

class TagBase(BaseModel):
    title: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    class Config:
        from_attributes = True

class ExpenseAttachmentBase(BaseModel):
    id: int
    filename: str
    file_path: str
    file_size: int
    upload_date: date
    
    class Config:
        from_attributes = True

    @validator('file_path')
    def prepend_app_url(cls, v):
        # If the path is relative (starts with /static), prepend APP_URL
        if v and v.startswith('/static'):
            app_url = os.getenv('APP_URL', 'http://localhost:8000')
            # Ensure no double slashes if app_url ends with /
            if app_url.endswith('/'):
                app_url = app_url[:-1]
            return f"{app_url}{v}"
        return v

# --- Create Schemas ---
class CategoryCreate(CategoryBase):
    pass

class SubCategoryCreate(SubCategoryBase):
    pass

class ConstructionPhaseCreate(ConstructionPhaseBase):
    pass

class ExpenseCreate(ExpenseBase):
    pass

# --- Read Schemas ---
class SubCategory(SubCategoryBase):
    id: int
    class Config:
        from_attributes = True

class Category(CategoryBase):
    id: int
    sub_categories: List[SubCategory] = []
    class Config:
        from_attributes = True

class ConstructionPhase(ConstructionPhaseBase):
    id: int
    class Config:
        from_attributes = True

class Expense(ExpenseBase):
    id: int
    creation_date: date
    category: Category
    sub_category: Optional[SubCategory] = None
    phase: Optional[ConstructionPhase] = None
    tags: List[Tag] = []
    attachments: List[ExpenseAttachmentBase] = []

    class Config:
        from_attributes = True
