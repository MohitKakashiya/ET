// constants/financeConstants.js
import React from 'react';
import {
  Utensils,
  Home,
  Car,
  ShoppingCart,
  Gift,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  ArrowUp,
  FileText,
  Briefcase,
  CreditCard,
  ShoppingBag,
  Film,
  Wifi,
  Heart,
  IndianRupee,
} from "lucide-react";

// Vibrant, distinct colors that stand out cleanly without muddying together
export const GAUGE_COLORS = {
  Income: {
    gradientStart: "#10B981", // Bright Mint/Emerald 500
    gradientEnd: "#059669",   // Emerald 600
    text: "text-emerald-500",
    bg: "bg-emerald-50/50",    // Soft, ultra-light tint
  },
  Spent: {
    gradientStart: "#FF4D4D", // Sharp, clean Light Red
    gradientEnd: "#E63946",   // Distinct Coral Red
    text: "text-rose-500",
    bg: "bg-rose-50/50",
  },
  Savings: {
    gradientStart: "#3B82F6", // Clean, bright Sky Blue 500
    gradientEnd: "#1D4ED8",   // Clear Royal Blue 700
    text: "text-blue-500",
    bg: "bg-blue-50/50",
  },
};

// High-separation palette for charts (colors are distinctly different so they don't blend)
export const COLORS = [
  "#10B981", // Mint Emerald
  "#3B82F6", // Vivid Blue
  "#F59E0B", // Amber Yellow
  "#EF4444", // Bright Red
  "#8B5CF6", // Lavender Violet
  "#EC4899", // Hot Pink
  "#06B6D4", // Clear Cyan
];

export const INCOME_COLORS = [
  "#10B981",
  "#059669",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
];

// Icon components with clean layout sizing
export const CATEGORY_ICONS_Inc = {
  Salary: <Briefcase className="w-5 h-5" />,
  Freelance: <FileText className="w-5 h-5" />,
  Investment: <TrendingUp className="w-5 h-5" />,
  Bonus: <Gift className="w-5 h-5" />,
  Other: <IndianRupee className="w-5 h-5" />,
};

export const CATEGORY_ICONS = {
  Food: <Utensils className="w-5 h-5" />,
  Housing: <Home className="w-5 h-5" />,
  Transport: <Car className="w-5 h-5" />,
  Shopping: <ShoppingCart className="w-5 h-5" />,
  Entertainment: <Film className="w-5 h-5" />,
  Utilities: <Wifi className="w-5 h-5" />,
  Healthcare: <Heart className="w-5 h-5" />,
  Salary: <Briefcase className="w-5 h-5" />,
  Freelance: <FileText className="w-5 h-5" />,
  Other: <IndianRupee className="w-5 h-5" />,
};

export const INCOME_CATEGORY_ICONS = {
  Salary: <Briefcase className="w-5 h-5" />,
  Freelance: <FileText className="w-5 h-5" />,
  Investment: <TrendingUp className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Other: <IndianRupee className="w-5 h-5" />,
};

export const EXPENSE_CATEGORY_ICONS = {
  Food: <Utensils className="w-5 h-5" />,
  Housing: <Home className="w-5 h-5" />,
  Transport: <Car className="w-5 h-5" />,
  Shopping: <ShoppingBag className="w-5 h-5" />,
  Entertainment: <Film className="w-5 h-5" />,
  Utilities: <Wifi className="w-5 h-5" />,
  Healthcare: <Heart className="w-5 h-5" />,
  Other: <CreditCard className="w-5 h-5" />,
};

// Smooth UI classes: White/Light bases, sharp borders, highly responsive transitions
export const colorClasses = {
  income: {
    bg: "bg-white",
    text: "text-emerald-600 font-normal",
    border: "border-gray-100 hover:border-emerald-200", 
    ring: "ring-emerald-100",
    button: "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 ease-in-out round-lg shadow-sm hover:shadow active:scale-95",
    iconBg: "bg-emerald-50 text-emerald-500 rounded-lg p-2.5",
  },
  expense: {
    bg: "bg-white",
    text: "text-rose-600 font-normal",
    border: "border-gray-100 hover:border-rose-200",
    ring: "ring-rose-100",
    button: "bg-rose-500 hover:bg-rose-600 text-white transition-all duration-300 ease-in-out round-lg shadow-sm hover:shadow active:scale-95",
    iconBg: "bg-rose-50 text-rose-500 rounded-lg p-2.5",
  },
  savings: {
    bg: "bg-white",
    text: "text-blue-600 font-normal",
    border: "border-gray-100 hover:border-blue-200",
    ring: "ring-blue-100",
    button: "bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 ease-in-out round-lg shadow-sm hover:shadow active:scale-95",
    iconBg: "bg-blue-50 text-blue-500 rounded-lg p-2.5",
  }
};