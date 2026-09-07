export type ListingType = "tax_lien" | "tax_sale" | "tax_delinquent";

export interface Listing {
  id: string;
  stateAbbr: string;
  countyFips: string;
  countyName: string;
  type: ListingType;
  address: string;
  city?: string;
  zip?: string;
  parcelId?: string;
  owner?: string;
  amountDue?: number;
  saleYear?: string;
  status?: string;
  lat?: number;
  lon?: number;
  sourceId: string;
  retrievedAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  agency: string;
  datasetUrl: string;
  apiUrl: string;
  license: string;
  countyFips: string[];
  totalAvailableAtSource: number;
  ingestedCount: number;
  retrievedAt: string;
  notes?: string;
}
