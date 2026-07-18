import sys
import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.models import User, Listing, ListingImage, Amenity
from app.services.auth_service import hash_password

def add_new_destinations():
    db = SessionLocal()
    try:
        # Check if Goa already added
        existing_goa = db.query(Listing).filter(Listing.city.ilike("%goa%")).first()
        if existing_goa:
            print("Goa listings already exist. Cleaning up old region listings to refresh...")
            db.query(ListingImage).filter(ListingImage.listing_id.in_(db.query(Listing.id).filter(Listing.city.in_(["Calangute", "Anjuna", "North Goa", "Candolim", "Nerul", "Ribandar", "Baga", "Vagator", "Morjim", "Ooty", "Ketty", "Katteri", "Coonoor", "Lovedale", "Bangalore", "Lonavala"])))).delete(synchronize_session=False)
            db.query(Listing).filter(Listing.city.in_(["Calangute", "Anjuna", "North Goa", "Candolim", "Nerul", "Ribandar", "Baga", "Vagator", "Morjim", "Ooty", "Ketty", "Katteri", "Coonoor", "Lovedale", "Bangalore", "Lonavala"])).delete(synchronize_session=False)
            db.commit()

        host1 = db.query(User).first()
        if not host1:
            host1 = User(
                email="alice_in@example.com",
                name="Alice Sharma",
                password_hash=hash_password("password123"),
                avatar_url="https://ui-avatars.com/api/?name=Alice+Sharma&background=FF385C&color=fff",
                bio="Superhost in India",
                is_superhost=True
            )
            db.add(host1)
            db.flush()

        amenities = db.query(Amenity).all()
        if not amenities:
            a1 = Amenity(name="Wifi", icon="📶", category="Essentials")
            a2 = Amenity(name="Pool", icon="🏊", category="Features")
            db.add_all([a1, a2])
            db.flush()
            amenities = [a1, a2]

        # 1. GOA LISTINGS (7 initial + 4 more for when right arrow pressed = 11 total)
        goa_data = [
            # First 7 shown on Image 1
            {
                "title": "Flat in Calangute", "city": "Calangute", "state": "Goa", "price": 10600, "rating": 4.88, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]
            },
            {
                "title": "Flat in Anjuna", "city": "Anjuna", "state": "Goa", "price": 8549, "rating": 4.97, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]
            },
            {
                "title": "Apartment in North Goa", "city": "North Goa", "state": "Goa", "price": 8673, "rating": 4.90, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]
            },
            {
                "title": "Flat in North Goa", "city": "North Goa", "state": "Goa", "price": 9998, "rating": 4.95, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]
            },
            {
                "title": "Flat in Candolim", "city": "Candolim", "state": "Goa", "price": 6551, "rating": 4.98, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"]
            },
            {
                "title": "Flat in Nerul", "city": "Nerul", "state": "Goa", "price": 13010, "rating": 5.00, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]
            },
            {
                "title": "Flat in Candolim Sea View", "city": "Candolim", "state": "Goa", "price": 11599, "rating": 4.93, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]
            },
            # Next 4 revealed on right scroll (including Villa in Ribandar from Image 2)
            {
                "title": "Villa in Ribandar", "city": "Ribandar", "state": "Goa", "price": 10595, "rating": 4.95, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]
            },
            {
                "title": "Luxury Pool Villa in Baga", "city": "Baga", "state": "Goa", "price": 14500, "rating": 4.96, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]
            },
            {
                "title": "Boho Cottage in Vagator", "city": "Vagator", "state": "Goa", "price": 7800, "rating": 4.91, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]
            },
            {
                "title": "Beachfront Studio in Morjim", "city": "Morjim", "state": "Goa", "price": 9200, "rating": 4.94, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]
            }
        ]

        # 2. OOTY LISTINGS (7 initial + 4 more = 11 total matching Image 1)
        ooty_data = [
            {
                "title": "Flat in Ooty", "city": "Ooty", "state": "Tamil Nadu", "price": 13695, "rating": 4.90, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800", "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800"]
            },
            {
                "title": "Bed and breakfast in Ooty", "city": "Ooty", "state": "Tamil Nadu", "price": 4565, "rating": 4.83, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"]
            },
            {
                "title": "Place to stay in Ooty Valley", "city": "Ooty", "state": "Tamil Nadu", "price": 6125, "rating": 4.79, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800"]
            },
            {
                "title": "Place to stay in Ooty Hills", "city": "Ooty", "state": "Tamil Nadu", "price": 9700, "rating": 5.00, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]
            },
            {
                "title": "Hotel in Ketty", "city": "Ketty", "state": "Tamil Nadu", "price": 11000, "rating": 4.92, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"]
            },
            {
                "title": "Nature lodge in Ooty", "city": "Ooty", "state": "Tamil Nadu", "price": 13500, "rating": 4.86, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]
            },
            {
                "title": "Villa in Katteri", "city": "Katteri", "state": "Tamil Nadu", "price": 23705, "rating": 4.97, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]
            },
            # Next 4 revealed on right scroll
            {
                "title": "Hilltop Cabin in Coonoor", "city": "Coonoor", "state": "Tamil Nadu", "price": 12200, "rating": 4.94, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800", "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800"]
            },
            {
                "title": "Colonial Heritage Bungalow", "city": "Ooty", "state": "Tamil Nadu", "price": 16800, "rating": 4.98, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"]
            },
            {
                "title": "Tea Estate Villa in Lovedale", "city": "Lovedale", "state": "Tamil Nadu", "price": 14200, "rating": 4.95, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800"]
            },
            {
                "title": "Pine View Suite in Ooty", "city": "Ooty", "state": "Tamil Nadu", "price": 8900, "rating": 4.89, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"]
            }
        ]

        # 3. BANGALORE LISTINGS (3rd popular destination)
        blr_data = [
            {
                "title": "Flat in Indiranagar", "city": "Bangalore", "state": "Karnataka", "price": 7500, "rating": 4.93, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]
            },
            {
                "title": "Loft in Koramangala", "city": "Bangalore", "state": "Karnataka", "price": 6800, "rating": 4.91, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]
            },
            {
                "title": "Penthouse in Whitefield", "city": "Bangalore", "state": "Karnataka", "price": 11500, "rating": 4.96, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]
            },
            {
                "title": "Studio in Jayanagar", "city": "Bangalore", "state": "Karnataka", "price": 4900, "rating": 4.88, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]
            },
            {
                "title": "Garden Villa in Sadashivanagar", "city": "Bangalore", "state": "Karnataka", "price": 18500, "rating": 4.99, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]
            },
            {
                "title": "Flat in MG Road", "city": "Bangalore", "state": "Karnataka", "price": 8200, "rating": 4.90, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]
            },
            {
                "title": "Apartment in Malleshwaram", "city": "Bangalore", "state": "Karnataka", "price": 6400, "rating": 4.94, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"]
            },
            # Next 4 revealed on right scroll
            {
                "title": "Duplex in HSR Layout", "city": "Bangalore", "state": "Karnataka", "price": 9500, "rating": 4.95, "favorite": True,
                "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]
            },
            {
                "title": "Luxury Suite in Lavelle Road", "city": "Bangalore", "state": "Karnataka", "price": 13900, "rating": 4.98, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]
            },
            {
                "title": "Cozy Flat in JP Nagar", "city": "Bangalore", "state": "Karnataka", "price": 5500, "rating": 4.87, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]
            },
            {
                "title": "Villa near Nandi Hills", "city": "Bangalore", "state": "Karnataka", "price": 16000, "rating": 4.97, "favorite": False,
                "images": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]
            }
        ]

        for dataset in [goa_data, ooty_data, blr_data]:
            for item in dataset:
                listing = Listing(
                    host_id=host1.id,
                    title=item["title"],
                    description=f"Welcome to {item['title']} in {item['city']}, {item['state']}. Enjoy a peaceful getaway with top amenities, scenic surroundings, and superhost hospitality.",
                    property_type="Entire home",
                    category="Homes",
                    price_per_night=item["price"],
                    cleaning_fee=800,
                    service_fee_percent=14,
                    city=item["city"],
                    state=item["state"],
                    country="India",
                    latitude=15.4909 if "Goa" in item["state"] else 11.4102 if "Tamil" in item["state"] else 12.9716,
                    longitude=73.8278 if "Goa" in item["state"] else 76.6950 if "Tamil" in item["state"] else 77.5946,
                    max_guests=4,
                    bedrooms=2,
                    beds=2,
                    bathrooms=2,
                    rating=item["rating"],
                    review_count=120,
                    is_guest_favorite=item["favorite"]
                )
                listing.amenities = amenities[:2]
                db.add(listing)
                db.flush()

                for idx, url in enumerate(item["images"]):
                    db.add(ListingImage(
                        listing_id=listing.id,
                        url=url,
                        caption=f"{item['title']} - Photo {idx+1}",
                        display_order=idx
                    ))

        db.commit()
        print("Successfully added 33 listings (11 Goa, 11 Ooty, 11 Bangalore)!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_new_destinations()
