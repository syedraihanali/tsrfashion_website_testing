const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatCurrency = (value: number) => {
  return currencyFormatter.format(value);
};

export const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return dateFormatter.format(date);
};
