import { HotelOffer } from "../data/mockSuppliers";
import { getRedisClient } from "../redis";

const SUPPLIER_API_URL = process.env.SUPPLIER_API_URL || 'http://localhost:3001';

export async function fetchFromSupplierA(city: string): Promise<HotelOffer[]> {
  console.log(`[Activity: fetchFromSupplierA] Fetching data for city: ${city}`);
  try {
    const response = await fetch(`${SUPPLIER_API_URL}/supplierA/hotels?city=${city}`);
    if (!response.ok) {
      throw new Error(`Supplier A responded with status: ${response.status}`);
    }
    const data = await response.json() as HotelOffer[];
    console.log(`[Activity: fetchFromSupplierA] Successfully fetched ${data.length} hotels.`);
    return data.map(hotel => ({ ...hotel, supplier: "Supplier A" }));
  } catch (error) {
    console.error(`[Activity: fetchFromSupplierA] Error fetching data:`, error);
    throw error;
  }
}

export async function fetchFromSupplierB(city: string): Promise<HotelOffer[]> {
  console.log(`[Activity: fetchFromSupplierB] Fetching data for city: ${city}`);
  try {
    const response = await fetch(`${SUPPLIER_API_URL}/supplierB/hotels?city=${city}`);
    if (!response.ok) {
      throw new Error(`Supplier B responded with status: ${response.status}`);
    }
    const data = await response.json() as HotelOffer[];
    console.log(`[Activity: fetchFromSupplierB] Successfully fetched ${data.length} hotels.`);
    return data.map(hotel => ({ ...hotel, supplier: "Supplier B" }));
  } catch (error) {
    console.error(`[Activity: fetchFromSupplierB] Error fetching data:`, error);
    throw error;
  }
}

export async function saveHotelsToRedis(city: string, hotels: HotelOffer[]): Promise<void> {
  const redis = await getRedisClient();
  const redisKey = `hotels:${city.toLowerCase()}`;
  
  // Clear old data for this city if needed, or just overwrite. Let's clear and re-add.
  await redis.del(redisKey);
  
  if (hotels.length === 0) return;

  // Store in Sorted Set. Score = price, Value = JSON string of hotel
  const sortedSetData = hotels.map(hotel => ({
    score: hotel.price,
    value: JSON.stringify(hotel)
  }));

  // ZADD accepts an array of {score, value} in node-redis v4+
  await redis.zAdd(redisKey, sortedSetData);
}
