// ---------- Grab references to the display elements ----------
const historyEl = document.getElementById("history");
const currentEl = document.getElementById("current");

// ---------- Calculator state ----------
// We keep the calculation as separate pieces instead of a raw string
// so we never need eval(). This mirrors how a real calculator works:
// firstOperand (op) secondOperand = result
let firstOperand = null;
let operator = null;
let secondOperand = "";
let justEvaluated = false; // true right after "=" was pressed

// ---------- Helpers ----------

// Performs the actual math for a given operator. Safe (no eval()).
function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    case "%":
      return a % b;
    default:
      return b;
  }
}

// Updates what the user sees on screen
function updateDisplay() {
  // Show the second operand while typing, otherwise show the first operand
  currentEl.textContent = secondOperand !== "" ? secondOperand : (firstOperand ?? "0");

  if (operator && firstOperand !== null) {
    historyEl.textContent = `${firstOperand} ${operator}`;
  } else {
    historyEl.textContent = "";
  }
}

// Resets the calculator back to its initial state
function clearAll() {
  firstOperand = null;
  operator = null;
  secondOperand = "";
  justEvaluated = false;
  updateDisplay();
}

// Appends a digit (or the initial "0") to the number currently being typed
function inputNumber(digit) {
  // Starting a fresh number right after pressing "=" begins a new calculation
  if (justEvaluated) {
    firstOperand = null;
    operator = null;
    secondOperand = "";
    justEvaluated = false;
  }

  // Avoid leading zeros like "007"
  if (digit === "0" && secondOperand === "0") return;

  secondOperand += digit;
  updateDisplay();
}

// Adds a decimal point, but only one per number
function inputDecimal() {
  if (justEvaluated) {
    firstOperand = null;
    operator = null;
    secondOperand = "";
    justEvaluated = false;
  }

  if (secondOperand === "") {
    secondOperand = "0.";
  } else if (!secondOperand.includes(".")) {
    secondOperand += ".";
  }
  updateDisplay();
}

// Handles +, -, ×, ÷ and %
function inputOperator(nextOperator) {
  // If the user is chaining operations (e.g. 5 + 3 +), evaluate the pending one first
  if (firstOperand !== null && operator && secondOperand !== "") {
    try {
      firstOperand = calculate(firstOperand, secondOperand, operator);
    } catch (err) {
      showError(err.message);
      return;
    }
  } else if (secondOperand !== "") {
    firstOperand = parseFloat(secondOperand);
  }

  operator = nextOperator;
  secondOperand = "";
  justEvaluated = false;
  updateDisplay();
}

// Handles "="
function evaluateResult() {
  if (operator === null || secondOperand === "") return;

  try {
    const result = calculate(firstOperand, secondOperand, operator);
    historyEl.textContent = `${firstOperand} ${operator} ${secondOperand} =`;
    firstOperand = result;
    secondOperand = "";
    operator = null;
    justEvaluated = true;
    currentEl.textContent = firstOperand;
  } catch (err) {
    showError(err.message);
  }
}

// Removes the last character typed (backspace)
function deleteLast() {
  secondOperand = secondOperand.slice(0, -1);
  updateDisplay();
}

// Displays an error message and resets the state so the app doesn't crash
function showError(message) {
  currentEl.textContent = message === "Cannot divide by zero" ? "Error: ÷0" : "Error";
  historyEl.textContent = "";
  firstOperand = null;
  operator = null;
  secondOperand = "";
  justEvaluated = true; // next keypress starts fresh
}

// ---------- Event wiring: mouse / touch clicks ----------
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", () => {
    const { action, value } = button.dataset;

    switch (action) {
      case "number":
        inputNumber(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        inputOperator(value);
        break;
      case "equals":
        evaluateResult();
        break;
      case "clear":
        clearAll();
        break;
      case "delete":
        deleteLast();
        break;
    }
  });
});

// ---------- Event wiring: keyboard input ----------
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    inputNumber(e.key);
  } else if (e.key === ".") {
    inputDecimal();
  } else if (e.key === "+" || e.key === "-") {
    inputOperator(e.key);
  } else if (e.key === "*") {
    inputOperator("×");
  } else if (e.key === "/") {
    e.preventDefault(); // stop browser's quick-find from opening
    inputOperator("÷");
  } else if (e.key === "%") {
    inputOperator("%");
  } else if (e.key === "Enter" || e.key === "=") {
    evaluateResult();
  } else if (e.key === "Backspace") {
    deleteLast();
  } else if (e.key === "Escape") {
    clearAll();
  }
});

// ---------- Initial render ----------
updateDisplay();
