import expenseModel from "../models/expenseModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

//add expense

export const addExpense = async (req, res) => {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;
  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const newExpense = new expenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date), // Convert the date string to a Date object
    });
    await newExpense.save();
    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding expense",
    });
  }
};

//to get expense records of a user

export const getExpenses = async (req, res) => {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    res.json({
      success: true,
      message: "Expenses fetched successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching incomes",
    });
  }
};

//update expense record

export const updateExpense = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { description, amount } = req.body;
  try {
    const updatedExpense = await expenseModel.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
      },
      { description, amount },
      { new: true },
    );
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating expense",
    });
  }
};

//delete expense record

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await expenseModel.findByIdAndDelete({
      _id: id,
    });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting expense",
    });
  }
};

//download expense records in xlxs format

export const downloadExpenseExcel = async (req, res) => {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    //code to convert expense data to xlsx format and send it as response
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
    XLSX.writeFile(workbook, "expense_records.xlsx");
    res.download("expense_records.xlsx");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error downloading expense records",
    });
  }
};

//overview of expenses

export const getExpenseOverview = async (req, res) => {
  const userId = req.user._id;
  try {
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const expense = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });
 
    const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
    const recentTransactions = expense.slice(0, 5);
    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching expense overview",
    });
  }
};
