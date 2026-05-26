import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";

export const getDashboardOverview = async (req, res) => {
  const userId = req.user._id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const incomes = await incomeModel
      .find({
        userId: userId,
       date: { $gte: startOfMonth, $lte: now },
      })
      .lean();

    const expenses = await expenseModel
      .find({
        userId: userId,
       date: { $gte: startOfMonth, $lte: now },
      })
      .lean();

    const monthlyIncome = incomes.reduce(
      (acc, cur) => acc + Number(cur.amount || 0),
      0
    );

    const monthlyExpense = expenses.reduce(
      (acc, cur) => acc + Number(cur.amount || 0),
      0
    );

    const savings = monthlyIncome - monthlyExpense;

    const savingsRate =
      monthlyIncome === 0
        ? 0
        : Math.round((savings / monthlyIncome) * 100);

    const recentTransactions = [
      ...incomes.map((income) => ({
        ...income,
        type: "income",
      })),
      ...expenses.map((expense) => ({
        ...expense,
        type: "expense",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const spendByCategory = {};

    for (const expense of expenses) {
      const category = expense.category || "Other";

      spendByCategory[category] =
        (spendByCategory[category] || 0) + Number(expense.amount || 0);
    }

    const expenseDistribution = Object.entries(spendByCategory).map(
      ([category, amount]) => ({
        category,
        amount,
        percent:
          monthlyExpense === 0
            ? 0
            : Math.round((amount / monthlyExpense) * 100),
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        monthlyExpense,
        savings,
        savingsRate,
        recentTransactions,
        spendByCategory,
        expenseDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};