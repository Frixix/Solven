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
const monthlyGoalInput = document.getElementById("monthly-goal");
const saveGoalBtn = document.getElementById("save-goal-btn");
const progressFill = document.getElementById("progress-fill");
const goalPercentage = document.getElementById("goal-percentage");
const goalStatus = document.getElementById("goal-status");
const historicalIncome = document.getElementById("historical-income");
const historicalExpense = document.getElementById("historical-expense");
const historicalBalance = document.getElementById("historical-balance");
const monthlyInsights = document.getElementById("monthly-insights");
const monthlyComparison = document.getElementById("monthly-comparison");
const expenseChartCanvas = document.getElementById("expense-chart");
const currentMonthText = document.getElementById("current-month");

let transactions = [];
let editingId = null;
let expenseChart = null;
let monthlyGoals = {};
let filters = { type: "", category: "", search: "" };

// selectedMonth: base-0 siempre (0=Enero ... 11=Diciembre)
let selectedMonth = new Date().getMonth();
let selectedYear  = new Date().getFullYear();

// ==========================
// CATEGORIAS
// ==========================
const categories = {
  ingreso: [
    { value: "trabajo", label: "Trabajo principal" },
    { value: "moto",    label: "Moto" },
    { value: "otro",    label: "Otro" },
  ],
  gasto: [
    { value: "vivienda",        label: "Vivienda" },
    { value: "electricidad",    label: "Electricidad" },
    { value: "gas",             label: "Gas" },
    { value: "agua",            label: "Agua" },
    { value: "internet",        label: "Internet" },
    { value: "claro",           label: "Claro" },
    { value: "universidad",     label: "Universidad" },
    { value: "estudio",         label: "Estudio" },
    { value: "comida",          label: "Comida" },
    { value: "transporte",      label: "Transporte" },
    { value: "gasolina",        label: "Gasolina" },
    { value: "salud",           label: "Salud" },
    { value: "entretenimiento", label: "Entretenimiento" },
    { value: "otros",           label: "Otros" },
  ],
};

// ==========================
// UTILIDAD CLAVE: parsear mes/año del string de fecha
// "YYYY-MM-DDTHH:mm" -> { year, month (base-0), day }
// NO usa new Date() para evitar bugs de timezone
// ==========================
function parseDateString(dateString) {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return { year, month: month - 1, day };
}

// ==========================
// LOCAL STORAGE + MIGRACION
// ==========================
function migrateTransactions(list) {
  return list.map((tx) => {
    if (!tx.date) return tx;
    const { year, month } = parseDateString(tx.date);
    return { ...tx, month, year };
  });
}

function loadTransactions() {
  const raw = localStorage.getItem("transactions");
  const parsed = raw ? JSON.parse(raw) : [];
  transactions = migrateTransactions(parsed);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // DEBUG - quitar cuando confirmes que funciona
  console.group("[DEBUG] Estado al cargar");
  console.log("Mes seleccionado (base-0):", selectedMonth, "Año:", selectedYear);
  transactions.forEach((tx) => {
    const { month, year } = parseDateString(tx.date);
    console.log(
      "date:", tx.date,
      "| mes parseado:", month,
      "| año:", year,
      "| coincide:", month === selectedMonth && year === selectedYear
    );
  });
  console.groupEnd();
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function saveGoals() {
  localStorage.setItem("monthlyGoals", JSON.stringify(monthlyGoals));
}

function loadGoals() {
  const data = localStorage.getItem("monthlyGoals");
  monthlyGoals = data ? JSON.parse(data) : {};
}

// ==========================
// VALIDACION Y FORMATO
// ==========================
function validateForm(data) {
  if (!data.type)                    { alert("Debes seleccionar un tipo (ingreso o gasto)"); return false; }
  if (!data.amount || data.amount <= 0) { alert("El monto debe ser mayor a 0"); return false; }
  if (!data.category)                { alert("Debes seleccionar una categoria"); return false; }
  return true;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString) {
  const { year, month, day } = parseDateString(dateString);
  const timePart = dateString.split("T")[1] || "00:00";
  const [hours, minutes] = timePart.split(":").map(Number);
  const d = new Date(year, month, day, hours, minutes);
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function setDefaultDateTime() {
  const now = new Date();
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  let Y, M, D, h, m;
  if (isCurrentMonth) {
    Y = now.getFullYear();
    M = String(now.getMonth() + 1).padStart(2, "0");
    D = String(now.getDate()).padStart(2, "0");
    h = String(now.getHours()).padStart(2, "0");
    m = String(now.getMinutes()).padStart(2, "0");
  } else {
    Y = selectedYear;
    M = String(selectedMonth + 1).padStart(2, "0");
    D = "01";
    h = "12";
    m = "00";
  }
  document.getElementById("date").value = `${Y}-${M}-${D}T${h}:${m}`;
}

// ==========================
// CATEGORIAS UI
// ==========================
function updateCategories(type) {
  const sel = document.getElementById("category");
  sel.innerHTML = `<option value="">Selecciona una categoria</option>`;
  if (!type) return;
  categories[type].forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value; opt.textContent = label;
    sel.appendChild(opt);
  });
}

function getCategoryLabel(type, value) {
  return categories[type]?.find((c) => c.value === value)?.label ?? value;
}

function setFormMode() {
  form.querySelector("button[type='submit']").textContent = editingId ? "Actualizar" : "Guardar";
}

// ==========================
// FILTROS
// Toda comparacion de mes/year usa parseDateString(), nunca new Date(tx.date)
// ==========================
function applyFilters(data) {
  return data.filter((tx) => {
    const { year: txYear, month: txMonth } = parseDateString(tx.date);
    const sameMonth   = txMonth === selectedMonth && txYear === selectedYear;
    const matchType   = filters.type     ? tx.type     === filters.type     : true;
    const matchCat    = filters.category ? tx.category === filters.category : true;
    const matchSearch = filters.search
      ? (tx.description || "").toLowerCase().includes(filters.search.toLowerCase())
      : true;
    return sameMonth && matchType && matchCat && matchSearch;
  });
}

function updateFilterCategories(type) {
  filterCategory.innerHTML = `<option value="">Todas</option>`;
  if (!type) return;
  categories[type].forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value; opt.textContent = label;
    filterCategory.appendChild(opt);
  });
}

// ==========================
// NAVEGACION DE MESES
// ==========================
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function updateMonthUI() {
  if (currentMonthText) {
    currentMonthText.textContent = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  }
}

function changeMonth(direction) {
  selectedMonth += direction;
  if (selectedMonth > 11) { selectedMonth = 0;  selectedYear++; }
  if (selectedMonth < 0)  { selectedMonth = 11; selectedYear--; }
  updateMonthUI();
  setDefaultDateTime();
  updateUI();
}

// ==========================
// CRUD
// ==========================
function createTransaction(data) {
  const { year, month } = parseDateString(data.date);
  return {
    id: Date.now(),
    type: data.type, amount: data.amount,
    category: data.category, description: data.description,
    date: data.date, month, year,
    createdAt: new Date().toISOString(),
  };
}

function editTransaction(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;
  editingId = id;
  form.type.value        = tx.type;
  updateCategories(tx.type);
  form.category.value    = tx.category;
  form.amount.value      = tx.amount;
  form.date.value        = tx.date;
  form.description.value = tx.description;
  setFormMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteTransaction(id) {
  if (!confirm("Seguro que quieres eliminar esta transaccion?")) return;
  transactions = transactions.filter((tx) => tx.id !== id);
  saveTransactions();
  updateUI();
}

// ==========================
// RENDER TRANSACCIONES
// ==========================
function renderTransactions() {
  list.innerHTML = "";
  const filtered = applyFilters(transactions);
  if (filtered.length === 0) { emptyState.style.display = "block"; return; }
  emptyState.style.display = "none";

  [...filtered]
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((tx) => {
      const item = document.createElement("article");
      item.classList.add("transaction-item");
      item.innerHTML = `
        <div class="transaction-info">
          <h4>${tx.description || "Sin descripcion"}</h4>
          <p>Categoria: ${getCategoryLabel(tx.type, tx.category)}</p>
        </div>
        <div class="transaction-meta">
          <span class="amount ${tx.type}">
            ${tx.type === "ingreso" ? "+" : "-"}${formatCurrency(tx.amount)}
          </span>
          <span class="date">${formatDate(tx.date)}</span>
          <div class="actions">
            <button class="btn-edit"   onclick="editTransaction(${tx.id})">Editar</button>
            <button class="btn-danger" onclick="deleteTransaction(${tx.id})">Eliminar</button>
          </div>
        </div>`;
      list.appendChild(item);
    });
}

// ==========================
// RESUMEN MENSUAL
// ==========================
function calculateSummary() {
  const filtered = applyFilters(transactions);
  let income = 0, expense = 0;
  filtered.forEach((tx) => {
    if (tx.type === "ingreso") income += tx.amount;
    else expense += tx.amount;
  });
  totalIncome.textContent  = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);
  totalBalance.textContent = formatCurrency(income - expense);
}

// ==========================
// INSIGHTS
// ==========================
function renderMonthlyInsights() {
  const expenses = applyFilters(transactions).filter((tx) => tx.type === "gasto");
  if (expenses.length === 0) {
    monthlyInsights.innerHTML = `<p>No hay gastos registrados en este mes.</p>`;
    return;
  }
  const totals = {};
  expenses.forEach(({ category, amount }) => { totals[category] = (totals[category] || 0) + amount; });
  const topCat  = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
  const topAmt  = totals[topCat];
  const totalEx = expenses.reduce((s, tx) => s + tx.amount, 0);
  const pct     = ((topAmt / totalEx) * 100).toFixed(1);
  monthlyInsights.innerHTML = `
    <div class="insight-card">
      <h3>Mayor gasto del mes</h3>
      <p>${getCategoryLabel("gasto", topCat)}</p>
      <strong>${formatCurrency(topAmt)}</strong>
      <span>${pct}% de tus gastos mensuales</span>
    </div>`;
}

// ==========================
// COMPARACION MENSUAL
// ==========================
function renderMonthlyComparison() {
  const byMonth = (m, y, type) =>
    transactions.filter((tx) => {
      const { month, year } = parseDateString(tx.date);
      return month === m && year === y && tx.type === type;
    });

  let prevMonth = selectedMonth - 1, prevYear = selectedYear;
  if (prevMonth < 0) { prevMonth = 11; prevYear--; }

  const currentTotal  = byMonth(selectedMonth, selectedYear, "gasto").reduce((s, tx) => s + tx.amount, 0);
  const previousTotal = byMonth(prevMonth,     prevYear,     "gasto").reduce((s, tx) => s + tx.amount, 0);

  if (previousTotal === 0) {
    monthlyComparison.innerHTML = `
      <div class="comparison-card">
        <h3>Comparacion mensual</h3>
        <p>No hay datos suficientes del mes anterior.</p>
      </div>`;
    return;
  }
  const diff = currentTotal - previousTotal;
  const pct  = ((Math.abs(diff) / previousTotal) * 100).toFixed(1);
  const up   = diff > 0;
  monthlyComparison.innerHTML = `
    <div class="comparison-card">
      <h3>Comparacion mensual</h3>
      <p>Mes anterior: <strong>${formatCurrency(previousTotal)}</strong></p>
      <p>Mes actual:   <strong>${formatCurrency(currentTotal)}</strong></p>
      <span class="${up ? "comparison-danger" : "comparison-success"}">
        ${up ? `Tus gastos aumentaron un ${pct}%` : `Tus gastos disminuyeron un ${pct}%`}
      </span>
    </div>`;
}

// ==========================
// BALANCE HISTORICO
// ==========================
function calculateHistoricalBalance() {
  let inc = 0, exp = 0;
  transactions.forEach((tx) => {
    if (tx.type === "ingreso") inc += tx.amount; else exp += tx.amount;
  });
  historicalIncome.textContent  = formatCurrency(inc);
  historicalExpense.textContent = formatCurrency(exp);
  historicalBalance.textContent = formatCurrency(inc - exp);
}

// ==========================
// META MENSUAL
// ==========================
function renderMonthlyGoal() {
  const key  = `${selectedYear}-${selectedMonth}`;
  const goal = monthlyGoals[key] || 0;
  monthlyGoalInput.value = goal || "";

  const txs = transactions.filter((tx) => {
    const { month, year } = parseDateString(tx.date);
    return month === selectedMonth && year === selectedYear;
  });

  let income = 0, expense = 0;
  txs.forEach((tx) => { if (tx.type === "ingreso") income += tx.amount; else expense += tx.amount; });
  const balance = income - expense;

  if (goal <= 0) {
    progressFill.style.width   = "0%";
    goalPercentage.textContent = "0%";
    goalStatus.textContent     = "Aun no hay meta configurada.";
    return;
  }
  const pct = Math.min((balance / goal) * 100, 100);
  progressFill.style.width   = `${pct}%`;
  goalPercentage.textContent = `${pct.toFixed(1)}%`;
  goalStatus.textContent     = `Has acumulado ${formatCurrency(balance)} de ${formatCurrency(goal)}`;
}

// ==========================
// GRAFICO
// ==========================
function renderExpenseChart() {
  const expenses = applyFilters(transactions).filter((tx) => tx.type === "gasto");
  const totals   = {};
  expenses.forEach(({ category, amount }) => { totals[category] = (totals[category] || 0) + amount; });

  const labels = Object.keys(totals).map((c) => getCategoryLabel("gasto", c));
  const data   = Object.values(totals);

  if (expenseChart) expenseChart.destroy();
  if (labels.length === 0) return;

  expenseChart = new Chart(expenseChartCanvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Gastos", data,
        backgroundColor: ["#ef4444","#f59e0b","#22c55e","#38bdf8","#8b5cf6","#ec4899","#14b8a6","#f97316"],
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#e2e8f0" } } },
    },
  });
}

// ==========================
// UPDATE GENERAL
// ==========================
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
    type: form.type.value, amount: Number(form.amount.value),
    category: form.category.value, date: form.date.value,
    description: form.description.value,
  };
  if (!validateForm(data)) return;

  if (editingId) {
    const { year, month } = parseDateString(data.date);
    transactions = transactions.map((tx) =>
      tx.id === editingId ? { ...tx, ...data, month, year } : tx
    );
    editingId = null;
  } else {
    transactions.push(createTransaction(data));
  }

  saveTransactions();
  updateUI();
  form.reset();
  updateCategories("");
  setDefaultDateTime();
  setFormMode();
});

form.type.addEventListener("change", (e) => updateCategories(e.target.value));

filterType.addEventListener("change", (e) => {
  filters.type = e.target.value; filters.category = ""; filterCategory.value = "";
  updateFilterCategories(filters.type); updateUI();
});

filterCategory.addEventListener("change", (e) => { filters.category = e.target.value; updateUI(); });
filterSearch.addEventListener("input",    (e) => { filters.search   = e.target.value; updateUI(); });

saveGoalBtn.addEventListener("click", () => {
  const key = `${selectedYear}-${selectedMonth}`;
  monthlyGoals[key] = Number(monthlyGoalInput.value);
  saveGoals(); renderMonthlyGoal();
});

// ==========================
// INIT
// ==========================
function init() {
  loadTransactions();
  loadGoals();
  setDefaultDateTime();
  setFormMode();
  updateMonthUI();
  updateUI();
  updateFilterCategories("");
}

init();