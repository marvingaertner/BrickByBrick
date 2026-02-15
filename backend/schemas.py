from pydantic import BaseModel
from typing import Optional, List
from datetime import date

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
    tags: List[int] = []

class TagBase(BaseModel):
    title: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True
