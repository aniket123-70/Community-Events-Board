const TIME_ZONE = "Asia/Kolkata";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 150000 -> "₹1,50,000", 0 -> "Free" */
export function formatPrice(rupees: number) {
  return rupees === 0 ? "Free" : inr.format(rupees);
}

const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** -> "Sat, 18 Oct, 6:30 PM" (always IST so server and browser agree) */
export function formatEventDate(value: string | Date) {
  const parts = Object.fromEntries(
    dateParts.formatToParts(new Date(value)).map((p) => [p.type, p.value]),
  );
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`;
}
