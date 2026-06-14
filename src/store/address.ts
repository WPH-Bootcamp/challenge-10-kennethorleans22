import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface AddressState {
  addresses: SavedAddress[];
  addAddress: (label: string, address: string) => void;
  updateAddress: (id: string, label: string, address: string) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      addAddress: (label, address) =>
        set((state) => {
          const isFirst = state.addresses.length === 0;
          return {
            addresses: [
              ...state.addresses,
              { id: Date.now().toString(), label, address, isDefault: isFirst },
            ],
          };
        }),
      updateAddress: (id, label, address) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, label, address } : a
          ),
        })),
      deleteAddress: (id) =>
        set((state) => {
          const wasDefault = state.addresses.find((a) => a.id === id)?.isDefault ?? false;
          const remaining = state.addresses.filter((a) => a.id !== id);
          if (wasDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { addresses: remaining };
        }),
      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),
    }),
    { name: 'address-storage' }
  )
);