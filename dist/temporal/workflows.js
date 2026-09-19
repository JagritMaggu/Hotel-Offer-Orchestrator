"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateHotelsWorkflow = aggregateHotelsWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { fetchFromSupplierA, fetchFromSupplierB, saveHotelsToRedis } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
});
async function aggregateHotelsWorkflow(city) {
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
    const hotelMap = new Map();
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
