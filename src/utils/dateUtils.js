import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const formatDate = (date) => {
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatShortDate = (date) => {
  return format(new Date(date), "MM/dd/yyyy");
};

export const formatMonthYear = (date) => {
  return format(new Date(date), "MMMM yyyy");
};

export const getCurrentMonth = () => {
  return format(new Date(), "yyyy-MM");
};

export const getMonthStart = (monthString) => {
  const date = new Date(monthString + "-01");
  return startOfMonth(date);
};

export const getMonthEnd = (monthString) => {
  const date = new Date(monthString + "-01");
  return endOfMonth(date);
};

export const getLastSixMonths = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    months.push(format(date, "yyyy-MM"));
  }
  return months;
};