import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

export const addIncome = async (req, res) => {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;
  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date), // Convert the date string to a Date object
    });
    await newIncome.save();
    return res.status(201).json({
      success: true,
      message: "Income added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding income",
    });
  }
};

//to get income records of a user

export const getIncomes = async (req, res) => {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    res.json({
      success: true,
      message: "Incomes fetched successfully",
      income,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching incomes",
    });
  }
};

//update income record

export const updateIncome = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { description, amount } = req.body;
  try {
    const updatedIncome = await incomeModel.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
      },
      { description, amount },
      { new: true },
    );
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income record not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating income",
    });
  }
};

//to delete income record

export const deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    const income = await incomeModel.findByIdAndDelete({
      _id: id,
    });
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income record not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting income",
    });
  }
};

//to download income records in xlsx format

export const downloadIncomeExcel = async (req, res) => {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    //code to convert income data to xlsx format and send it as response
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
    XLSX.writeFile(workbook, "income_records.xlsx");
    res.download("income_records.xlsx");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error downloading income records",
    });
  }
};

//get income overview

export const getIncomeOverview = async (req, res) => {
  const userId = req.user._id;
  try {
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const incomes = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });
    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;

    const recentTransactions = incomes.slice(0, 9);
    res.json({
        success: true,
        data:{
            totalIncome,
            averageIncome,
            numberOfTransactions,
            recentTransactions,
            range
        }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching income overview",
    });
  }
};
