import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface SavedAddress {
  id: string;
  label: string;       // 집, 회사, 기타
  name: string;
  phone: string;
  postcode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

interface AddressContextValue {
  addresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  addAddress: (addr: Omit<SavedAddress, 'id'>) => SavedAddress;
  updateAddress: (id: string, addr: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

const AddressContext = createContext<AddressContextValue | null>(null);
const STORAGE_KEY = 'aerher_addresses';

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-default-1',
    label: '집',
    name: '김에테르',
    phone: '010-1234-5678',
    postcode: '06236',
    address: '서울특별시 강남구 테헤란로 123',
    addressDetail: '에테르 빌딩 4층',
    isDefault: true,
  },
];

function loadAddresses(): SavedAddress[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ADDRESSES;
  } catch {
    return DEFAULT_ADDRESSES;
  }
}

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(loadAddresses);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const addAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = { ...addr, id: `addr-${Date.now()}` };
    setAddresses((prev) => {
      if (newAddr.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr];
      }
      return [...prev, newAddr];
    });
    return newAddr;
  };

  const updateAddress = (id: string, partial: Partial<SavedAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id !== id) return partial.isDefault ? { ...a, isDefault: false } : a;
        return { ...a, ...partial };
      })
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  };

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
    <AddressContext.Provider value={{ addresses, defaultAddress, addAddress, updateAddress, deleteAddress, setDefault }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddresses must be used inside AddressProvider');
  return ctx;
}