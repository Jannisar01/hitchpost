import type { Book } from "./book.ts";
import { startBarberAgent } from "./server.ts";

const demoBook: Book = {
  currency: "USD",
  services: [
    { name: "haircut", durationMinutes: 30, priceCents: 3000 },
    { name: "beard trim", durationMinutes: 15, priceCents: 1500 },
  ],
  // Tuesday to Saturday, 9:00 to 18:00 UTC.
  hours: { 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 18] },
  booked: [],
};

const port = Number(process.env.PORT ?? 41241);
const agent = await startBarberAgent("Main Street Barbers", demoBook, port);
console.log(`Barber agent listening on ${agent.url}`);
