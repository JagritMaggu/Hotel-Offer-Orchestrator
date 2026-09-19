import express from "express";
import { Connection, Client } from '@temporalio/client';
import { getRedisClient } from "./redis";

const app = express();
const PORT = process.env.PORT || 3000;
const SUPPLIER_API_URL = process.env.SUPPLIER_API_URL || 'http://localhost:3001';

app.use(express.json());

// Phase 4: Main API Endpoint
app.get("/api/hotels", async (req, res) => {
  const city = req.query.city as string;
  const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : '-inf';
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : '+inf';

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    // 1. Connect to Temporal and start the workflow
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });
    const client = new Client({ connection });

    const workflowId = `hotel-aggregator-${city}-${Date.now()}`;
    const handle = await client.workflow.start('aggregateHotelsWorkflow', {
      args: [city],
      taskQueue: 'hotel-offers',
      workflowId,
    });

    // Wait for the workflow to complete (it saves to Redis)
    await handle.result();

    // 2. Query Redis for price filtering
    const redis = await getRedisClient();
    const redisKey = `hotels:${city.toLowerCase()}`;

    // ZRANGEBYSCORE key min max
    const results = await redis.zRangeByScore(redisKey, minPrice, maxPrice);

    // Map JSON strings back to objects
    const finalHotels = results.map(r => JSON.parse(r));

    res.json(finalHotels);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Bonus: Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const checkSupplier = async (url: string) => {
      try {
        const response = await fetch(url);
        return response.ok ? "healthy" : "down";
      } catch (err) {
        return "down";
      }
    };

    const supplierAStatus = await checkSupplier(`${SUPPLIER_API_URL}/supplierA/hotels?city=delhi`);
    const supplierBStatus = await checkSupplier(`${SUPPLIER_API_URL}/supplierB/hotels?city=delhi`);

    res.json({
      status: "ok",
      suppliers: {
        SupplierA: supplierAStatus,
        SupplierB: supplierBStatus
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
