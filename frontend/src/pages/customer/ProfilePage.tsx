import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Mail, MapPin, Package, LogOut, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';
import { orderApi } from '@/features/orders/api/orderApi';
import { toast } from 'sonner';

const ADDRESS_KEY = 'shopwave_default_address';

interface DefaultAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const loadAddress = (): DefaultAddress | null => {
  try { return JSON.parse(localStorage.getItem(ADDRESS_KEY) ?? 'null'); } catch { return null; }
};
const saveAddress = (a: DefaultAddress) => localStorage.setItem(ADDRESS_KEY, JSON.stringify(a));

const EMPTY_ADDRESS: DefaultAddress = { recipientName: '', phone: '', address: '', city: '', postalCode: '' };

export const ProfilePage = () => {
  const navigate     = useNavigate();
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // --- Kişisel bilgi formu ---
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
    phone:     user?.phone     ?? '',
  });

  const updateUser = useAuthStore((s) => s.updateUser);

  const updateMutation = useMutation({
    mutationFn: () => authApi.updateMe(infoForm),
    onSuccess: (updated) => {
      updateUser(updated);
      setEditingInfo(false);
      toast.success('Information updated');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Update failed'),
  });

  // --- Adres formu ---
  const [editingAddr, setEditingAddr] = useState(false);
  const [addrForm, setAddrForm]       = useState<DefaultAddress>(loadAddress() ?? EMPTY_ADDRESS);

  const saveDefaultAddress = () => {
    saveAddress(addrForm);
    setEditingAddr(false);
    toast.success('Address saved');
  };

  // --- Geçmiş adresler ---
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'user', user?.id],
    queryFn:  () => orderApi.getByUserId(user!.id),
    enabled:  !!user?.id,
  });

  const pastAddresses = (() => {
    if (!orders) return [];
    const seen = new Set<string>();
    return orders.filter((o) => o.address).filter((o) => {
      const key = `${o.address}__${o.city}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  })();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
  const defaultAddr = loadAddress();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Account</h1>

      {/* Avatar + özet */}
      <Card>
        <CardContent className="flex items-center gap-5 pt-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Kişisel bilgiler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </CardTitle>
            {!editingInfo ? (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                setInfoForm({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
                setEditingInfo(true);
              }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" className="gap-1" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingInfo(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingInfo ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input value={infoForm.firstName} onChange={(e) => setInfoForm((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input value={infoForm.lastName} onChange={(e) => setInfoForm((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={infoForm.email} onChange={(e) => setInfoForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" placeholder="+1 XXX XXX XXXX" value={infoForm.phone} onChange={(e) => setInfoForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">First Name</p>
                  <p className="text-sm font-medium">{user?.firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Name</p>
                  <p className="text-sm font-medium">{user?.lastName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium">{user?.phone ?? <span className="text-muted-foreground">—</span>}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Varsayılan adres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Delivery Address
            </CardTitle>
            {!editingAddr ? (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                setAddrForm(loadAddress() ?? EMPTY_ADDRESS);
                setEditingAddr(true);
              }}>
                <Pencil className="h-3.5 w-3.5" /> {defaultAddr ? 'Edit' : 'Add'}
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" className="gap-1" onClick={saveDefaultAddress}>
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingAddr(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingAddr ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={addrForm.recipientName} onChange={(e) => setAddrForm((p) => ({ ...p, recipientName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={addrForm.phone} onChange={(e) => setAddrForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={addrForm.address} onChange={(e) => setAddrForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={addrForm.city} onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Postal Code</Label>
                  <Input value={addrForm.postalCode} onChange={(e) => setAddrForm((p) => ({ ...p, postalCode: e.target.value }))} />
                </div>
              </div>
            </div>
          ) : defaultAddr ? (
            <div className="text-sm space-y-0.5">
              <p className="font-medium">{defaultAddr.recipientName}</p>
              <p className="text-muted-foreground">{defaultAddr.phone}</p>
              <p className="text-muted-foreground">{defaultAddr.address}</p>
              <p className="text-muted-foreground">{defaultAddr.city} {defaultAddr.postalCode}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No default address added yet.</p>
          )}

          {/* Geçmiş siparişlerden adresler */}
          {!editingAddr && pastAddresses.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-medium">From past orders</p>
              {isLoading ? <Skeleton className="h-12 w-full" /> : pastAddresses.map((o, i) => (
                <button
                  key={i}
                  className="w-full text-left rounded-lg border p-3 text-xs space-y-0.5 hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setAddrForm({ recipientName: o.recipientName ?? '', phone: o.phone ?? '', address: o.address ?? '', city: o.city ?? '', postalCode: o.postalCode ?? '' });
                    setEditingAddr(true);
                  }}
                >
                  <p className="font-medium text-foreground">{o.recipientName} — {o.city}</p>
                  <p className="text-muted-foreground">{o.address}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hızlı bağlantılar */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-2">
          <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/orders')}>
            <Package className="h-4 w-4" /> My Orders
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => { logout(); navigate('/'); }}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
