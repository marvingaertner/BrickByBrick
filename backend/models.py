from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    sub_categories = relationship("SubCategory", back_populates="category", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="category")

class SubCategory(Base):
    __tablename__ = "sub_categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    category = relationship("Category", back_populates="sub_categories")
    expenses = relationship("Expense", back_populates="sub_category")

class ConstructionPhase(Base):
    __tablename__ = "construction_phases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    expenses = relationship("Expense", back_populates="phase")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    creation_date = Column(Date, default=datetime.date.today)
    purchase_date = Column(Date, default=datetime.date.today)
    notes = Column(Text, nullable=True)
    vendor = Column(String, nullable=True)

    # Foreign Keys
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    sub_category_id = Column(Integer, ForeignKey("sub_categories.id"), nullable=True)
    phase_id = Column(Integer, ForeignKey("construction_phases.id"), nullable=True)

    # Relationships
    category = relationship("Category", back_populates="expenses")
    sub_category = relationship("SubCategory", back_populates="expenses")
    phase = relationship("ConstructionPhase", back_populates="expenses")
    tags = relationship("Tag", secondary="expense_tags", back_populates="expenses")
    attachments = relationship("ExpenseAttachment", back_populates="expense", cascade="all, delete-orphan")

# Association Table
class ExpenseTag(Base):
    __tablename__ = "expense_tags"
    expense_id = Column(Integer, ForeignKey("expenses.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)

    # Relationships
    expenses = relationship("Expense", secondary="expense_tags", back_populates="tags")

class ExpenseAttachment(Base):
    __tablename__ = "expense_attachments"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(Date, default=datetime.date.today)

    # Relationships
    expense = relationship("Expense", back_populates="attachments")
