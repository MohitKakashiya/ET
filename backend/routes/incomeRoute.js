import express from "express";
import { addIncome, getIncomes, updateIncome, deleteIncome, getIncomeOverview, downloadIncomeExcel } from "../controllers/incomeController.js";
import { authMiddleware } from "../middlewares/auth.js";

const incomeRouter = express.Router();

incomeRouter.post("/add", authMiddleware, addIncome);
incomeRouter.get("/get", authMiddleware, getIncomes);
incomeRouter.put("/update/:id", authMiddleware, updateIncome);
incomeRouter.delete("/delete/:id", authMiddleware, deleteIncome);
incomeRouter.get("/overview", authMiddleware, getIncomeOverview);
incomeRouter.get("/downloadexcel", authMiddleware, downloadIncomeExcel);

export default incomeRouter;