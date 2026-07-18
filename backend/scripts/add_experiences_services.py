"""
Script to add Experience and Service listings to the existing database.
Run from the backend directory: python add_experiences_services.py
"""
import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.models import User, Listing, ListingImage, Amenity


def add_experiences_and_services():
    db = SessionLocal()
    try:
        # Check if experiences or services already exist from previous run of this script
        existing_items = db.query(Listing).filter(Listing.category.in_(["Experiences", "Services"])).first()
        if existing_items:
            print("Experiences/Services already exist. Cleaning up to refresh cleanly...")
            item_ids = [l.id for l in db.query(Listing).filter(Listing.category.in_(["Experiences", "Services"])).all()]
            db.query(ListingImage).filter(ListingImage.listing_id.in_(item_ids)).delete(synchronize_session=False)
            db.query(Listing).filter(Listing.id.in_(item_ids)).delete(synchronize_session=False)
            db.commit()

        # Get existing hosts
        hosts = db.query(User).limit(3).all()
        if not hosts:
            print("No users found. Please seed the database first.")
            return

        host1, host2, host3 = hosts[0], hosts[min(1, len(hosts)-1)], hosts[min(2, len(hosts)-1)]

        # Get amenities
        amenities = db.query(Amenity).all()
        amenity_map = {a.name: a for a in amenities}

        def get_amenities_by_name(*names):
            return [amenity_map[n] for n in names if n in amenity_map]

        # ==================== EXPERIENCES ====================
        # We'll add more experiences so the two rows are filled properly
        # "Happening today" row items
        experience_data_today = [
            {
                "host": host1,
                "title": "Sunrise Yoga on the Beach",
                "description": "Begin your day with a serene sunrise yoga session on pristine Goa beach. Suitable for all levels. Includes meditation, pranayama, and a healthy breakfast smoothie.",
                "city": "Candolim", "state": "Goa", "country": "India",
                "price": 1500, "rating": 4.96, "reviews": 78, "favorite": True,
                "lat": 15.5175, "lng": 73.7624,
                "images": [
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Goan Cooking Class with Market Tour",
                "description": "Visit a local fish market, learn to pick fresh ingredients, then cook authentic Goan vindaloo, xacuti, and bebinca in a traditional kitchen.",
                "city": "Panjim", "state": "Goa", "country": "India",
                "price": 2500, "rating": 4.98, "reviews": 134, "favorite": True,
                "lat": 15.4909, "lng": 73.8278,
                "images": [
                    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
                    "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Heritage Walk Through Old Goa Churches",
                "description": "Explore UNESCO World Heritage basilicas and centuries-old Portuguese churches with a certified heritage guide. Includes entry fees and refreshments.",
                "city": "Old Goa", "state": "Goa", "country": "India",
                "price": 1800, "rating": 5.00, "reviews": 56, "favorite": True,
                "lat": 15.5009, "lng": 73.9116,
                "images": [
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
                    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Kayaking Through Mangroves",
                "description": "Paddle through serene backwater mangrove forests spotting kingfishers, mudskippers, and monitor lizards. All equipment and guide provided.",
                "city": "Panjim", "state": "Goa", "country": "India",
                "price": 2000, "rating": 4.93, "reviews": 92, "favorite": True,
                "lat": 15.4630, "lng": 73.8320,
                "images": [
                    "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800",
                    "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Spice Plantation Tour & Lunch",
                "description": "Walk through a fragrant spice plantation learning about cardamom, pepper, vanilla, and cinnamon. Includes a traditional Goan thali lunch.",
                "city": "Ponda", "state": "Goa", "country": "India",
                "price": 1200, "rating": 4.89, "reviews": 210, "favorite": False,
                "lat": 15.4000, "lng": 74.0100,
                "images": [
                    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Sunset Cruise on Mandovi River",
                "description": "Enjoy a 2-hour sunset cruise on the Mandovi river with live music, unlimited mocktails, and spectacular views of Panjim's skyline at dusk.",
                "city": "Panjim", "state": "Goa", "country": "India",
                "price": 3500, "rating": 4.91, "reviews": 167, "favorite": True,
                "lat": 15.4989, "lng": 73.8278,
                "images": [
                    "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800",
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Traditional Pottery Workshop",
                "description": "Get your hands dirty and create your own pottery piece on a traditional wheel. Take home your creation. All materials included.",
                "city": "Mapusa", "state": "Goa", "country": "India",
                "price": 1800, "rating": 4.95, "reviews": 43, "favorite": True,
                "lat": 15.5918, "lng": 73.8100,
                "images": [
                    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
                    "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Scuba Diving for Beginners",
                "description": "Discover the underwater world with a certified PADI instructor. No prior experience needed. Includes full equipment, training, and a guided reef dive.",
                "city": "Baga", "state": "Goa", "country": "India",
                "price": 4500, "rating": 4.97, "reviews": 88, "favorite": True,
                "lat": 15.5568, "lng": 73.7543,
                "images": [
                    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
                    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800",
                ],
            },
        ]

        # "Happening tomorrow" row items
        experience_data_tomorrow = [
            {
                "host": host3,
                "title": "Street Art & Graffiti Tour of Bangalore",
                "description": "Discover Bangalore's vibrant street art scene from Indiranagar to Church Street. Learn about the artists and stories behind the murals.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 1200, "rating": 4.92, "reviews": 65, "favorite": True,
                "lat": 12.9716, "lng": 77.5946,
                "images": [
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
                    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
                ],
            },
            {
                "host": host1,
                "title": "South Indian Filter Coffee Masterclass",
                "description": "Learn the art of making perfect filter kaapi from bean selection to the signature frothy pour. Includes tasting of 5 single-origin coffees.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 1500, "rating": 4.99, "reviews": 112, "favorite": True,
                "lat": 12.9352, "lng": 77.6245,
                "images": [
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
                    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Night Photography Walk",
                "description": "Capture Bangalore's stunning nighttime architecture and neon-lit streets. Learn long exposure, light trails, and night portrait techniques.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 2200, "rating": 4.88, "reviews": 37, "favorite": False,
                "lat": 12.9780, "lng": 77.6200,
                "images": [
                    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
                    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Hip Hop Dancing lesson",
                "description": "Learn the basics of Hip Hop dancing, everywhere.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 3000, "rating": 5.00, "reviews": 28, "favorite": True,
                "lat": 12.9507, "lng": 77.5848,
                "images": [
                    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
                    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Urban Farming & Farm-to-Table Lunch",
                "description": "Visit a rooftop urban farm in the heart of the city. Harvest organic vegetables and cook a farm-to-table lunch with a professional chef.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 2800, "rating": 4.94, "reviews": 53, "favorite": True,
                "lat": 12.9750, "lng": 77.6000,
                "images": [
                    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Cycling Tour of Historic Mysore Road",
                "description": "Pedal through tree-lined avenues and discover hidden temples, colonial-era bungalows, and local chai stalls on this guided cycling tour.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 900, "rating": 4.87, "reviews": 141, "favorite": False,
                "lat": 12.9560, "lng": 77.5750,
                "images": [
                    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Watercolor Painting at Cubbon Park",
                "description": "Paint the lush greenery and heritage buildings of Cubbon Park with a professional watercolor artist. All art supplies provided. Take your painting home.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 1800, "rating": 4.96, "reviews": 31, "favorite": True,
                "lat": 12.9763, "lng": 77.5929,
                "images": [
                    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
                    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Silk Saree Weaving Workshop",
                "description": "Visit a traditional handloom weaving center and learn the intricate process of creating Bangalore silk sarees. Try weaving on a hand-operated loom.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 3500, "rating": 4.91, "reviews": 19, "favorite": True,
                "lat": 12.9352, "lng": 77.6245,
                "images": [
                    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
                    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
                ],
            },
        ]

        # ==================== SERVICES ====================
        # Services in South Goa
        service_data_goa = [
            {
                "host": host1,
                "title": "Goa Photo Shoot by Samuel",
                "description": "Professional outdoor photography session in scenic South Goa locations. Perfect for couples, families, and solo travelers wanting stunning vacation portraits.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 7500, "rating": 4.85, "reviews": 62, "favorite": True,
                "lat": 15.2993, "lng": 74.0855,
                "images": [
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Holistic Yoga Class by Manoj",
                "description": "A deeply rejuvenating holistic yoga session combining Hatha, Vinyasa, and Yin styles in a peaceful garden setting overlooking paddy fields.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 1200, "rating": 4.92, "reviews": 88, "favorite": True,
                "lat": 15.2800, "lng": 74.0700,
                "images": [
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Mobility and Movement Training by Shane",
                "description": "Functional movement training session focused on mobility, flexibility, and body control. Suitable for athletes and fitness enthusiasts.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 1500, "rating": 4.78, "reviews": 34, "favorite": False,
                "lat": 15.3100, "lng": 74.0900,
                "images": [
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
                    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Romantic Portraits and Films by Sherwyn",
                "description": "Cinematic couple portraits and short films captured on beautiful Goa beaches and heritage locations. Includes edited photos and a highlight reel.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 5500, "rating": 4.80, "reviews": 45, "favorite": True,
                "lat": 15.2700, "lng": 74.0600,
                "images": [
                    "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Strength and Mobility Training by Shane",
                "description": "Build functional strength through guided resistance training combined with dynamic mobility work. Beach or indoor sessions available.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 720, "rating": 4.75, "reviews": 29, "favorite": False,
                "lat": 15.3200, "lng": 74.0800,
                "images": [
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Paperrose Art Studio Photos for All Occasions",
                "description": "Professional studio photography for portraits, headshots, and special occasions. Includes styling consultation, multiple backdrops, and edited digital copies.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 9600, "rating": 4.88, "reviews": 51, "favorite": True,
                "lat": 15.2900, "lng": 74.0750,
                "images": [
                    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
                    "https://images.unsplash.com/photo-1513031300226-c8fb12de9ade?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Portrait and Fashion Shoots by Mayur",
                "description": "High-end fashion and portrait photography by an award-winning photographer. Includes wardrobe consultation, makeup tips, and 30+ edited shots.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 4000, "rating": 4.82, "reviews": 67, "favorite": False,
                "lat": 15.3050, "lng": 74.0650,
                "images": [
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Sunset Beach Meditation by Priya",
                "description": "A guided meditation and breathwork session on a secluded South Goa beach during golden hour. Deeply calming and spiritually uplifting.",
                "city": "South Goa", "state": "Goa", "country": "India",
                "price": 700, "rating": 4.95, "reviews": 103, "favorite": True,
                "lat": 15.2600, "lng": 74.0500,
                "images": [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                ],
            },
        ]

        # Services in Bengaluru
        service_data_blr = [
            {
                "host": host1,
                "title": "Creative Candid Photography by Abinash",
                "description": "Natural, unposed candid photography for events, pre-weddings, and personal branding. Capturing authentic moments with an artistic eye.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 4999, "rating": 4.90, "reviews": 85, "favorite": True,
                "lat": 12.9716, "lng": 77.5946,
                "images": [
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Concert and Event Images by Pradipta",
                "description": "Professional event and concert photography with fast turnaround. Specializing in live music, corporate events, and cultural festivals.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 3999, "rating": 4.85, "reviews": 58, "favorite": True,
                "lat": 12.9780, "lng": 77.6200,
                "images": [
                    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Intimate, Raw, Honest Photos by Bhagyashree",
                "description": "Documentary-style photography that tells your story authentically. Perfect for maternity, newborn, and family milestone sessions.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 10000, "rating": 4.95, "reviews": 72, "favorite": True,
                "lat": 12.9352, "lng": 77.6245,
                "images": [
                    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800",
                    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Bridal and Party Looks by Sandya",
                "description": "Complete bridal and party makeup and styling service. Includes trial session, day-of application, hairstyling, and touch-up kit. South Indian and fusion looks.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 4000, "rating": 4.80, "reviews": 41, "favorite": False,
                "lat": 12.9507, "lng": 77.5848,
                "images": [
                    "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800",
                    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Luxury Photography, Video & Drone Service by Emeka",
                "description": "Premium multi-format coverage with DSLR, gimbal video, and licensed drone aerial shots. Ideal for real estate, weddings, and corporate content.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 16000, "rating": 4.78, "reviews": 33, "favorite": False,
                "lat": 12.9750, "lng": 77.6000,
                "images": [
                    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
                    "https://images.unsplash.com/photo-1524143986875-3b098d78b363?w=800",
                ],
            },
            {
                "host": host3,
                "title": "Creative Photography by Shank",
                "description": "Artistic and creative photography sessions including conceptual shoots, portfolio building, and editorial-style portraits in unique Bangalore locations.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 10000, "rating": 4.86, "reviews": 47, "favorite": True,
                "lat": 12.9560, "lng": 77.5750,
                "images": [
                    "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
                    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
                ],
            },
            {
                "host": host1,
                "title": "Yoga Therapy by Suman",
                "description": "Therapeutic yoga sessions tailored for stress relief, back pain, and overall wellness. Combines traditional asanas with modern physiotherapy techniques.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 700, "rating": 4.93, "reviews": 156, "favorite": True,
                "lat": 12.9352, "lng": 77.6245,
                "images": [
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                ],
            },
            {
                "host": host2,
                "title": "Personal Fitness Training by Arjun",
                "description": "Customized one-on-one fitness training sessions. Includes body assessment, personalized workout plan, and nutrition guidance.",
                "city": "Bangalore", "state": "Karnataka", "country": "India",
                "price": 1500, "rating": 4.88, "reviews": 94, "favorite": False,
                "lat": 12.9780, "lng": 77.6200,
                "images": [
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
                ],
            },
        ]

        # ---- Insert all listings ----
        all_data = []

        # Experiences today
        for d in experience_data_today:
            d["property_type"] = "Experience"
            d["category"] = "Experiences"
            all_data.append(d)

        # Experiences tomorrow
        for d in experience_data_tomorrow:
            d["property_type"] = "Experience"
            d["category"] = "Experiences"
            all_data.append(d)

        # Services Goa
        for d in service_data_goa:
            d["property_type"] = "Service"
            d["category"] = "Services"
            all_data.append(d)

        # Services Bengaluru
        for d in service_data_blr:
            d["property_type"] = "Service"
            d["category"] = "Services"
            all_data.append(d)

        count = 0
        for data in all_data:
            listing = Listing(
                host_id=data["host"].id,
                title=data["title"],
                description=data["description"],
                property_type=data["property_type"],
                category=data["category"],
                price_per_night=data["price"],
                cleaning_fee=0,
                service_fee_percent=0,
                city=data["city"],
                state=data["state"],
                country=data["country"],
                latitude=data.get("lat", 0),
                longitude=data.get("lng", 0),
                max_guests=data.get("guests", 10),
                bedrooms=1,
                beds=1,
                bathrooms=1,
                rating=data["rating"],
                review_count=data["reviews"],
                is_guest_favorite=data["favorite"],
            )
            db.add(listing)
            db.flush()

            for i, url in enumerate(data["images"]):
                db.add(ListingImage(
                    listing_id=listing.id,
                    url=url,
                    caption=f"{data['title']} - Photo {i+1}",
                    display_order=i,
                ))
            count += 1

        db.commit()
        print(f"[OK] Successfully added {count} experience and service listings!")
        print(f"   - {len(experience_data_today)} 'Happening today' experiences")
        print(f"   - {len(experience_data_tomorrow)} 'Happening tomorrow' experiences")
        print(f"   - {len(service_data_goa)} South Goa services")
        print(f"   - {len(service_data_blr)} Bengaluru services")

    finally:
        db.close()


if __name__ == "__main__":
    add_experiences_and_services()
