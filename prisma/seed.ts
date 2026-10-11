import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

// Returns a date `days` from now at the given IST time, so seeded
// "upcoming" events stay upcoming whenever the seed is run.
function at(days: number, hour: number, minute = 0) {
  const d = new Date(Date.now() + days * DAY);
  const ist = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const offset = d.getTime() - ist.getTime();
  ist.setHours(hour, minute, 0, 0);
  return new Date(ist.getTime() + offset);
}

// Sample images ship with the app (public/images/events) so they load on any network
const img = (name: string) => `/images/events/${name}.svg`;

const events = [
  { title: "Jazz Night by the Lake", category: "Music", city: "Coimbatore", startsAt: at(3, 18, 30), price: 499, imageUrl: img("jazz-night"), isActive: true,
    description: "An intimate evening of live jazz standards with a local quartet. Seating is first come, first served." },
  { title: "Indie Night Live", category: "Music", city: "Bengaluru", startsAt: at(6, 20), price: 799, imageUrl: img("indie-night"), isActive: true,
    description: "Three up-and-coming indie bands share one stage for a night of original music." },
  { title: "Carnatic Morning Concert", category: "Music", city: "Chennai", startsAt: at(10, 7, 30), price: 0, imageUrl: img("carnatic"), isActive: true,
    description: "A free morning recital of classical Carnatic music by students of the city music academy." },
  { title: "Pottery for Beginners", category: "Workshop", city: "Coimbatore", startsAt: at(4, 10), price: 1200, imageUrl: img("pottery"), isActive: true,
    description: "Get your hands dirty and learn wheel throwing basics. All materials included; take home two pieces." },
  { title: "Intro to Watercolours", category: "Workshop", city: "Pune", startsAt: at(8, 15), price: 950, imageUrl: img("watercolour"), isActive: true,
    description: "A relaxed two-hour session on washes, layering and simple landscapes. Brushes and paper provided." },
  { title: "Startup Pitch Workshop", category: "Workshop", city: "Bengaluru", startsAt: at(12, 11), price: 150000, imageUrl: img("pitch"), isActive: true,
    description: "A full-day intensive for founders: storytelling, financials and live feedback from investors." },
  { title: "Street Food Fair", category: "Food", city: "Chennai", startsAt: at(2, 17), price: 0, imageUrl: img("street-food"), isActive: true,
    description: "Forty stalls of chaat, dosas, kebabs and desserts. Entry is free; pay at the stalls." },
  { title: "Filter Coffee Festival", category: "Food", city: "Coimbatore", startsAt: at(9, 9), price: 299, imageUrl: img("coffee"), isActive: true,
    description: "Taste brews from estates across the Nilgiris and learn the art of the perfect decoction." },
  { title: "Monsoon Food Night", category: "Food", city: "Mumbai", startsAt: at(14, 19, 30), price: 650, imageUrl: img("food-night"), isActive: true,
    description: "Hot pakoras, cutting chai and live music by the sea. A night celebrating Mumbai's rainy-season food." },
  { title: "City 10K Run", category: "Sports", city: "Pune", startsAt: at(5, 6), price: 700, imageUrl: img("run"), isActive: true,
    description: "A timed 10 km run through the old city. Includes a medal, T-shirt and breakfast." },
  { title: "Weekend Cricket League", category: "Sports", city: "Mumbai", startsAt: at(7, 8), price: 2500, imageUrl: img("cricket"), isActive: true,
    description: "Register your team of eleven for a two-day tennis-ball cricket tournament." },
  { title: "Kids Science Carnival", category: "Kids", city: "Bengaluru", startsAt: at(11, 10), price: 350, imageUrl: img("science"), isActive: true,
    description: "Hands-on experiments, slime making and a planetarium show for ages 6 to 12." },
  // inactive (hidden from visitors)
  { title: "Rooftop Night Unplugged", category: "Music", city: "Coimbatore", startsAt: at(5, 21), price: 599, imageUrl: img("rooftop"), isActive: false,
    description: "Acoustic sets on a rooftop under the stars. Postponed until further notice." },
  { title: "Storytelling Hour", category: "Kids", city: "Chennai", startsAt: at(4, 16), price: 0, imageUrl: img("stories"), isActive: false,
    description: "Folk tales read aloud for little ones aged 3 to 7, with puppets and songs." },
  // past (hidden from visitors)
  { title: "Football Fan Screening", category: "Sports", city: "Coimbatore", startsAt: at(-6, 19), price: 200, imageUrl: img("football"), isActive: true,
    description: "Watch the big match on a giant screen with fellow fans. Snacks available." },
] as const;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@events.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";

  await prisma.cardDesign.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.event.deleteMany();

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
  });

  await prisma.event.createMany({ data: events.map((e) => ({ ...e })) });

  console.log(`Seeded ${events.length} events and admin ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
