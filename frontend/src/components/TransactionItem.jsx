import React from "react";
import { transactionItemStyles as ts } from "../assets/dummyStyles";
import { colorClasses } from "../assets/color";
import { useState } from "react";
import { Edit, IndianRupee, Save, Trash2, X } from "lucide-react";
const TransactionItem = ({
  transaction,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onCancel,
  onDelete,
  type = "expense",
  categoryIcons,
  setEditingId,
  amountClass = "font-bold truncate block text-right",
  iconClass = "p-3 rounded-xl flex-shrink-0",
}) => {
  const [errors, setErrors] = useState({ description: "", amount: "" });

  const classes = colorClasses[type];
  const sign = type === "income" ? "+" : "-";

  const validate = () => {
    const nextErrors = { description: "", amount: "" };
    const desc = String(editForm.description ?? "").trim();
    const amtRaw = editForm.amount;
    const amt =
      amtRaw === "" || amtRaw === null || amtRaw === undefined
        ? ""
        : String(amtRaw).trim();

    if (!desc) {
      nextErrors.description = "Description is required.";
    }

    if (amt === "") {
      nextErrors.amount = "Amount is required.";
    } else if (Number(amt) <= 0) {
      nextErrors.amount = "Amount must be greater than 0.";
    }

    setErrors(nextErrors);
    return !nextErrors.description && !nextErrors.amount;
  };

  const handleSaveClick = () => {
    if (validate()) {
      setErrors({ description: "", amount: "" });
      onSave();
    }
  };
  return (
    <div className={ts.container(isEditing, classes)}>
      <div className={ts.mainContainer}>
        <div className={ts.iconContainer(iconClass, classes)}>
          {categoryIcons[transaction.category] || (
            <IndianRupee className="w-5 h-5" />
          )}
        </div>
        <div className={ts.contentContainer}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={ts.input(!!errors.description, classes)}
              />
              {errors.description && (
                <p className={ts.errorText} id={`desc-error-${transaction.id}`}>
                  {errors.description}
                </p>
              )}
            </>
          ) : (
            <p className={ts.description}>{transaction.description}</p>
          )}
          <p className={ts.details}>
            {new Date(transaction.date).toLocaleDateString()} |{" "}
            {transaction.category}
          </p>
        </div>
      </div>
      <div className={ts.actionsContainer}>
        <div className={ts.amountContainer}>
          {isEditing ? (
            <>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                className={ts.amountInput(!!errors.amount, classes)}
              />

              {errors.amount && (
                <p id={`amt-error-${transaction.id}`} className={ts.errorText}>
                  {errors.amount}
                </p>
              )}
            </>
          ) : (
            <span className={ts.amountText(amountClass, classes)}>
              {sign}
              {Number(transaction.amount).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        <div className={ts.buttonsContainer}>
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className={ts.saveButton(classes)}
                title="Save"
              >
                <Save size={16} />
              </button>

              <button
                onClick={() => {
                  setErrors({ description: "", amount: "" });
                  onCancel();
                }}
                className={ts.cancelButton}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditForm({
                    description: transaction.description ?? "",
                    amount: transaction.amount ?? "",
                    category: transaction.category ?? "",
                    date: transaction.date ?? "",
                    type: transaction.type ?? "expense",
                  });
                  setErrors({ description: "", amount: "" });
                  setEditingId(transaction.id);
                }}
                className={ts.editButton(classes)}
                title="Edit"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => onDelete(transaction.id)}
                className={ts.deleteButton(classes)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
