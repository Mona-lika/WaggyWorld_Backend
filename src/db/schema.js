import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
//import { users } from "./schema.js";

//user according to role
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    // Roles: 'user', 'shelter', 'admin'
    role: text("role").notNull().default("user"), 
    isNew: boolean("is_new").default(true), 
    createdAt: timestamp("created_at").defaultNow(),
});

//add new pets
export const pets = pgTable("pets", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    species: text("species").notNull(),
    breed: text("breed").notNull(),
    age: text("age").notNull(),
    gender: text("gender").notNull(), // Male/Female
    description: text("description"),
    // Health info
    vaccinated: text("vaccinated"),
    neutered: text("neutered"),
    dewormed: text("dewormed"),
    medicalIssues: text("medical_issues"),
    // Behavior info
    temperament: text("temperament"),
    goodWithKids: text("good_with_kids"),
    goodWithPets: text("good_with_pets"),
    // Logistics
    location: text("location"),
    adoptionFee: text("adoption_fee"),
    availableFrom: text("available_from"),
    imageUrl: text("image_url").array(), // We will use a placeholder for now
    status: text("status").default("available"), // available, adopted
    shelterId: integer("shelter_id").references(() => users.id), // Links to the Shelter
    createdAt: timestamp("created_at").defaultNow(),
});

//creae donation post
export const donations = pgTable("donations", {
    id: serial("id").primaryKey(),
    shelterId: integer("shelter_id").references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    // New Fields
    donationType: text("donation_type").notNull(), // 'Fund' or 'Supplies'
    targetAmount: text("target_amount"), 
    suppliesCategory: text("supplies_category"), // Medical, Food, etc.
    startDate: text("start_date"),
    endDate: text("end_date"),
    imageUrls: text("image_urls").array(), // Multi-image support
    createdAt: timestamp("created_at").defaultNow(),
});

//Adoption Application
export const adoptionApplications = pgTable("adoption_applications", {
    id: serial("id").primaryKey(),
    petId: integer("pet_id").references(() => pets.id),
    adopterId: integer("adopter_id").references(() => users.id),
    shelterId: integer("shelter_id").references(() => users.id),
    fullName: text("full_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    address: text("address").notNull(),
    homeType: text("home_type"),
    isOwner: text("is_owner"),
    landlordPermission: text("landlord_permission"),
    hasYard: text("has_yard"),
    pastExperience: text("past_experience"),
    hasCurrentPets: text("has_current_pets"),
    currentPetsStatus: text("current_pets_status"),
    aloneHours: text("alone_hours"),
    primaryCaretaker: text("primary_caretaker"),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    rejectionReason: text("rejection_reason"),
    visitDate: text("visit_date"),
});

//book supplies drop-off 
export const supplyBookings = pgTable("supply_bookings", {
    id: serial("id").primaryKey(),
    donationId: integer("donation_id").references(() => donations.id),
    userId: integer("user_id").references(() => users.id),
    dropoffDate: text("dropoff_date").notNull(),
    status: text("status").default("pending"), // pending, completed
    createdAt: timestamp("created_at").defaultNow(),
});

// Table for pets owned by users
export const myPets = pgTable("my_pets", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    name: text("name").notNull(),
    species: text("species"),
    breed: text("breed"),
    gender: text("gender"),
    age: text("age"),
    imageUrl: text("image_url"), // Cloudinary link
    lastVaccine: text("last_vaccine"),
    nextVaccine: text("next_vaccine"),
    lastVetVisit: text("last_vet_visit"),
    nextVetVisit: text("next_vet_visit"),
    allergies: text("allergies"),
    medicalConditions: text("medical_conditions"),
    neutered: text("neutered"),
    allowNotifications: boolean("allow_notifications").default(true),
    caretakerEmail: text("caretaker_email"),
    inviteCode: text("invite_code"),
});

// Table for Appointments (Vaccination/Vet)
export const appointments = pgTable("appointments", {
    id: serial("id").primaryKey(),
    petId: integer("pet_id").references(() => myPets.id),
    title: text("title").notNull(), // e.g. Rabies Vaccine
    date: text("date").notNull(),
    type: text("type").notNull(), // 'past' or 'upcoming'
});

// Table for Meal Schedules
export const mealSchedules = pgTable("meal_schedules", {
    id: serial("id").primaryKey(),
    petId: integer("pet_id").references(() => myPets.id),
    mealName: text("meal_name").notNull(), // e.g. Breakfast
    time: text("time").notNull(), // e.g. 08:00 AM
});