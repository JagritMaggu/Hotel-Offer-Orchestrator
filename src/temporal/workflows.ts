import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { HotelOffer } from '../data/mockSuppliers';

const { fetchFromSupplierA, fetchFromSupplierB, saveHotelsToRedis } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function aggregateHotelsWorkflow(city: string): Promise<HotelOffer[]> {
  console.log(`[Workflow: aggregateHotelsWorkflow] Started for city: ${city}`);
  
  // Call both suppliers in parallel
  const [supplierAResults, supplierBResults] = await Promise.all([
    fetchFromSupplierA(city),
    fetchFromSupplierB(city),
  ]);

  // Combine results
  const allResults = [...supplierAResults, ...supplierBResults];
  console.log(`[Workflow: aggregateHotelsWorkflow] Combined ${allResults.length} hotels from suppliers.`);

  // Deduplicate by hotel name and select cheapest offer
  const hotelMap = new Map<string, HotelOffer>();

  for (const hotel of allResults) {
    const existing = hotelMap.get(hotel.name);
    if (!existing || hotel.price < existing.price) {
      hotelMap.set(hotel.name, hotel);
    }
  }

  const finalHotels = Array.from(hotelMap.values());
  
  // Save to Redis
  await saveHotelsToRedis(city, finalHotels);

  // Return the deduplicated list
  return finalHotels;
}
