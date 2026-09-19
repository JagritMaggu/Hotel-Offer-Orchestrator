import express from "express";
import { supplierAData, supplierBData, HotelOffer } from "./data/mockSuppliers";

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

app.use(express.json());

// Helper to filter by city
const filterByCity = (data: HotelOffer[], city?: string) => {
  if (!city) return data;
  return data.filter(h => h.city.toLowerCase() === city.toLowerCase());
};

app.get("/supplierA/hotels", (req, res) => {
  const city = req.query.city as string;
  res.json(filterByCity(supplierAData, city));
});

app.get("/supplierB/hotels", (req, res) => {
  const city = req.query.city as string;
  res.json(filterByCity(supplierBData, city));
});

app.listen(PORT, () => {
  console.log(`Mock Suppliers Service is running on port ${PORT}`);
});
