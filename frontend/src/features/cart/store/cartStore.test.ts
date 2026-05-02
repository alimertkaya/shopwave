import { describe, test, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

const item1 = { productId: 'prod-1', name: 'Laptop',  price: 15000, quantity: 1, imageUrl: '' };
const item2 = { productId: 'prod-2', name: 'Mouse',   price: 500,   quantity: 2, imageUrl: '' };

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  // addItem
  test('addItem_whenNewProduct_thenAddsToCart', () => {
    useCartStore.getState().addItem(item1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('prod-1');
  });

  test('addItem_whenSameProduct_thenIncreasesQuantity', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem({ ...item1, quantity: 3 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  test('addItem_whenMultipleProducts_thenAddsAll', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  // removeItem
  test('removeItem_whenProductExists_thenRemovesFromCart', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().removeItem('prod-1');
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('prod-2');
  });

  test('removeItem_whenProductNotExists_thenCartUnchanged', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().removeItem('nonexistent');
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  // updateQuantity
  test('updateQuantity_whenPositive_thenUpdatesQuantity', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity('prod-1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  test('updateQuantity_whenZero_thenRemovesItem', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity('prod-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test('updateQuantity_whenNegative_thenRemovesItem', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity('prod-1', -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  // clearCart
  test('clearCart_whenItemsExist_thenEmptiesCart', () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  // totalPrice
  test('totalPrice_whenEmpty_thenReturnsZero', () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  test('totalPrice_whenMultipleItems_thenReturnsCorrectSum', () => {
    useCartStore.getState().addItem(item1); // 15000 * 1
    useCartStore.getState().addItem(item2); // 500 * 2
    expect(useCartStore.getState().totalPrice()).toBe(16000);
  });

  // totalItems
  test('totalItems_whenMultipleItems_thenReturnsTotalQuantity', () => {
    useCartStore.getState().addItem(item1); // qty 1
    useCartStore.getState().addItem(item2); // qty 2
    expect(useCartStore.getState().totalItems()).toBe(3);
  });
});
