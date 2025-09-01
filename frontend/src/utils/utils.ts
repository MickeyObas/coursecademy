export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export function timeAgo(isoDateString: string) {
  const date = new Date(isoDateString); // Parse the ISO string into a Date object
  const now = new Date(); // Current date and time
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000); // Difference in seconds
  const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
          return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
  }

  return "just now";
}