"""
Seed script — populates the database with diverse sample data.
Run automatically on first startup when the database is empty.
"""
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, Listing, ListingImage, Amenity, Booking, Review, Wishlist,
    listing_amenities
)
from app.services.auth_service import hash_password


def seed_database(db: Session):
    """Seed the database with sample data if it's empty."""
    if db.query(User).first():
        return  # Already seeded

    # ==================== USERS ====================
    users = [
        User(
            email="alice@example.com",
            name="Alice Johnson",
            password_hash=hash_password("password123"),
            avatar_url="https://ui-avatars.com/api/?name=Alice+Johnson&background=FF385C&color=fff&size=128",
            bio="Superhost and travel enthusiast. I love sharing my beautiful homes with guests from around the world.",
            is_superhost=True,
        ),
        User(
            email="bob@example.com",
            name="Bob Smith",
            password_hash=hash_password("password123"),
            avatar_url="https://ui-avatars.com/api/?name=Bob+Smith&background=00A699&color=fff&size=128",
            bio="Architecture lover and host of unique urban spaces.",
            is_superhost=False,
        ),
        User(
            email="charlie@example.com",
            name="Charlie Davis",
            password_hash=hash_password("password123"),
            avatar_url="https://ui-avatars.com/api/?name=Charlie+Davis&background=FC642D&color=fff&size=128",
            bio="Avid traveler always looking for the next adventure.",
            is_superhost=False,
        ),
    ]
    db.add_all(users)
    db.flush()

    # ==================== AMENITIES ====================
    amenities_data = [
        ("Wifi", "📶", "Essentials"),
        ("Kitchen", "🍳", "Essentials"),
        ("Free parking", "🅿️", "Essentials"),
        ("Air conditioning", "❄️", "Essentials"),
        ("Washer", "🧺", "Essentials"),
        ("TV", "📺", "Essentials"),
        ("Pool", "🏊", "Features"),
        ("Hot tub", "♨️", "Features"),
        ("Fire pit", "🔥", "Features"),
        ("BBQ grill", "🍖", "Features"),
        ("Dedicated workspace", "💻", "Features"),
        ("Gym", "🏋️", "Features"),
        ("Beach access", "🏖️", "Features"),
        ("Mountain view", "🏔️", "Features"),
        ("Lake access", "🛶", "Features"),
        ("Smoke alarm", "🔔", "Safety"),
        ("First aid kit", "🩹", "Safety"),
        ("Fire extinguisher", "🧯", "Safety"),
        ("Carbon monoxide alarm", "⚠️", "Safety"),
        ("Self check-in", "🔑", "Convenience"),
        ("Luggage dropoff allowed", "🧳", "Convenience"),
        ("Long term stays allowed", "📅", "Convenience"),
        ("EV charger", "🔌", "Features"),
        ("Pet friendly", "🐾", "Features"),
    ]
    amenities = []
    for name, icon, category in amenities_data:
        a = Amenity(name=name, icon=icon, category=category)
        amenities.append(a)
        db.add(a)
    db.flush()

    # Helper to get amenity by index
    def get_amenities(*indices):
        return [amenities[i] for i in indices]

    # ==================== LISTINGS ====================
    listings_data = [
        {
            "host": users[0],  # Alice
            "title": "Oceanfront Villa with Infinity Pool",
            "description": "Wake up to the sound of waves in this stunning beachfront villa. Features floor-to-ceiling windows, a private infinity pool overlooking the Pacific, and direct beach access. The open-concept living space seamlessly blends indoor and outdoor living. Perfect for families or groups looking for a luxurious coastal getaway.\n\nThe villa includes a fully equipped gourmet kitchen, spacious outdoor dining area, and a private path to the pristine sandy beach. Sunsets from the infinity pool are simply magical.",
            "property_type": "Entire home",
            "category": "Beach",
            "price": 450,
            "cleaning": 150,
            "city": "Malibu",
            "state": "California",
            "country": "United States",
            "lat": 34.0259,
            "lng": -118.7798,
            "guests": 8,
            "bedrooms": 4,
            "beds": 5,
            "baths": 3.5,
            "rating": 4.95,
            "reviews": 128,
            "favorite": True,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 6, 12, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1499793983394-12402c098a4b?w=1200",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Cozy Mountain Cabin with Hot Tub",
            "description": "Escape to this charming log cabin nestled in the mountains. Enjoy stunning panoramic views from the wraparound deck while soaking in the private hot tub under the stars. The interior features rustic wood finishes, a stone fireplace, and modern amenities.\n\nPerfect for couples or small families seeking a peaceful mountain retreat. Hiking trails start right from the front door, and the ski resort is just 15 minutes away.",
            "property_type": "Entire home",
            "category": "Cabins",
            "price": 225,
            "cleaning": 75,
            "city": "Aspen",
            "state": "Colorado",
            "country": "United States",
            "lat": 39.1911,
            "lng": -106.8175,
            "guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2,
            "rating": 4.89,
            "reviews": 95,
            "favorite": True,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 7, 8, 13, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200",
                "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1200",
                "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=1200",
                "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Modern Loft in Downtown Manhattan",
            "description": "Stylish industrial loft in the heart of SoHo. This beautifully designed space features exposed brick walls, 16-foot ceilings, oversized windows flooding the space with natural light, and curated contemporary art throughout.\n\nSteps from the best restaurants, galleries, and boutiques in New York City. The loft includes a chef's kitchen with premium appliances, a dedicated workspace, and a luxurious rainfall shower.",
            "property_type": "Entire home",
            "category": "Design",
            "price": 350,
            "cleaning": 100,
            "city": "New York",
            "state": "New York",
            "country": "United States",
            "lat": 40.7231,
            "lng": -73.9986,
            "guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2,
            "rating": 4.82,
            "reviews": 67,
            "favorite": False,
            "amenity_indices": [0, 1, 3, 4, 5, 10, 15, 16, 17, 18, 19, 20],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Luxury Treehouse Retreat",
            "description": "Live among the treetops in this architectural marvel. This luxury treehouse sits 40 feet above the forest floor, offering a truly unique experience. Features include a glass-bottom observation area, outdoor rain shower, and a private suspension bridge connecting to a meditation deck.\n\nSurrounded by ancient redwoods, this is the ultimate nature escape without sacrificing comfort. Heated floors, premium bedding, and a gourmet kitchenette ensure a pampered stay.",
            "property_type": "Entire home",
            "category": "Treehouses",
            "price": 375,
            "cleaning": 100,
            "city": "Guerneville",
            "state": "California",
            "country": "United States",
            "lat": 38.5018,
            "lng": -122.9952,
            "guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "baths": 1,
            "rating": 4.97,
            "reviews": 203,
            "favorite": True,
            "amenity_indices": [0, 1, 3, 13, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
                "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=1200",
                "https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=1200",
                "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1200",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Lakeside Cottage with Private Dock",
            "description": "Charming lakeside cottage with your own private dock and canoe. Wake up to misty mornings over the lake, enjoy fishing right from the dock, or take the canoe out for a sunset paddle.\n\nThe cottage has been lovingly renovated with a modern farmhouse aesthetic — shiplap walls, a farmhouse sink, and cozy reading nooks. The screened-in porch is perfect for evening gatherings with the sound of loons in the background.",
            "property_type": "Entire home",
            "category": "Lakefront",
            "price": 195,
            "cleaning": 60,
            "city": "Lake Placid",
            "state": "New York",
            "country": "United States",
            "lat": 44.2795,
            "lng": -73.9799,
            "guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "baths": 2,
            "rating": 4.91,
            "reviews": 84,
            "favorite": True,
            "amenity_indices": [0, 1, 2, 4, 5, 8, 9, 14, 15, 16, 17, 18, 23],
            "images": [
                "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
                "https://images.unsplash.com/photo-1505916349660-8d91a382ae72?w=1200",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Desert Dome Under the Stars",
            "description": "Experience the magic of the desert in this geodesic dome with a transparent ceiling for stargazing. Located on 5 acres of pristine desert landscape, this unique stay offers unobstructed views of the Milky Way.\n\nThe dome features a king bed, climate control, an outdoor soaking tub, and a fire pit area. The nearest town is 20 minutes away, ensuring complete peace and solitude. Solar-powered and eco-friendly.",
            "property_type": "Entire home",
            "category": "Desert",
            "price": 285,
            "cleaning": 80,
            "city": "Joshua Tree",
            "state": "California",
            "country": "United States",
            "lat": 34.1347,
            "lng": -116.3131,
            "guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "baths": 1,
            "rating": 4.93,
            "reviews": 156,
            "favorite": True,
            "amenity_indices": [0, 3, 7, 8, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200",
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
                "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200",
                "https://images.unsplash.com/photo-1532323544230-7191fd1a5d0e?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Historic Countryside Manor",
            "description": "Step back in time at this meticulously restored 18th-century manor house. Set on 30 acres of rolling countryside, this estate features formal gardens, a working vineyard, and breathtaking views.\n\nEach of the five bedrooms has been individually decorated with period antiques and modern comforts. The grand dining room seats 12, and the library houses over 2,000 volumes. Afternoon tea on the terrace is an experience not to be missed.",
            "property_type": "Entire home",
            "category": "Countryside",
            "price": 520,
            "cleaning": 200,
            "city": "Cotswolds",
            "state": "Gloucestershire",
            "country": "United Kingdom",
            "lat": 51.8330,
            "lng": -1.8433,
            "guests": 10,
            "bedrooms": 5,
            "beds": 7,
            "baths": 4,
            "rating": 4.88,
            "reviews": 42,
            "favorite": False,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 8, 9, 15, 16, 17, 18, 21, 23],
            "images": [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
                "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
                "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Stunning Cliffside Villa in Santorini",
            "description": "Perched on the caldera cliffs of Oia, this whitewashed villa offers iconic Santorini views. Watch the world-famous sunset from your private terrace while enjoying a glass of local wine.\n\nThe villa features traditional Cycladic architecture with modern luxury — a private plunge pool, outdoor dining area, and interiors decorated with local art. Two bedrooms with en-suite bathrooms provide comfort and privacy.",
            "property_type": "Entire home",
            "category": "Amazing views",
            "price": 680,
            "cleaning": 150,
            "city": "Oia",
            "state": "Santorini",
            "country": "Greece",
            "lat": 36.4618,
            "lng": 25.3753,
            "guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2,
            "rating": 4.96,
            "reviews": 178,
            "favorite": True,
            "amenity_indices": [0, 1, 3, 4, 5, 6, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
                "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
                "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Tropical Overwater Bungalow",
            "description": "Experience paradise in this stunning overwater bungalow with a glass floor panel revealing the coral reef below. Step directly from your private deck into crystal-clear turquoise waters.\n\nThe bungalow features a king-size bed, rainfall shower, and a sundeck with loungers. Enjoy complimentary kayaks and snorkeling gear. The sunset views over the Indian Ocean are absolutely breathtaking.",
            "property_type": "Entire home",
            "category": "Tropical",
            "price": 890,
            "cleaning": 200,
            "city": "Bora Bora",
            "state": "Leeward Islands",
            "country": "French Polynesia",
            "lat": -16.5004,
            "lng": -151.7415,
            "guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "baths": 1,
            "rating": 4.99,
            "reviews": 312,
            "favorite": True,
            "amenity_indices": [0, 1, 3, 5, 6, 12, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200",
                "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200",
                "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200",
                "https://images.unsplash.com/photo-1559827291-baf25fa2a6b5?w=1200",
                "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Secluded Tiny Home in the Redwoods",
            "description": "Disconnect and recharge in this architect-designed tiny home surrounded by towering redwood trees. Despite its compact size, every inch has been thoughtfully designed — from the lofted sleeping area to the fold-out dining table.\n\nThe outdoor space includes a cedar hot tub, fire pit, and hammock. Large skylights bring the forest canopy inside, and the wraparound deck is perfect for morning yoga.",
            "property_type": "Entire home",
            "category": "Tiny homes",
            "price": 165,
            "cleaning": 50,
            "city": "Big Sur",
            "state": "California",
            "country": "United States",
            "lat": 36.2704,
            "lng": -121.8081,
            "guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "baths": 1,
            "rating": 4.94,
            "reviews": 89,
            "favorite": False,
            "amenity_indices": [0, 1, 3, 7, 8, 13, 15, 16, 17, 18, 19],
            "images": [
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
                "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200",
                "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200",
                "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=1200",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Penthouse with Panoramic City Views",
            "description": "This 50th-floor penthouse offers 360-degree views of the city skyline. Floor-to-ceiling windows wrap around the entire unit, providing stunning views day and night. Watch the city lights come alive from your private rooftop terrace.\n\nThe ultra-modern interior features designer furniture, a state-of-the-art kitchen, smart home system, and a spa-like master bathroom with a soaking tub overlooking the skyline.",
            "property_type": "Entire home",
            "category": "Amazing views",
            "price": 750,
            "cleaning": 175,
            "city": "Dubai",
            "state": "Dubai",
            "country": "United Arab Emirates",
            "lat": 25.2048,
            "lng": 55.2708,
            "guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "baths": 3,
            "rating": 4.87,
            "reviews": 56,
            "favorite": False,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 17, 18, 19, 20],
            "images": [
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
                "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Rustic Vineyard Farmhouse in Tuscany",
            "description": "Live la dolce vita in this beautifully restored 16th-century farmhouse surrounded by rolling vineyards in the heart of Chianti. The property includes a private olive grove, swimming pool, and outdoor wood-fired pizza oven.\n\nInside, original features like terracotta floors and exposed wooden beams blend with modern comforts. The spacious country kitchen is a cook's dream, and the wine cellar is stocked with local vintages.",
            "property_type": "Entire home",
            "category": "Vineyards",
            "price": 420,
            "cleaning": 120,
            "city": "Greve in Chianti",
            "state": "Tuscany",
            "country": "Italy",
            "lat": 43.5833,
            "lng": 11.3167,
            "guests": 8,
            "bedrooms": 4,
            "beds": 5,
            "baths": 3,
            "rating": 4.92,
            "reviews": 134,
            "favorite": True,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 6, 8, 9, 15, 16, 17, 18, 21, 23],
            "images": [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
                "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200",
                "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Ski-In/Ski-Out Chalet",
            "description": "Hit the slopes from your doorstep at this premium ski chalet. After a day on the mountain, warm up by the massive stone fireplace or soak in the outdoor heated pool with mountain views.\n\nThe chalet sleeps 10 comfortably across 5 bedrooms, each with its own bathroom. The game room features a pool table and home theater. A private chef can be arranged for your stay.",
            "property_type": "Entire home",
            "category": "Skiing",
            "price": 950,
            "cleaning": 250,
            "city": "Whistler",
            "state": "British Columbia",
            "country": "Canada",
            "lat": 50.1163,
            "lng": -122.9574,
            "guests": 10,
            "bedrooms": 5,
            "beds": 7,
            "baths": 5,
            "rating": 4.85,
            "reviews": 38,
            "favorite": False,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 19, 23],
            "images": [
                "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1200",
                "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
                "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200",
                "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=1200",
            ],
        },
        {
            "host": users[0],  # Alice
            "title": "Charming Studio in Le Marais, Paris",
            "description": "Discover Paris from this perfectly located studio in the trendy Le Marais district. The apartment has been tastefully decorated in classic Parisian style with modern touches — herringbone parquet floors, ornate moldings, and designer furniture.\n\nJust steps from Place des Vosges, countless cafés, and the Seine. The balcony offers a quintessential Parisian rooftop view. Perfect for couples seeking a romantic city break.",
            "property_type": "Entire home",
            "category": "Design",
            "price": 180,
            "cleaning": 50,
            "city": "Paris",
            "state": "Île-de-France",
            "country": "France",
            "lat": 48.8566,
            "lng": 2.3522,
            "guests": 2,
            "bedrooms": 1,
            "beds": 1,
            "baths": 1,
            "rating": 4.86,
            "reviews": 215,
            "favorite": False,
            "amenity_indices": [0, 1, 3, 4, 5, 10, 15, 16, 17, 18, 19, 20],
            "images": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200",
            ],
        },
        {
            "host": users[1],  # Bob
            "title": "Converted Barn with Pool in Provence",
            "description": "This beautifully converted stone barn sits among lavender fields in the heart of Provence. The renovation preserves original stone walls and wooden beams while adding contemporary comfort — underfloor heating, a modern kitchen, and luxurious bathrooms.\n\nThe private garden features a heated pool, outdoor dining under a pergola draped with wisteria, and a pétanque court. The local village market is a 5-minute walk away.",
            "property_type": "Entire home",
            "category": "Countryside",
            "price": 310,
            "cleaning": 90,
            "city": "Gordes",
            "state": "Provence",
            "country": "France",
            "lat": 43.9115,
            "lng": 5.2004,
            "guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "baths": 2.5,
            "rating": 4.90,
            "reviews": 73,
            "favorite": False,
            "amenity_indices": [0, 1, 2, 3, 4, 5, 6, 9, 15, 16, 17, 18, 21, 23],
            "images": [
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
                "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200",
                "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200",
            ],
        },
    ]

    listings = []
    for data in listings_data:
        listing = Listing(
            host_id=data["host"].id,
            title=data["title"],
            description=data["description"],
            property_type=data["property_type"],
            category=data["category"],
            price_per_night=data["price"],
            cleaning_fee=data["cleaning"],
            service_fee_percent=14,
            city=data["city"],
            state=data["state"],
            country=data["country"],
            latitude=data["lat"],
            longitude=data["lng"],
            max_guests=data["guests"],
            bedrooms=data["bedrooms"],
            beds=data["beds"],
            bathrooms=data["baths"],
            rating=data["rating"],
            review_count=data["reviews"],
            is_guest_favorite=data["favorite"],
        )
        listing.amenities = get_amenities(*data["amenity_indices"])
        db.add(listing)
        db.flush()

        for i, url in enumerate(data["images"]):
            db.add(ListingImage(
                listing_id=listing.id,
                url=url,
                caption=f"{data['title']} - Photo {i+1}",
                display_order=i,
            ))

        listings.append(listing)

    db.flush()

    # ==================== BOOKINGS ====================
    today = datetime.date.today()
    bookings_data = [
        # Past bookings (Charlie stayed at Alice's and Bob's places)
        {
            "listing": listings[0],  # Oceanfront Villa
            "guest": users[2],  # Charlie
            "check_in": today - datetime.timedelta(days=60),
            "check_out": today - datetime.timedelta(days=55),
            "guests": 4,
            "status": "completed",
        },
        {
            "listing": listings[1],  # Mountain Cabin
            "guest": users[2],  # Charlie
            "check_in": today - datetime.timedelta(days=30),
            "check_out": today - datetime.timedelta(days=25),
            "guests": 2,
            "status": "completed",
        },
        {
            "listing": listings[2],  # Manhattan Loft
            "guest": users[2],  # Charlie
            "check_in": today - datetime.timedelta(days=15),
            "check_out": today - datetime.timedelta(days=12),
            "guests": 2,
            "status": "completed",
        },
        # Future bookings (these should block dates)
        {
            "listing": listings[0],  # Oceanfront Villa
            "guest": users[2],  # Charlie
            "check_in": today + datetime.timedelta(days=10),
            "check_out": today + datetime.timedelta(days=15),
            "guests": 6,
            "status": "confirmed",
        },
        {
            "listing": listings[3],  # Treehouse
            "guest": users[1],  # Bob
            "check_in": today + datetime.timedelta(days=5),
            "check_out": today + datetime.timedelta(days=8),
            "guests": 2,
            "status": "confirmed",
        },
        {
            "listing": listings[7],  # Santorini Villa
            "guest": users[2],  # Charlie
            "check_in": today + datetime.timedelta(days=20),
            "check_out": today + datetime.timedelta(days=27),
            "guests": 4,
            "status": "confirmed",
        },
        {
            "listing": listings[4],  # Lakeside Cottage
            "guest": users[0],  # Alice
            "check_in": today + datetime.timedelta(days=14),
            "check_out": today + datetime.timedelta(days=18),
            "guests": 3,
            "status": "confirmed",
        },
        # A cancelled booking
        {
            "listing": listings[5],  # Desert Dome
            "guest": users[2],  # Charlie
            "check_in": today + datetime.timedelta(days=3),
            "check_out": today + datetime.timedelta(days=5),
            "guests": 2,
            "status": "cancelled",
        },
    ]

    for bdata in bookings_data:
        nights = (bdata["check_out"] - bdata["check_in"]).days
        listing = bdata["listing"]
        nightly = listing.price_per_night * nights
        cleaning = listing.cleaning_fee
        service = round(nightly * 0.14, 2)
        total = round(nightly + cleaning + service, 2)

        db.add(Booking(
            listing_id=listing.id,
            guest_id=bdata["guest"].id,
            check_in=bdata["check_in"],
            check_out=bdata["check_out"],
            guests=bdata["guests"],
            total_price=total,
            status=bdata["status"],
        ))

    db.flush()

    # ==================== REVIEWS ====================
    review_comments = [
        ("Absolutely stunning property! The views were even better than the photos. The host was incredibly responsive and made our stay seamless.", 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0),
        ("Perfect getaway. The hot tub under the stars was magical. Would definitely come back!", 4.8, 5.0, 4.5, 5.0, 5.0, 4.5, 4.8),
        ("Great location and beautifully designed space. The kitchen was fully stocked and the neighborhood is vibrant.", 4.7, 4.5, 5.0, 4.5, 5.0, 5.0, 4.5),
        ("A truly unique experience! Sleeping in the treetops was surreal. The attention to detail is remarkable.", 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0),
        ("Peaceful and beautiful. The lake was so calm and the cottage had everything we needed. Kids loved the canoe!", 4.9, 5.0, 4.8, 5.0, 5.0, 5.0, 4.8),
        ("The stargazing from the dome was an unforgettable experience. So peaceful and remote.", 4.9, 5.0, 5.0, 5.0, 4.5, 5.0, 4.8),
        ("Like stepping into a Jane Austen novel! The manor is exquisite and the gardens are breathtaking.", 4.8, 5.0, 4.5, 5.0, 5.0, 5.0, 4.5),
        ("Santorini views that will take your breath away. The private pool was a dream. Best vacation ever!", 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0),
        ("The most romantic overwater bungalow. Crystal clear waters, amazing service, pure paradise.", 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0),
        ("Perfect little escape in the redwoods. The hot tub and fire pit made our evenings special.", 4.9, 5.0, 4.8, 5.0, 5.0, 4.8, 4.8),
        ("Incredible views from every room! The smart home features were a nice touch. Dubai at night from here is spectacular.", 4.8, 4.5, 5.0, 5.0, 5.0, 5.0, 4.5),
        ("Tuscan dreams come true. The vineyard setting, the pool, the pizza oven — perfection.", 4.9, 5.0, 5.0, 4.8, 5.0, 5.0, 4.8),
    ]

    for i, (comment, rating, clean, acc, ci, comm, loc, val) in enumerate(review_comments):
        listing_idx = i % len(listings)
        # Rotate reviewers — Charlie reviews Alice's/Bob's, Bob reviews Alice's
        if listings[listing_idx].host_id == users[2].id:
            reviewer = users[0]
        elif listings[listing_idx].host_id == users[0].id:
            reviewer = users[2]
        else:
            reviewer = users[2]

        db.add(Review(
            listing_id=listings[listing_idx].id,
            user_id=reviewer.id,
            rating=rating,
            cleanliness=clean,
            accuracy=acc,
            check_in_rating=ci,
            communication=comm,
            location_rating=loc,
            value=val,
            comment=comment,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30 - i * 2),
        ))

    # ==================== WISHLISTS ====================
    # Charlie has wishlisted a few places
    for listing_idx in [0, 3, 5, 7, 8]:
        db.add(Wishlist(
            user_id=users[2].id,
            listing_id=listings[listing_idx].id,
        ))

    db.commit()
    print("✅ Database seeded successfully with sample data!")
