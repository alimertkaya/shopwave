import { http, HttpResponse } from 'msw';

const mockUser = {
  id: 'user-1',
  email: 'test@shopwave.com',
  firstName: 'Ali',
  lastName: 'Mert',
  role: 'CUSTOMER' as const,
};

const mockProduct = {
  id: 'prod-1',
  name: 'Test Laptop',
  description: 'Güçlü bir test laptopu.',
  price: 15000,
  imageUrl: 'https://example.com/laptop.jpg',
  category: 'Elektronik',
  stock: 42,
};

const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  status: 'CREATED',
  items: [{ productId: 'prod-1', productName: 'Test Laptop', quantity: 1, unitPrice: 15000 }],
  shippingAddress: {
    fullName: 'Ali Mert',
    phone: '05001234567',
    address: 'Test Cad. No:1',
    city: 'İstanbul',
    postalCode: '34000',
  },
  totalAmount: 15000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const handlers = [
  // Auth
  http.post('*/api/auth/login', () =>
    HttpResponse.json({ accessToken: 'mock-access-token', user: mockUser })
  ),
  http.post('*/api/auth/register', () =>
    HttpResponse.json({ accessToken: 'mock-access-token', user: mockUser })
  ),
  http.post('*/api/auth/refresh', () =>
    HttpResponse.json({ accessToken: 'mock-access-token' })
  ),
  http.get('*/api/auth/me', () => HttpResponse.json(mockUser)),
  http.post('*/api/auth/logout', () => HttpResponse.json({})),

  // Products
  http.get('*/products', () =>
    HttpResponse.json({
      content: [mockProduct],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 12,
      first: true,
      last: true,
    })
  ),
  http.get('*/products/:id', () => HttpResponse.json(mockProduct)),

  // Orders
  http.post('*/orders', () => HttpResponse.json(mockOrder)),
  http.get('*/orders', () =>
    HttpResponse.json({
      content: [mockOrder],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 5,
      first: true,
      last: true,
    })
  ),
  http.get('*/orders/:id', () => HttpResponse.json(mockOrder)),
];
