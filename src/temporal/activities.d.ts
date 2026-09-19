import { HotelOffer } from "../data/mockSuppliers";
export declare function fetchFromSupplierA(city: string): Promise<HotelOffer[]>;
export declare function fetchFromSupplierB(city: string): Promise<HotelOffer[]>;
export declare function saveHotelsToRedis(city: string, hotels: HotelOffer[]): Promise<void>;
//# sourceMappingURL=activities.d.ts.map