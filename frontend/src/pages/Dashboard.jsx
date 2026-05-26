import React from "react";
import AddTransactionModal from "../components/Add";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  getTimeFrameRange,
  getPreviousTimeFrameRange,
  calculateData,
} from "../components/Helpers";
import { useOutletContext } from "react-router-dom";
import {
  dashboardStyles as ds,
  trendStyles as ts,
  chartStyles as cs,
} from "../assets/dummyStyles";
import {
  GAUGE_COLORS,
  COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS,
} from "../assets/color";
import {
  ArrowDown,
  TrendingUp as ProfitIcon,
  PieChart as PieChartIcon,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  PiggyBank,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import FinancialCard from "../components/FinancialCard";
import GaugeCard from "../components/GaugeCard";
const API_BASE = "http://localhost:4000/api";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    const combined = new Date(`${dateValue}T${hhmmss}`);
    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

const Dashboard = () => {
  const {
    transactions: outletTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    refreshTransactions,
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame),
    [timeFrame],
  );
  const prevTimeFrameRange = useMemo(
    () => getPreviousTimeFrameRange(timeFrame),
    [timeFrame],
  );

  const isDateInRange = (date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return transactionDate >= startDate && transactionDate <= endDate;
  };

  const filteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter((t) =>
        isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end),
      ),
    [outletTransactions, timeFrameRange],
  );

  const prevFilteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter((t) =>
        isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end),
      ),
    [outletTransactions, prevTimeFrameRange],
  );

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [filteredTransactions]);

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [prevFilteredTransactions]);

  useEffect(() => {
    const maxValues = {
      income: Math.max(currentTimeFrameData.income, 5000),
      expenses: Math.max(currentTimeFrameData.expenses, 3000),
      savings: Math.max(Math.abs(currentTimeFrameData.savings), 2000),
    };

    setGaugeData([
      {
        name: "Income",
        value: currentTimeFrameData.income,
        max: maxValues.income,
      },
      {
        name: "Spent",
        value: currentTimeFrameData.expenses,
        max: maxValues.expenses,
      },
      {
        name: "Savings",
        value: currentTimeFrameData.savings,
        max: maxValues.savings,
      },
    ]);
  }, [currentTimeFrameData, timeFrame]);

  const displayIncome =
    timeFrame === "monthly" && typeof overviewMeta.monthlyIncome === "number"
      ? overviewMeta.monthlyIncome
      : currentTimeFrameData.income;

  const displayExpenses =
    timeFrame === "monthly" && typeof overviewMeta.monthlyExpense === "number"
      ? overviewMeta.monthlyExpense
      : currentTimeFrameData.expenses;

  const displaySavings =
    timeFrame === "monthly" && typeof overviewMeta.savings === "number"
      ? overviewMeta.savings
      : currentTimeFrameData.savings;

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;
    if (!prev) {
      if (!curr) return 0;
      return 100;
    }
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);

  const financialOverviewData = useMemo(() => {
    if (
      timeFrame === "monthly" &&
      overviewMeta.expenseDistribution &&
      Array.isArray(overviewMeta.expenseDistribution) &&
      overviewMeta.expenseDistribution.length > 0
    ) {
      return overviewMeta.expenseDistribution.map((d) => ({
        name: d.category,
        value: Math.round(Number(d.amount) || 0),
      }));
    }

    const categories = {};
    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categories[transaction.category] =
          (categories[transaction.category] || 0) + transaction.amount;
      }
    });

    return Object.keys(categories).map((category) => ({
      name: category,
      value: Math.round(categories[category]),
    }));
  }, [filteredTransactions, overviewMeta, timeFrame]);
  const serverRecent = overviewMeta.recentTransactions || [];
  const serverRecentIncome = serverRecent
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const serverRecentExpense = serverRecent
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );

  const expenseTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );

  const incomeListForDisplay =
    timeFrame === "monthly" && serverRecentIncome.length > 0
      ? serverRecentIncome
      : incomeTransactions;

  const expenseListForDisplay =
    timeFrame === "monthly" && serverRecentExpense.length > 0
      ? serverRecentExpense
      : expenseTransactions;

  const displayedIncome = showAllIncome
    ? incomeListForDisplay
    : incomeListForDisplay.slice(0, 3);

  const displayedExpense = showAllExpense
    ? expenseListForDisplay
    : expenseListForDisplay.slice(0, 3);

  //to fetch server side data
  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: getAuthHeader(),
      });
      if (res?.data?.success) {
        const data = res.data.data;
        const recent = (data.recentTransactions || []).map((item) => {
          const typeFromServer =
            item.type || (item.category ? "expense" : "income");
          const amountNum = Number(item.amount) || 0;

          const isoDate = item.date
            ? new Date(item.date).toISOString()
            : item.createdAt
              ? new Date(item.createdAt).toISOString()
              : new Date().toISOString();

          return {
            id: item._id || item.id || Date.now() + Math.random(),
            date: isoDate,
            description:
              item.description ||
              item.note ||
              item.title ||
              (typeFromServer === "income"
                ? item.source || "Income"
                : item.category || "Expense"),
            amount: amountNum,
            type: typeFromServer,
            category:
              item.category ||
              (typeFromServer === "income" ? "Salary" : "Other"),
            raw: item,
          };
        });

        setOverviewMeta((prev) => ({
          ...prev,
          monthlyIncome: Number(data.monthlyIncome || 0),
          monthlyExpense: Number(data.monthlyExpense || 0),
          savings:
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : Number(data.monthlyIncome || 0) -
                Number(data.monthlyExpense || 0),
          savingsRate:
            typeof data.savingsRate !== "undefined" ? data.savingsRate : null,
          spendByCategory: data.spendByCategory || {},
          expenseDistribution: data.expenseDistribution || [],
          recentTransactions: recent,
        }));

        if (timeFrame === "monthly") {
          const monthlyIncome = Number(data.monthlyIncome || 0);
          const monthlyExpense = Number(data.monthlyExpense || 0);
          const savings =
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : monthlyIncome - monthlyExpense;

          const maxValues = {
            income: Math.max(monthlyIncome, 5000),
            expenses: Math.max(monthlyExpense, 3000),
            savings: Math.max(Math.abs(savings), 2000),
          };

          setGaugeData([
            { name: "Income", value: monthlyIncome, max: maxValues.income },
            { name: "Spent", value: monthlyExpense, max: maxValues.expenses },
            { name: "Savings", value: savings, max: maxValues.savings },
          ]);
        }
      } else {
        console.warn("Dashboard endpoint returned success:false", res?.data);
      }
    } catch (err) {
      console.error(
        "Failed to fetch dashboard overview:",
        err?.response || err.message || err,
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  //add /edit or /delete transaction functions can be added here and passed down to recent transactions component
  const handleAddTransaction = async (transactionData) => {
    if (!newTransaction.description || !newTransaction.amount) {
      alert("Please fill in all required fields (description and amount).");
      return;
    }
    const payload = {
      date: toIsoWithClientTime(newTransaction.date),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
    };
    try {
      setLoading(true);
      if (newTransaction.type === "income") {
        await axios.post(`${API_BASE}/income/add`, payload, {
          headers: getAuthHeader(),
        });
      } else {
        await axios.post(`${API_BASE}/expense/add`, payload, {
          headers: getAuthHeader(),
        });
      }
      await refreshTransactions();
      await fetchDashboardOverview();
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });
      setShowModal(false);
    } catch (err) {
      console.error(
        "Failed to add transaction:",
        err?.response || err.message || err,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={ds.container}>
      <div className={ds.headerContainer}>
        <div className={ds.headerContent}>
          <div>
            <h1 className={ds.headerTitle}>Finance Dashboard</h1>
            <p className={ds.headerSubtitle}>Track your finances with ease</p>
          </div>

          <button onClick={() => setShowModal(true)} className={ds.addButton}>
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
        <div className={ds.timeFrameContainer}>
          <div className={ds.timeFrameWrapper}>
            {["daily", "weekly", "monthly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={ds.timeFrameButton(timeFrame === tf)}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={ds.summaryGrid}>
        <FinancialCard
          icon={
            <div className={ds.walletIconContainer}>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          }
          label="Wallet Balance"
          value={`₹${Math.round(displayIncome - displayExpenses).toLocaleString()}`}
          additionalContent={
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className={ds.balanceBadge}>
                +{Math.round(displayIncome).toLocaleString()}
              </span>
              <span className={ds.expenseBadge}>
                -{Math.round(displayExpenses).toLocaleString()}
              </span>
            </div>
          }
        />
        <FinancialCard
          icon={
            <div className={ds.arrowDownIconContainer}>
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
          }
          label={`${timeFrameRange.label} Expenses`}
          value={`₹${Math.round(displayExpenses).toLocaleString()}`}
          additionalContent={
            <div
              className={`mt-2 text-xs items-center flex gap-1 ${expenseChange >= 0 ? ts.positive : ts.negative}`}
            >
              {expenseChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {Math.abs(expenseChange)}%{" "}
                {expenseChange >= 0 ? "increase" : "decrease"} from{" "}
                {prevTimeFrameRange.label}
              </span>
            </div>
          }
        />
        <FinancialCard
          icon={
            <div className={ds.piggyBankIconContainer}>
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          }
          label={`${timeFrameRange.label} Savings`}
          value={`₹${Math.round(displaySavings).toLocaleString()}`}
          additionalContent={
            <div className="flex items-center gap-2 text-cyan-600 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>
                  {displayIncome > 0
                    ? Math.round((displaySavings / displayIncome) * 100)
                    : 0}
                  % of Income
                </span>
              </div>
              {typeof overviewMeta.savingsRate === "number" && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${overviewMeta.savingsRate < 0 ? ts.negative : ts.positive}`}
                >
                  {overviewMeta.savingsRate}%
                </span>
              )}
            </div>
          }
        />
      </div>
      {/* {Gauges} */}
      <div className={ds.gaugeGrid}>
        {gaugeData.map((gauge) => {
          return (
            <GaugeCard
              key={gauge.name}
              gauge={gauge}
              colorInfo={GAUGE_COLORS[gauge.name]}
              timeFrameLabel={timeFrameRange.label}
            />
          );
        })}
      </div>
      {/* Expense distribution pie - Hidden on mobile */}
      <div className={ds.pieChartContainer}>
        <div className={ds.pieChartHeader}>
          <h3 className={ds.pieChartTitle}>
            <PieChartIcon className="w-6 h-6 text-teal-500" />
            Expense Distribution
            <span className={ds.listSubtitle}> ({timeFrameRange.label})</span>
          </h3>
        </div>

        <div className={ds.pieChartHeight}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className={cs.pieChart}>
              <Pie
                data={financialOverviewData}
                cx="50%"
                cy="53%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${Math.round(percent * 100)}%`
                }
                labelLine={false}
              >
                {financialOverviewData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `₹${Math.round(value).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={ds.tooltipContent}
                itemStyle={ds.tooltipItem}
              />

              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(v) => <span className={ds.legendText}>{v}</span>}
                iconSize={10}
                iconType="circle"
                wrapperStyle={ds.legendWrapper}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={ds.listsGrid}>
        {/* Income Column */}
        <div className={ds.listContainer}>
          <div className={ds.listHeader}>
            <h3 className={ds.listTitle}>
              <ProfitIcon className="w-6 h-6 text-green-500" /> Recent Income{" "}
              <span className={ds.listSubtitle}> ({timeFrameRange.label})</span>
            </h3>

            <span className={ds.incomeCountBadge}>
              {incomeListForDisplay.length} records
            </span>
          </div>

          <div className={ds.transactionList}>
            {displayedIncome.map((transaction) => {
              const IconComponent =
                INCOME_CATEGORY_ICONS[transaction.category] ||
                INCOME_CATEGORY_ICONS.Other;

              return (
                <div key={transaction.id} className={ds.incomeTransactionItem}>
                  <div className={ds.transactionContent}>
                    <div className={ds.incomeIconContainer}>
                      {IconComponent}
                    </div>

                    <div>
                      <p className={ds.transactionDescription}>
                        {transaction.description}
                      </p>
                      <p className={ds.transactionCategory}>
                        {transaction.category}
                      </p>
                    </div>
                  </div>

                  <div className={ds.transactionAmount}>
                    <p className={ds.incomeAmount}>
                      +₹{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className={ds.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {incomeListForDisplay.length === 0 && (
              <div className={ds.emptyState}>
                <div className={ds.emptyIconContainer("bg-green-50")}>
                  <IndianRupee className="w-8 h-8 text-green-400" />
                </div>
                <p className={ds.emptyText}>No income transactions</p>
              </div>
            )}

            {incomeListForDisplay.length > 3 && (
              <div className={ds.viewAllContainer}>
                <button
                  onClick={() => setShowAllIncome(!showAllIncome)}
                  className={ds.viewAllButton}
                >
                  {showAllIncome ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Income ({incomeListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expense Column */}
        <div className={ds.listContainer}>
          <div className={ds.listHeader}>
            <h3 className="text-lg md:text-xl lg:text-xl xl:text-xl font-bold text-gray-800 md:mt-3 mt-3 flex items-center gap-3">
              <ArrowDown className="w-6 h-6 text-orange-500" /> Recent Expenses{" "}
              <span className={ds.listSubtitle}> ({timeFrameRange.label})</span>
            </h3>

            <span className={ds.expenseCountBadge}>
              {expenseListForDisplay.length} records
            </span>
          </div>

          <div className={ds.transactionList}>
            {displayedExpense.map((transaction) => {
              const IconComponent =
                EXPENSE_CATEGORY_ICONS[transaction.category] ||
                EXPENSE_CATEGORY_ICONS.Other;

              return (
                <div key={transaction.id} className={ds.expenseTransactionItem}>
                  <div className={ds.transactionContent}>
                    <div className={ds.expenseIconContainer}>
                      {IconComponent}
                    </div>

                    <div>
                      <p className={ds.transactionDescription}>
                        {transaction.description}
                      </p>
                      <p className={ds.transactionCategory}>
                        {transaction.category}
                      </p>
                    </div>
                  </div>

                  <div className={ds.transactionAmount}>
                    <p className={ds.expenseAmount}>
                      -{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className={ds.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {expenseListForDisplay.length === 0 && (
              <div className={ds.emptyState}>
                <div className={ds.emptyIconContainer("bg-orange-50")}>
                  <ShoppingCart className="w-8 h-8 text-orange-400" />
                </div>
                <p className={ds.emptyText}>No expense transactions</p>
              </div>
            )}

            {expenseListForDisplay.length > 3 && (
              <div className={ds.viewAllContainer}>
                <button
                  onClick={() => setShowAllExpense(!showAllExpense)}
                  className={ds.viewAllButton}
                >
                  {showAllExpense ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Expenses ({expenseListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
