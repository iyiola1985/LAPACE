export type QuoteBasketItem = {
  id: string;
  name: string;
  kind: "material" | "pro";
};

export type QuoteRequest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  items: QuoteBasketItem[];
  status: "new" | "contacted" | "closed";
  createdAt: string;
};
