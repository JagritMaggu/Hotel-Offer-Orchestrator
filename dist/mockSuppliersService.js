"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockSuppliers_1 = require("./data/mockSuppliers");
const app = (0, express_1.default)();
const PORT = process.env.MOCK_PORT || 3001;
app.use(express_1.default.json());
// Helper to filter by city
const filterByCity = (data, city) => {
    if (!city)
        return data;
    return data.filter(h => h.city.toLowerCase() === city.toLowerCase());
};
app.get("/supplierA/hotels", (req, res) => {
    const city = req.query.city;
    res.json(filterByCity(mockSuppliers_1.supplierAData, city));
});
app.get("/supplierB/hotels", (req, res) => {
    const city = req.query.city;
    res.json(filterByCity(mockSuppliers_1.supplierBData, city));
});
app.listen(PORT, () => {
    console.log(`Mock Suppliers Service is running on port ${PORT}`);
});
