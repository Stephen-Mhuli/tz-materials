import type {
  Order,
  Payment,
  Product,
  Seller,
  User,
  SellerInvitation,
} from "@/lib/types";

const publicBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const internalBase = process.env.INTERNAL_API_BASE_URL ?? publicBase;

export const apiBaseUrl =
  typeof window === "undefined" ? internalBase : publicBase;

type DRFListResponse<T> = {
  results?: T[];
};

type Tokens = {
  access: string;
  refresh: string;
};

export type LoginPayload = {
  phone: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  phone: string;
  password: string;
  role?: string;
};

type AuthResponse = {
  user: User;
  tokens: Tokens;
};

async function apiRequest(
  path: string,
  options: RequestInit & { token?: string } = {},
) {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let friendly = `Request failed (${response.status} ${response.statusText})`;
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed?.detail ?? parsed?.error ?? parsed?.message;
    } catch {
      /* ignore */
    }
    if (detail) {
      friendly = detail;
    } else if (errorText) {
      friendly = `${friendly}: ${errorText}`;
    }
    const error = new Error(friendly);
    throw error;
  }
  return response;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await apiRequest("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function refreshAccessToken(
  refresh: string,
): Promise<{ access: string }> {
  const response = await apiRequest("/api/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  return response.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${apiBaseUrl}/api/products/`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Failed to load products: ${response.status} ${response.statusText} – ${details}`,
    );
  }

  const data: DRFListResponse<Product> | Product[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await fetch(`${apiBaseUrl}/api/products/${id}/`, {
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Failed to load product: ${response.status} ${response.statusText} – ${details}`,
    );
  }
  return response.json();
}

export type CreateSellerPayload = {
  business_name: string;
  phone: string;
  email?: string;
  tin?: string;
  address?: string;
  verified?: boolean;
};

export async function fetchSellerProfile(token: string): Promise<Seller[]> {
  const response = await apiRequest("/api/sellers/", {
    method: "GET",
    token,
  });
  const data: DRFListResponse<Seller> | Seller[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function createSellerProfile(
  token: string,
  payload: CreateSellerPayload,
): Promise<Seller> {
  const response = await apiRequest("/api/sellers/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export type CreateProductPayload = {
  name: string;
  category: string;
  description?: string;
  unit: string;
  price: number;
  stock: number;
  brand?: string;
};

export async function createProduct(
  token: string,
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await apiRequest("/api/products/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function fetchMyProducts(
  token: string,
  sellerId?: string,
): Promise<Product[]> {
  const path = sellerId
    ? `/api/products/?seller=${encodeURIComponent(sellerId)}`
    : "/api/products/";
  const response = await apiRequest(path, {
    method: "GET",
    token,
  });
  const data: DRFListResponse<Product> | Product[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function updateSellerProfile(
  token: string,
  sellerId: string,
  payload: Partial<CreateSellerPayload>,
): Promise<Seller> {
  const response = await apiRequest(`/api/sellers/${sellerId}/`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function updateProduct(
  token: string,
  productId: string,
  payload: Partial<CreateProductPayload>,
): Promise<Product> {
  const response = await apiRequest(`/api/products/${productId}/`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function deleteProduct(
  token: string,
  productId: string,
): Promise<void> {
  await apiRequest(`/api/products/${productId}/`, {
    method: "DELETE",
    token,
  });
}

export type CreateSellerInvitationPayload = {
  email: string;
  phone: string;
};

export async function fetchSellerInvitations(token: string): Promise<SellerInvitation[]> {
  const response = await apiRequest("/api/seller-invitations/", {
    method: "GET",
    token,
  });
  const data: DRFListResponse<SellerInvitation> | SellerInvitation[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function createSellerInvitation(
  token: string,
  payload: CreateSellerInvitationPayload,
): Promise<SellerInvitation> {
  const response = await apiRequest("/api/seller-invitations/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function cancelSellerInvitation(
  token: string,
  invitationId: number,
): Promise<void> {
  await apiRequest(`/api/seller-invitations/${invitationId}/cancel/`, {
    method: "POST",
    token,
  });
}

export async function lookupSellerInvitation(token: string): Promise<SellerInvitation> {
  const response = await apiRequest(`/api/seller-invitations/lookup/?token=${token}`, {
    method: "GET",
  });
  return response.json();
}

export async function acceptSellerInvitation(payload: {
  token: string;
  full_name: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest("/api/seller-invitations/accept/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

export type CreateOrderPayload = {
  seller: string;
  delivery_method?: string;
  delivery_address?: Record<string, unknown>;
};

export async function createOrder(
  token: string,
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await apiRequest("/api/orders/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function fetchOrders(token: string): Promise<Order[]> {
  const response = await apiRequest("/api/orders/", {
    method: "GET",
    token,
  });
  const data: DRFListResponse<Order> | Order[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export type AddOrderItemPayload = {
  product_id: string;
  quantity: number;
};

export async function addOrderItem(
  token: string,
  orderId: string,
  payload: AddOrderItemPayload,
): Promise<Order> {
  const response = await apiRequest(`/api/orders/${orderId}/add_item/`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export type CreatePaymentPayload = {
  order: string;
  method: string;
  provider?: string;
  tx_ref?: string;
  amount: string | number;
};

export async function createPayment(
  token: string,
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await apiRequest("/api/payments/", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function fetchPayments(token: string): Promise<Payment[]> {
  const response = await apiRequest("/api/payments/", {
    method: "GET",
    token,
  });
  const data: DRFListResponse<Payment> | Payment[] = await response.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export type PaymentWebhookPayload = {
  tx_ref: string;
  status: string;
  amount?: string | number;
  provider?: string;
  [key: string]: unknown;
};

export async function triggerPaymentWebhook(
  payload: PaymentWebhookPayload,
): Promise<{ ok: boolean; error?: string }> {
  const response = await apiRequest("/api/webhooks/payments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}
