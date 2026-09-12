export type TripCard = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  location: string;
  days: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  operator: string;
  badge: "VERIFIED" | "TRUSTED";
  seats: number;
  featured?: boolean;
};

export type VehicleCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  location: string;
  seats: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  fourByFour: boolean;
  driver: boolean;
  badge: "VERIFIED" | "TRUSTED";
};

export const destinations = [
  { name: "Maasai Mara", count: "124 trips", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=85", description: "Golden plains, big cats and unforgettable safari mornings." },
  { name: "Diani Beach", count: "86 trips", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85", description: "Powder-soft sand, warm turquoise water and coastal calm." },
  { name: "Amboseli", count: "68 trips", image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=900&q=85", description: "Elephants beneath the timeless silhouette of Kilimanjaro." },
  { name: "Mount Kenya", count: "52 trips", image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?auto=format&fit=crop&w=900&q=85", description: "High-altitude trails, cool forests and wide-open skies." }
];

export const trips: TripCard[] = [
  { id: "trip-mara", slug: "mara-golden-hour-safari", name: "Mara Golden Hour Safari", destination: "Maasai Mara", location: "Nairobi → Maasai Mara", days: 3, price: 28500, rating: 4.9, reviews: 48, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85", category: "Safari", operator: "Savanna & Soul", badge: "TRUSTED", seats: 8, featured: true },
  { id: "trip-diani", slug: "diani-coast-reset", name: "Diani Coast Reset", destination: "Diani", location: "Nairobi → Diani", days: 4, price: 34900, rating: 4.8, reviews: 32, image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85", category: "Beach", operator: "Coastline Collective", badge: "VERIFIED", seats: 12, featured: true },
  { id: "trip-amboseli", slug: "amboseli-under-the-mountain", name: "Amboseli Under the Mountain", destination: "Amboseli", location: "Nairobi → Amboseli", days: 2, price: 22000, rating: 4.7, reviews: 27, image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=1200&q=85", category: "Wildlife", operator: "Open Road Kenya", badge: "TRUSTED", seats: 6, featured: true },
  { id: "trip-nakuru", slug: "rift-valley-weekender", name: "Rift Valley Weekender", destination: "Nakuru", location: "Nairobi → Nakuru", days: 2, price: 14800, rating: 4.6, reviews: 19, image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=85", category: "Road Trip", operator: "Nia Adventures", badge: "VERIFIED", seats: 14 },
  { id: "trip-samburu", slug: "samburu-wild-north", name: "Samburu: Wild North", destination: "Samburu", location: "Nairobi → Samburu", days: 4, price: 41800, rating: 4.9, reviews: 16, image: "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1200&q=85", category: "Adventure", operator: "Wild Thread Expeditions", badge: "TRUSTED", seats: 7 }
];

export const vehicles: VehicleCard[] = [
  { id: "vehicle-lc", slug: "safari-land-cruiser-kcg", name: "Safari Land Cruiser KCG", type: "Safari Land Cruiser", location: "Nairobi", seats: 7, price: 12500, rating: 4.9, reviews: 41, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=85", fourByFour: true, driver: true, badge: "TRUSTED" },
  { id: "vehicle-hiace", slug: "toyota-hiace-premium", name: "Toyota Hiace Premium", type: "Safari Van", location: "Nairobi", seats: 12, price: 7800, rating: 4.7, reviews: 28, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85", fourByFour: false, driver: true, badge: "VERIFIED" },
  { id: "vehicle-suv", slug: "executive-suv-4x4", name: "Executive SUV 4x4", type: "SUV", location: "Mombasa", seats: 5, price: 9500, rating: 4.8, reviews: 18, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85", fourByFour: true, driver: false, badge: "VERIFIED" }
];

export const reviews = [
  { quote: "For the first time, booking a safari felt as easy as booking a flight. Every detail was clear and our guide was brilliant.", name: "Wanjiku M.", trip: "Maasai Mara, May 2025", initials: "WM", color: "bg-sun" },
  { quote: "I found a verified Land Cruiser in minutes, chatted with the owner and had the receipt in my inbox before lunch.", name: "Daniel O.", trip: "Amboseli, April 2025", initials: "DO", color: "bg-leaf" },
  { quote: "The Coastline Collective trip was beautifully organised. TourLink made it simple for our group of ten to travel together.", name: "Amina K.", trip: "Diani, March 2025", initials: "AK", color: "bg-lagoon" }
];

export const formatKES = (value: number) => `KES ${value.toLocaleString("en-KE")}`;
