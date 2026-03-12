export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distanceM?: number;
  rating?: number;
  reviewCount?: number;
  liked?: boolean;
}
