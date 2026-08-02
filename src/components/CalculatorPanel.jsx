import { useMemo, useState } from "react";

const buttons = [
  "C",
  "DEL",
  "%",
  "/",
  "7",
  "8",
  "9",
  "*",
  "4",
  "5",
  "6",
  "-",
  "1",
  "2",
  "3",
  "+",
  "+/-",
  "0",
  ".",
  "=",
];

function formatDisplay(value) {
  if (value === null || value === undefined || value === "") return "0";
  return String(value);
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function CalculatorPanel({ open, onClose }) {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [error, setError] = useState("");

  const displayValue = useMemo(() => formatDisplay(display), [display]);

  if (!open) return null;

  const resetAll = () => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setShouldResetDisplay(false);
    setError("");
  };

  const applyOperation = (left, op, right) => {
    switch (op) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return right === 0 ? null : left / right;
      case "%":
        return left % right;
      default:
        return right;
    }
  };

  const handleDigit = (value) => {
    setError("");
    setDisplay((current) => {
      if (shouldResetDisplay || current === "0") {
        setShouldResetDisplay(false);
        return value;
      }
      return `${current}${value}`;
    });
  };

  const handleDecimal = () => {
    setError("");
    setDisplay((current) => {
      if (shouldResetDisplay) {
        setShouldResetDisplay(false);
        return "0.";
      }
      return current.includes(".") ? current : `${current}.`;
    });
  };

  const handleOperator = (nextOperator) => {
    setError("");
    const currentValue = safeNumber(display);

    if (storedValue === null) {
      setStoredValue(currentValue);
      setOperator(nextOperator);
      setShouldResetDisplay(true);
      return;
    }

    const result = applyOperation(storedValue, operator, currentValue);
    if (result === null) {
      setError("Cannot divide by zero");
      setDisplay("0");
      setStoredValue(null);
      setOperator(null);
      setShouldResetDisplay(true);
      return;
    }

    setDisplay(String(result));
    setStoredValue(result);
    setOperator(nextOperator);
    setShouldResetDisplay(true);
  };

  const handleEquals = () => {
    if (storedValue === null || !operator) return;
    const currentValue = safeNumber(display);
    const result = applyOperation(storedValue, operator, currentValue);

    if (result === null) {
      setError("Cannot divide by zero");
      setDisplay("0");
    } else {
      setDisplay(String(result));
      setStoredValue(null);
    }

    setOperator(null);
    setShouldResetDisplay(true);
  };

  const handlePress = (label) => {
    if (/^\d$/.test(label)) {
      handleDigit(label);
      return;
    }

    switch (label) {
      case ".":
        handleDecimal();
        break;
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        handleOperator(label);
        break;
      case "=":
        handleEquals();
        break;
      case "C":
        resetAll();
        break;
      case "DEL":
        setError("");
        setDisplay((current) => {
          if (shouldResetDisplay) return "0";
          const trimmed = current.length > 1 ? current.slice(0, -1) : "0";
          return trimmed === "-" ? "0" : trimmed;
        });
        break;
      case "+/-":
        setError("");
        setDisplay((current) => {
          if (current === "0") return current;
          return current.startsWith("-") ? current.slice(1) : `-${current}`;
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="calculator-overlay" role="presentation" onClick={onClose}>
      <div
        className="calculator-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Calculator"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="calculator-header">
          <div>
            <div className="calculator-title">Calculator</div>
            <div className="muted small">Quick totals and checks</div>
          </div>
          <button className="btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="calculator-display">
          <span className="calculator-expression">
            {operator ? `${storedValue ?? 0} ${operator}` : "Ready"}
          </span>
          <strong>{displayValue}</strong>
          {error ? <span className="calculator-error">{error}</span> : null}
        </div>

        <div className="calculator-grid">
          {buttons.map((label) => (
            <button
              key={label}
              className={`calculator-key ${["+", "-", "*", "/", "%", "="].includes(label) ? "operator" : ""} ${label === "C" ? "danger" : ""}`}
              onClick={() => handlePress(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
