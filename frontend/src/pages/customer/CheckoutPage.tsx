import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, MapPin, CreditCard, ChevronRight, ChevronLeft, Lock, Plus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { formatPrice } from '@/shared/utils/formatPrice';
import { useCartStore } from '@/features/cart/store/cartStore';
import { orderApi } from '@/features/orders/api/orderApi';
import { useCheckoutStore } from '@/features/orders/store/checkoutStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DeliveryAddress } from '@/features/orders/types/order.types';

type Step = 'address' | 'payment';

const EMPTY_ADDRESS: DeliveryAddress = {
  recipientName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

const loadDefaultAddress = (): DeliveryAddress => {
  try {
    const saved = localStorage.getItem('shopwave_default_address');
    return saved ? JSON.parse(saved) : EMPTY_ADDRESS;
  } catch {
    return EMPTY_ADDRESS;
  }
};

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const CheckoutPage = () => {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const addGroup = useCheckoutStore((s) => s.addGroup);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('address');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [isPending, setIsPending] = useState(false);

  const savedAddress = loadDefaultAddress();
  const hasSaved = Object.values(savedAddress).every((v) => v.trim() !== '');
  const [useNew, setUseNew] = useState(!hasSaved);
  const [newAddress, setNewAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);

  const deliveryAddress = useNew ? newAddress : savedAddress;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-muted-foreground">
        <ShoppingBag className="h-16 w-16 opacity-30" />
        <p className="text-lg">Your cart is empty</p>
        <Button onClick={() => navigate('/products')}>Start Shopping</Button>
      </div>
    );
  }

  const isAddressValid = Object.values(deliveryAddress).every((v) => v.trim() !== '');
  const isPaymentValid =
    card.name.trim() !== '' &&
    card.number.replace(/\s/g, '').length === 16 &&
    card.expiry.length === 5 &&
    card.cvv.length >= 3;

  const handleConfirm = async () => {
    if (!user) {
      toast.error('You need to sign in to place an order');
      navigate('/login');
      return;
    }

    setIsPending(true);
    try {
      const createdOrders = await Promise.all(
        items.map((item) =>
          orderApi.create({
            userId: user.id,
            productId: item.productId,
            quantity: item.quantity,
            ...deliveryAddress,
          })
        )
      );

      if (createdOrders.length > 1) {
        addGroup({
          checkoutId: crypto.randomUUID(),
          orderIds: createdOrders.map((o) => o.id),
          createdAt: new Date().toISOString(),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      toast.success('Your orders have been placed!');
      navigate('/orders');
    } catch {
      toast.error('Failed to place order, please try again');
    } finally {
      setIsPending(false);
    }
  };

  /* ─── Sipariş özeti (sağ kolon) ─── */
  const OrderSummary = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Order Summary
          <Badge variant="secondary" className="ml-2 text-xs">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                : <ImageOff className="h-3.5 w-3.5 text-muted-foreground/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.quantity} × {formatPrice(item.price)}</p>
            </div>
            <p className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}

        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(totalPrice())}</span>
        </div>
      </CardContent>
    </Card>
  );

  /* ─── Adım göstergesi ─── */
  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'address' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {step === 'payment' ? '✓' : '1'}
        </div>
        Delivery Address
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          2
        </div>
        Payment
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl font-bold mb-6">Confirm Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Form */}
        <div className="lg:col-span-2 space-y-4">
          <StepIndicator />

          {step === 'address' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Kayıtlı adres seçeneği */}
                {hasSaved && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setUseNew(false)}
                      className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${!useNew ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold">{savedAddress.recipientName}</p>
                          <p className="text-muted-foreground">{savedAddress.phone}</p>
                          <p className="text-muted-foreground">{savedAddress.address}</p>
                          <p className="text-muted-foreground">{savedAddress.city} {savedAddress.postalCode}</p>
                        </div>
                        {!useNew && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseNew(true)}
                      className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${useNew ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Plus className="h-4 w-4" /> Enter New Address
                        </div>
                        {useNew && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    </button>
                  </div>
                )}

                {/* Yeni adres formu */}
                {useNew && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="recipientName">Full Name</Label>
                        <Input id="recipientName" placeholder="Recipient full name"
                          value={newAddress.recipientName}
                          onChange={(e) => setNewAddress((p) => ({ ...p, recipientName: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" placeholder="+1 xxx xxx xxxx"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" placeholder="Street, building number, apartment"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="New York"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" placeholder="34000"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                <Button className="w-full mt-2" disabled={!isAddressValid} onClick={() => setStep('payment')}>
                  Proceed to Payment <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adres özeti */}
                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-0.5">
                  <p className="font-medium">{deliveryAddress.recipientName} · {deliveryAddress.phone}</p>
                  <p className="text-muted-foreground">{deliveryAddress.address}, {deliveryAddress.city} {deliveryAddress.postalCode}</p>
                  <button
                    className="text-xs text-primary underline-offset-2 hover:underline mt-1"
                    onClick={() => setStep('address')}
                  >
                    Change
                  </button>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="FULL NAME"
                    value={card.name}
                    onChange={(e) => setCard((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="•••"
                      type="password"
                      value={card.cvv}
                      onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Your payment information is transmitted securely
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('address')}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!isPaymentValid || isPending}
                    onClick={handleConfirm}
                  >
                    {isPending ? 'Processing...' : `Pay ${formatPrice(totalPrice())}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ: Özet */}
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};
