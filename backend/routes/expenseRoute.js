import express from "express";
import { addExpense, getExpenses, updateExpense, deleteExpense, getExpenseOverview, downloadExpenseExcel } from "../controllers/expenseController.js";
import { authMiddleware } from "../middlewares/auth.js";

const expenseRouter = express.Router();

expenseRouter.post("/add", authMiddleware, addExpense);
expenseRouter.get("/get", authMiddleware, getExpenses);
expenseRouter.put("/update/:id", authMiddleware, updateExpense);
expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense);
expenseRouter.get("/overview", authMiddleware, getExpenseOverview);
expenseRouter.get("/downloadexcel", authMiddleware, downloadExpenseExcel);

export default expenseRouter;