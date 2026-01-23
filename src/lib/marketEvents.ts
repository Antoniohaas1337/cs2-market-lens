/**
 * Significant Counter-Strike market events for chart annotations.
 * These events are shown as dashed vertical lines on price charts
 * to help understand market movements.
 */

export interface MarketEvent {
  date: Date;
  name: string;
  shortName: string;
  description: string;
  type: "update" | "release" | "policy";
}

export const MARKET_EVENTS: MarketEvent[] = [
  {
    date: new Date("2023-03-22"),
    name: "CS2 Limited Test",
    shortName: "CS2 Test",
    description: "Start of the CS2 limited test phase",
    type: "release",
  },
  {
    date: new Date("2023-05-10"),
    name: "Gambling Bans",
    shortName: "ToS Update",
    description: "Steam Terms of Service update causing gambling site restrictions",
    type: "policy",
  },
  {
    date: new Date("2023-09-27"),
    name: "CS2 Release",
    shortName: "CS2 Launch",
    description: "Official release of Counter-Strike 2",
    type: "release",
  },
  {
    date: new Date("2024-02-06"),
    name: "A Call to Arms",
    shortName: "Kilowatt",
    description: "Kilowatt Case & new sticker placement system",
    type: "update",
  },
  {
    date: new Date("2024-10-02"),
    name: "The Armory Update",
    shortName: "Armory",
    description: "Introduction of Charms & Armory Pass",
    type: "update",
  },
  {
    date: new Date("2025-03-31"),
    name: "Spring 2025 Update",
    shortName: "Spring '25",
    description: "New collections: Ascent, Boreal, Radiant",
    type: "update",
  },
  {
    date: new Date("2025-07-16"),
    name: "Trade Revert Update",
    shortName: "Trade Revert",
    description: "7-day return function for accidental trades",
    type: "policy",
  },
  {
    date: new Date("2025-10-23"),
    name: "Covert Trade-Up",
    shortName: "Covert T-Up",
    description: "Revolutionary: Knives/Gloves via Trade-Up",
    type: "update",
  },
];

/**
 * Get events that fall within a date range
 */
export function getEventsInRange(startDate: Date, endDate: Date): MarketEvent[] {
  return MARKET_EVENTS.filter(
    (event) => event.date >= startDate && event.date <= endDate
  );
}

/**
 * Get the color for an event type
 */
export function getEventColor(type: MarketEvent["type"]): string {
  switch (type) {
    case "release":
      return "hsl(187, 85%, 53%)"; // Primary cyan
    case "policy":
      return "hsl(0, 84%, 60%)"; // Red/destructive
    case "update":
      return "hsl(142, 76%, 36%)"; // Green/success
    default:
      return "hsl(215, 20%, 55%)"; // Muted
  }
}
