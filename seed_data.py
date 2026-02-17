from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

def seed_data():
    db = SessionLocal()
    
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)

    # Check if data exists
    if db.query(models.Category).first():
        print("Data already exists.")
        return

    print("Seeding data...")

    # Phases
    phases_data = [
        {"title": "Planning", "description": "Blueprints, permits, land survey"},
        {"title": "Foundation", "description": "Excavation, concrete, waterproofing"},
        {"title": "Structure", "description": "Framing, roofing, windows"},
        {"title": "Utilities", "description": "Electrical, plumbing, HVAC"},
        {"title": "Finishing", "description": "Drywall, flooring, painting"},
        {"title": "Landscaping", "description": "Garden, driveway, fencing"},
    ]
    
    phases = {}
    for p_data in phases_data:
        phase = models.ConstructionPhase(**p_data)
        db.add(phase)
        db.commit()
        db.refresh(phase)
        phases[phase.title] = phase
        print(f"Created phase: {phase.title}")

    # Categories and Sub-categories
    categories_data = {
        "Structure": ["Concrete", "Steel", "Bricks", "Lumber", "Roofing Materials"],
        "Interior": ["Furniture", "Appliances", "Lighting", "Decor"],
        "Utilities": ["Electrical Wiring", "Plumbing Pipes", "HVAC Unit", "Water Heater"],
        "Landscaping": ["Plants", "Soil", "Fencing", "Paving Stones"],
        "Permits & Fees": ["Building Permit", "Architect Fee", "Inspection Fee"]
    }

    for cat_title, sub_cats in categories_data.items():
        category = models.Category(title=cat_title, description=f"Expenses related to {cat_title}")
        db.add(category)
        db.commit()
        db.refresh(category)
        print(f"Created category: {category.title}")

        for sub_title in sub_cats:
            sub = models.SubCategory(title=sub_title, category_id=category.id, description=f"{sub_title} for {cat_title}")
            db.add(sub)
            print(f"  - Created sub-category: {sub_title}")
        
        db.commit()

    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
