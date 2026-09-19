"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@temporalio/client");
const mockSuppliers_1 = require("./data/mockSuppliers");
const redis_1 = require("./redis");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Helper to filter by city
const filterByCity = (data, city) => {
    if (!city)
        return data;
    return data.filter(h => h.city.toLowerCase() === city.toLowerCase());
};
// Phase 2: Mock Supplier APIs
app.get("/supplierA/hotels", (req, res) => {
    const city = req.query.city;
    res.json(filterByCity(mockSuppliers_1.supplierAData, city));
});
app.get("/supplierB/hotels", (req, res) => {
    const city = req.query.city;
    res.json(filterByCity(mockSuppliers_1.supplierBData, city));
});
// Phase 4: Main API Endpoint
app.get("/api/hotels", async (req, res) => {
    const city = req.query.city;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : '-inf';
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : '+inf';
    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }
    try {
        // 1. Connect to Temporal and start the workflow
        const connection = await client_1.Connection.connect({
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        });
        const client = new client_1.Client({ connection });
        const workflowId = `hotel-aggregator-${city}-${Date.now()}`;
        const handle = await client.workflow.start('aggregateHotelsWorkflow', {
            args: [city],
            taskQueue: 'hotel-offers',
            workflowId,
        });
        // Wait for the workflow to complete (it saves to Redis)
        await handle.result();
        // 2. Query Redis for price filtering
        const redis = await (0, redis_1.getRedisClient)();
        const redisKey = `hotels:${city.toLowerCase()}`;
        // ZRANGEBYSCORE key min max
        const results = await redis.zRangeByScore(redisKey, minPrice, maxPrice);
        // Map JSON strings back to objects
        const finalHotels = results.map(r => JSON.parse(r));
        res.json(finalHotels);
    }
    catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Bonus: Health check endpoint
app.get("/health", async (req, res) => {
    try {
        const checkSupplier = async (url) => {
            try {
                const response = await fetch(url);
                return response.ok ? "healthy" : "down";
            }
            catch (err) {
                return "down";
            }
        };
        const supplierAStatus = await checkSupplier(`http://localhost:${PORT}/supplierA/hotels?city=delhi`);
        const supplierBStatus = await checkSupplier(`http://localhost:${PORT}/supplierB/hotels?city=delhi`);
        res.json({
            status: "ok",
            suppliers: {
                SupplierA: supplierAStatus,
                SupplierB: supplierBStatus
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map