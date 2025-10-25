export type UserRole =
  | "buyer"
  | "seller_admin"
  | "seller_staff"
  | "ops_admin";

export type User = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  kyc_status: string;
};

export type Seller = {
  id: string;
  business_name: string;
  tin?: string | null;
  phone: string;
  email?: string | null;
  verified: boolean;
  pickup_location?: unknown;
  address?: string | null;
  created_at: string;
  updated_at: string;
  user: string;
  members: SellerMember[];
};

export type SellerMember = {
  id: number;
  role: "admin" | "staff";
  created_at: string;
  user: User;
};

export type SellerInvitation = {
  id: number;
  email: string;
  phone: string;
  role: "admin" | "staff";
  status: "pending" | "accepted" | "cancelled";
  token: string;
  seller: string;
  seller_name: string;
  created_at: string;
  accepted_at: string | null;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  brand?: string | null;
  description?: string | null;
  unit: string;
  price: string;
  stock: number;
  images: string[];
  seller: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  order: string;
};

export type Order = {
  id: string;
  buyer: string;
  seller: string;
  status: string;
  subtotal: string | null;
  tax: string | null;
  shipping_fee: string | null;
  total: string | null;
  delivery_method: string;
  delivery_address: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type Payment = {
  id: string;
  order: string;
  method: string;
  provider?: string | null;
  tx_ref?: string | null;
  amount: string;
  status: string;
  payload: Record<string, unknown>;
  created_at: string;
};
