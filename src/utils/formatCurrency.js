export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

export const formatPercentage = (percentage, decimals = 1) => {
  return `${percentage.toFixed(decimals)}%`;
};