// ==========================
// SELECTORES
// ==========================
const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");

const filterCategory = document.getElementById("filter-category");
const filterType = document.getElementById("filter-type");
const filterSearch = document.getElementById("filter-search");

const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const totalBalance = document.getElementById("total-balance");
const monthlyGoalInput =
  document.getElementById("monthly-goal");

const saveGoalBtn =
  document.getElementById("save-goal-btn");

const progressFill =
  document.getElementById("progress-fill");

const goalPercentage =
  document.getElementById("goal-percentage");

const goalStatus =
  document.getElementById("goal-status");
const historicalIncome =
  document.getElementById("historical-income");

const historicalExpense =
  document.getElementById("historical-expense");

const historicalBalance =
  document.getElementById("historical-balance");
const monthlyInsights = document.getElementById("monthly-insights");
const monthlyComparison = document.getElementById("monthly-comparison");
const expenseChartCanvas = document.getElementById("expense-chart");
const currentMonthText = document.getElementById("current-month");

const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");


let transactions = [];
let editingId = null;
let expenseChart = null;


let monthlyGoals = {};
let filters = {
  type: "",
  category: "",
  search: "",
};

// ==========================
// MES ACTUAL
// ==========================

let selectedMonth =
  new Date().getMonth() + 1
let selectedYear = new Date().getFullYear();

// ==========================
// CATEGORÍAS
// ==========================
const categories = {
  ingreso: [
    { value: "trabajo", label: "Trabajo principal" },
    { value: "moto", label: "Moto" },
    { value: "otro", label: "Otro" },
  ],
  gasto: [
    { value: "vivienda", label: "Vivienda" },
    { value: "electricidad", label: "Electricidad" },
    { value: "gas", label: "Gas" },
    { value: "agua", label: "Agua" },
    { value: "internet", label: "Internet" },
    { value: "claro", label: "Claro" },
    { value: "universidad", label: "Universidad" },
    { value: "estudio", label: "Estudio" },
    { value: "comida", label: "Comida" },
    { value: "transporte", label: "Transporte" },
    { value: "gasolina", label: "Gasolina" },
    { value: "salud", label: "Salud" },
    { value: "entretenimiento", label: "Entretenimiento" },
    { value: "otros", label: "Otros" },
  ],
};

// ==========================
// LOCAL STORAGE
// ==========================
function loadTransactions() {
  const data = localStorage.getItem("transactions");
  transactions = data ? JSON.parse(data) : [];
}

function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

function saveGoals() {
  localStorage.setItem(
    "monthlyGoals",
    JSON.stringify(monthlyGoals)
  );
}

function loadGoals() {
  const data =
    localStorage.getItem("monthlyGoals");

  monthlyGoals = data
    ? JSON.parse(data)
    : {};
}

// ==========================
// UTILIDADES
// ==========================
function validateForm(data) {
  if (!data.type) {
    alert("Debes seleccionar un tipo (ingreso o gasto)");
    return false;
  }

  if (!data.amount || data.amount <= 0) {
    alert("El monto debe ser mayor a 0");
    return false;
  }

  if (!data.category) {
    alert("Debes seleccionar una categoría");
    return false;
  }

  return true;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function setDefaultDateTime() {
  const currentRealDate = new Date();

  const isCurrentMonth =
    selectedMonth === currentRealDate.getMonth() + 1 &&
    selectedYear === currentRealDate.getFullYear();

  let date;

  if (isCurrentMonth) {
    date = currentRealDate;
  } else {
    date = new Date(selectedYear, selectedMonth - 1, 1, 12, 0);
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formatted =
    `${year}-${month}-${day}T${hours}:${minutes}`;

  document.getElementById("date").value = formatted;
}

function updateCategories(type) {
  const categorySelect = document.getElementById("category");

  categorySelect.innerHTML = `<option value="">Selecciona una categoría</option>`;

  if (!type) return;

  categories[type].forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.value;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });
}

function getCategoryLabel(type, value) {
  const category = categories[type]?.find((c) => c.value === value);
  return category ? category.label : value;
}

function setFormMode() {
  const btn = form.querySelector("button[type='submit']");
  btn.textContent = editingId ? "Actualizar" : "Guardar";
}

function applyFilters(data) {
  return data.filter((tx) => {

    const txDate = new Date(tx.date);

    const sameMonth =
      txDate.getMonth() === selectedMonth &&
      txDate.getFullYear() === selectedYear;

    const matchType =
      filters.type ? tx.type === filters.type : true;

    const matchCategory =
      filters.category
        ? tx.category === filters.category
        : true;

    const matchSearch =
      filters.search
        ? (tx.description || "")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;

    return (
      sameMonth &&
      matchType &&
      matchCategory &&
      matchSearch
    );
  });
}

function updateFilterCategories(type) {
  filterCategory.innerHTML = `<option value="">Todas</option>`;

  if (!type) return;

  categories[type].forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.value;
    option.textContent = cat.label;
    filterCategory.appendChild(option);
  });
}

// ==========================
// MANEJO DE MESES
// ==========================

function getMonthName(month) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return months[month - 1];
}

function updateMonthUI() {
  const monthLabel = document.getElementById("current-month");

  if (!monthLabel) return;

  monthLabel.textContent =
    `${getMonthName(selectedMonth)} ${selectedYear}`;
}

function changeMonth(direction) {
  selectedMonth += direction;

  if (selectedMonth > 11) {
    selectedMonth = 0;
    selectedYear++;
  }

  if (selectedMonth < 0) {
    selectedMonth = 11;
    selectedYear--;
  }

  updateMonthUI();
  updateUI();
}

function updateMonthDisplay() {
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  currentMonthText.textContent =
    `${monthNames[selectedMonth - 1]} ${selectedYear}`;
}

// ==========================
// EDITAR
// ==========================
function editTransaction(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;

  editingId = id;

  form.type.value = tx.type;
  updateCategories(tx.type);

  form.category.value = tx.category;
  form.amount.value = tx.amount;
  form.date.value = tx.date;
  form.description.value = tx.description;

  setFormMode();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================
// CRUD
// ==========================
function createTransaction(data) {
  const transactionDate = new Date(data.date);

  return {
    id: Date.now(),

    type: data.type,
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: data.date,

    month: transactionDate.getMonth() + 1,
    year: transactionDate.getFullYear(),

    createdAt: new Date().toISOString(),
  };
}

function deleteTransaction(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar esta transacción?");
  if (!confirmDelete) return;

  transactions = transactions.filter((tx) => tx.id !== id);
  saveTransactions();
  updateUI();
}

// ==========================
// RENDER
// ==========================
function renderTransactions() {
  list.innerHTML = "";

  const filtered = applyFilters(transactions);

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  const sortedTransactions = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sortedTransactions.forEach((tx) => {
    const item = document.createElement("article");
    item.classList.add("transaction-item");

    item.innerHTML = `
      <div class="transaction-info">
        <h4>${tx.description || "Sin descripción"}</h4>
        <p>Categoría: ${getCategoryLabel(tx.type, tx.category)}</p>
      </div>

      <div class="transaction-meta">
        <span class="amount ${tx.type}">
          ${tx.type === "ingreso" ? "+" : "-"}${formatCurrency(tx.amount)}
        </span>

        <span class="date">${formatDate(tx.date)}</span>

        <div class="actions">
          <button class="btn-edit" onclick="editTransaction(${tx.id})">
            Editar
          </button>

          <button class="btn-danger" onclick="deleteTransaction(${tx.id})">
            Eliminar
          </button>
        </div>
      </div>
    `;

    list.appendChild(item);
  });
}

// ==========================
// RESUMEN
// ==========================
function calculateSummary() {

  const filtered = applyFilters(transactions);

  let income = 0;
  let expense = 0;

  filtered.forEach((tx) => {

    if (tx.type === "ingreso") {
      income += tx.amount;
    } else {
      expense += tx.amount;
    }

  });

  const balance = income - expense;

  totalIncome.textContent = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);
  totalBalance.textContent = formatCurrency(balance);
}


// ==========================
// INSIGHTS
// ==========================


function renderMonthlyInsights() {
  const filteredTransactions = applyFilters(transactions);

  const expenses = filteredTransactions.filter(
    (tx) => tx.type === "gasto"
  );

  if (expenses.length === 0) {
    monthlyInsights.innerHTML = `
      <p>No hay gastos registrados en este mes.</p>
    `;
    return;
  }

  const categoryTotals = {};

  expenses.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = 0;
    }

    categoryTotals[tx.category] += tx.amount;
  });

  let topCategory = null;
  let topAmount = 0;

  for (const category in categoryTotals) {
    if (categoryTotals[category] > topAmount) {
      topAmount = categoryTotals[category];
      topCategory = category;
    }
  }

  const totalExpenses = expenses.reduce(
    (acc, tx) => acc + tx.amount,
    0
  );

  const percentage =
    ((topAmount / totalExpenses) * 100).toFixed(1);

  monthlyInsights.innerHTML = `
    <div class="insight-card">
      <h3>Mayor gasto del mes</h3>

      <p>
        ${getCategoryLabel("gasto", topCategory)}
      </p>

      <strong>
        ${formatCurrency(topAmount)}
      </strong>

      <span>
        ${percentage}% de tus gastos mensuales
      </span>
    </div>
  `;
}


/** Compara los gastos del mes seleccionado con el mes anterior y muestra si hubo un aumento o disminución, junto con el porcentaje de cambio. */
function renderMonthlyComparison() {
  const currentMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);

    return (
      date.getMonth() + 1 === selectedMonth &&
      date.getFullYear() === selectedYear &&
      tx.type === "gasto"
    );
  });

  let previousMonth = selectedMonth - 1;
  let previousYear = selectedYear;

  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear--;
  }

  const previousMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date);

    return (
      date.getMonth() + 1 === previousMonth &&
      date.getFullYear() === previousYear &&
      tx.type === "gasto"
    );
  });

  const currentTotal = currentMonthTransactions.reduce(
    (acc, tx) => acc + tx.amount,
    0
  );

  const previousTotal = previousMonthTransactions.reduce(
    (acc, tx) => acc + tx.amount,
    0
  );

  if (previousTotal === 0) {
    monthlyComparison.innerHTML = `
      <div class="comparison-card">
        <h3>Comparación mensual</h3>

        <p>
          No hay datos suficientes del mes anterior.
        </p>
      </div>
    `;

    return;
  }

  const difference = currentTotal - previousTotal;

  const percentage =
    ((Math.abs(difference) / previousTotal) * 100).toFixed(1);

  const isIncrease = difference > 0;

  monthlyComparison.innerHTML = `
    <div class="comparison-card">
      <h3>Comparación mensual</h3>

      <p>
        Mes anterior:
        <strong>${formatCurrency(previousTotal)}</strong>
      </p>

      <p>
        Mes actual:
        <strong>${formatCurrency(currentTotal)}</strong>
      </p>

      <span class="${
        isIncrease ? "comparison-danger" : "comparison-success"
      }">
        ${
          isIncrease
            ? `Tus gastos aumentaron un ${percentage}%`
            : `Tus gastos disminuyeron un ${percentage}%`
        }
      </span>
    </div>
  `;
}
/** Calcula el balance histórico sumando todos los ingresos y restando todos los gastos registrados, sin importar el mes o año. Muestra el total de ingresos, gastos y el balance resultante. */
function calculateHistoricalBalance() {
  let totalHistoricalIncome = 0;

  let totalHistoricalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "ingreso") {
      totalHistoricalIncome += tx.amount;
    } else {
      totalHistoricalExpense += tx.amount;
    }
  });

  const totalHistoricalBalance =
    totalHistoricalIncome - totalHistoricalExpense;

  historicalIncome.textContent =
    formatCurrency(totalHistoricalIncome);

  historicalExpense.textContent =
    formatCurrency(totalHistoricalExpense);

  historicalBalance.textContent =
    formatCurrency(totalHistoricalBalance);
}

function renderMonthlyGoal() {
  const key =
    `${selectedYear}-${selectedMonth}`;

  const goal = monthlyGoals[key] || 0;

  monthlyGoalInput.value = goal || "";

  const currentMonthTransactions =
    transactions.filter((tx) => {
      const date = new Date(tx.date);

      return (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });

  let income = 0;
  let expense = 0;

  currentMonthTransactions.forEach((tx) => {
    if (tx.type === "ingreso") {
      income += tx.amount;
    } else {
      expense += tx.amount;
    }
  });

  const balance = income - expense;

  if (goal <= 0) {
    progressFill.style.width = "0%";

    goalPercentage.textContent = "0%";

    goalStatus.textContent =
      "Aún no hay meta configurada.";

    return;
  }

  const percentage =
    Math.min((balance / goal) * 100, 100);

  progressFill.style.width =
    `${percentage}%`;

  goalPercentage.textContent =
    `${percentage.toFixed(1)}%`;

  goalStatus.textContent =
    `Has acumulado ${formatCurrency(balance)}
    de ${formatCurrency(goal)}`;
}

// ==========================
// UI
// ==========================
function renderExpenseChart() {
  const filteredTransactions = applyFilters(transactions);

  const expenses = filteredTransactions.filter(
    (tx) => tx.type === "gasto"
  );

  const categoryTotals = {};

  expenses.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = 0;
    }

    categoryTotals[tx.category] += tx.amount;
  });

  const labels = Object.keys(categoryTotals).map((category) =>
    getCategoryLabel("gasto", category)
  );

  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  if (labels.length === 0) {
    return;
  }

  expenseChart = new Chart(expenseChartCanvas, {
    type: "doughnut",

    data: {
      labels,

      datasets: [
        {
          label: "Gastos",

          data,

          backgroundColor: [
            "#ef4444",
            "#f59e0b",
            "#22c55e",
            "#38bdf8",
            "#8b5cf6",
            "#ec4899",
            "#14b8a6",
            "#f97316",
          ],

          borderWidth: 2,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: "#e2e8f0",
          },
        },
      },
    },
  });
}

function updateUI() {
  renderTransactions();

  calculateSummary();

  renderMonthlyGoal();

  calculateHistoricalBalance();

  renderMonthlyInsights();

  renderMonthlyComparison();

  renderExpenseChart();
}

// ==========================
// EVENTOS
// ==========================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    type: form.type.value,
    amount: Number(form.amount.value),
    category: form.category.value,
    date: form.date.value,
    description: form.description.value,
  };

  if (!validateForm(data)) return;

  if (editingId) {
    transactions = transactions.map((tx) =>
      tx.id === editingId ? { ...tx, ...data } : tx
    );
    editingId = null;
  } else {
    const newTransaction = createTransaction(data);
    transactions.push(newTransaction);
  }

  saveTransactions();
  updateUI();

  form.reset();
  updateCategories("");
  setDefaultDateTime();
  setFormMode();
});

form.type.addEventListener("change", (e) => {
  updateCategories(e.target.value);
});

// Filtro por tipo
filterType.addEventListener("change", (e) => {
  filters.type = e.target.value;

  filters.category = "";
  filterCategory.value = "";

  updateFilterCategories(filters.type);
  updateUI();
});

// Filtro por categoría
filterCategory.addEventListener("change", (e) => {
  filters.category = e.target.value;
  updateUI();
});

// Filtro por búsqueda
filterSearch.addEventListener("input", (e) => {
  filters.search = e.target.value;
  updateUI();
});


saveGoalBtn.addEventListener("click", () => {
  const key =
    `${selectedYear}-${selectedMonth}`;

  monthlyGoals[key] =
    Number(monthlyGoalInput.value);

  saveGoals();

  renderMonthlyGoal();
});


// ==========================
// INIT
// ==========================
prevMonthBtn.addEventListener("click", () => {
  selectedMonth--;

  if (selectedMonth < 1) {
    selectedMonth = 12;
    selectedYear--;
  }

  updateMonthDisplay();
  setDefaultDateTime();
  updateUI();
});

nextMonthBtn.addEventListener("click", () => {
  selectedMonth++;

  if (selectedMonth > 12) {
    selectedMonth = 1;
    selectedYear++;
  }

  updateMonthDisplay();
  setDefaultDateTime();
  updateUI();
});

function init() {
  loadTransactions();


  loadGoals();

  setDefaultDateTime();

  setFormMode();

  updateMonthDisplay();

  updateUI();

  updateFilterCategories("");

  updateMonthUI();
}

init();