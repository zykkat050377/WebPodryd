//src/types/address.ts

export interface AddressSuggestion {
  place_id: string;
  description: string;
}

export interface AddressFormData {
  country: string;
  region?: string;
  city?: string;
  district?: string;
  settlement?: string;
  streetType?: string;
  streetName?: string;
  house?: string;
  building?: string;
  apartment?: string;
}
