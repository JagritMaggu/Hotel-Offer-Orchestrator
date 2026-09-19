export interface HotelOffer {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
  supplier?: string;
}

export const supplierAData: HotelOffer[] = [
  {
    hotelId: "a1",
    name: "Holtin",
    price: 6000,
    city: "delhi",
    commissionPct: 10
  },
  {
    hotelId: "a2",
    name: "Radison",
    price: 5900,
    city: "delhi",
    commissionPct: 13
  },
  {
    hotelId: "a3",
    name: "Taj",
    price: 7000,
    city: "delhi",
    commissionPct: 15
  }
];

export const supplierBData: HotelOffer[] = [
  {
    hotelId: "b1",
    name: "Holtin",
    price: 5340,
    city: "delhi",
    commissionPct: 20
  },
  {
    hotelId: "b2",
    name: "Radison",
    price: 6200,
    city: "delhi",
    commissionPct: 10
  },
  {
    hotelId: "b3",
    name: "Oberoi",
    price: 8000,
    city: "delhi",
    commissionPct: 12
  }
];
