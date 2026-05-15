// ==========================
// SUPABASE
// ==========================

const SUPABASE_URL =
  "https://hgarfttbkoqvtqczfqkx.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYXJmdHRia29xdnRxY3pmcWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTAyNjksImV4cCI6MjA5NDI4NjI2OX0.YJ3LQmlir9b8KWMbRxWu6hqrQY8YeC2TaWA8IwySybQ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ==========================
// TEST CONEXION
// ==========================

async function testConnection() {
  console.log("Supabase conectado:", supabaseClient);
}

testConnection();

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

async function saveTransactionToSupabase(transaction) {

  const { data, error } = await supabaseClient
    .from("transactions")
    .insert([transaction]);

  if (error) {
    console.error("Error guardando en Supabase:", error);
    return false;
  }

  console.log("Transacción guardada:", data);

  return true;
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

    renderAnalytics();
}

// ==========================
// EVENTOS
// ==========================
form.addEventListener("submit", async (e) => {
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
    const newTransaction = createTransaction(data);

    const success = await saveTransactionToSupabase(newTransaction);

    if (!success) {
      alert("No se pudo guardar en Supabase");
      return;
    }

    transactions.push(newTransaction);
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
// ANALYTICS: Evolución histórica, Balance acumulado, Tendencia financiera
// Se integra al app.js existente — agregar al final antes de init()
// y llamar renderAnalytics() dentro de updateUI()
// ==========================

let evolutionChart  = null;
let balanceChart    = null;
let tendencyChart   = null;

// Obtiene los últimos N meses desde el mes actual, en orden cronológico
// Retorna array de { month (base-0), year, label }
function getLastNMonths(n) {
  const result = [];
  let m = selectedMonth;
  let y = selectedYear;
  for (let i = 0; i < n; i++) {
    result.unshift({ month: m, year: y, label: `${MONTH_NAMES[m].slice(0,3)} ${y}` });
    m--;
    if (m < 0) { m = 11; y--; }
  }
  return result;
}

// Suma ingresos y gastos de un mes/año concreto
function getTotalsForMonth(month, year) {
  let income = 0, expense = 0;
  transactions.forEach((tx) => {
    const p = parseDateString(tx.date);
    if (p.month === month && p.year === year) {
      if (tx.type === "ingreso") income += tx.amount;
      else expense += tx.amount;
    }
  });
  return { income, expense, balance: income - expense };
}

// ==========================
// TARJETAS DE RESUMEN ANALÍTICO
// ==========================
function renderAnalyticCards() {
  const months6 = getLastNMonths(6);

  // Promedio mensual de ingresos y gastos (últimos 6 meses)
  let totalInc = 0, totalExp = 0, monthsWithData = 0;
  months6.forEach(({ month, year }) => {
    const t = getTotalsForMonth(month, year);
    if (t.income > 0 || t.expense > 0) {
      totalInc += t.income;
      totalExp += t.expense;
      monthsWithData++;
    }
  });
  const avgIncome  = monthsWithData ? totalInc / monthsWithData : 0;
  const avgExpense = monthsWithData ? totalExp / monthsWithData : 0;

  // Mejor mes (mayor balance)
  let bestMonth = null, bestBalance = -Infinity;
  months6.forEach(({ month, year, label }) => {
    const { balance } = getTotalsForMonth(month, year);
    if (balance > bestBalance) { bestBalance = balance; bestMonth = label; }
  });

  // Tendencia: compara últimos 2 meses
  const cur  = getTotalsForMonth(selectedMonth, selectedYear);
  let prevM  = selectedMonth - 1, prevY = selectedYear;
  if (prevM < 0) { prevM = 11; prevY--; }
  const prev = getTotalsForMonth(prevM, prevY);
  const trendPct = prev.expense > 0
    ? (((cur.expense - prev.expense) / prev.expense) * 100).toFixed(1)
    : null;
  const trendUp = cur.expense > prev.expense;

  const container = document.getElementById("analytic-cards");
  if (!container) return;

  container.innerHTML = `
    <div class="analytic-card">
      <div class="analytic-icon">📈</div>
      <div class="analytic-body">
        <span class="analytic-label">Ingreso promedio mensual</span>
        <strong class="analytic-value income">${formatCurrency(avgIncome)}</strong>
        <span class="analytic-sub">${monthsWithData ? `Últimos ${monthsWithData} meses` : "Sin datos aún"}</span>
      </div>
    </div>
    <div class="analytic-card">
      <div class="analytic-icon">📉</div>
      <div class="analytic-body">
        <span class="analytic-label">Gasto promedio mensual</span>
        <strong class="analytic-value expense">${formatCurrency(avgExpense)}</strong>
        <span class="analytic-sub">${monthsWithData ? `Últimos ${monthsWithData} meses` : "Sin datos aún"}</span>
      </div>
    </div>
    <div class="analytic-card">
      <div class="analytic-icon">🏆</div>
      <div class="analytic-body">
        <span class="analytic-label">Mejor balance reciente</span>
        <strong class="analytic-value ${bestBalance >= 0 ? "income" : "expense"}">${formatCurrency(bestBalance === -Infinity ? 0 : bestBalance)}</strong>
        <span class="analytic-sub">${bestMonth || "Sin datos"}</span>
      </div>
    </div>
    <div class="analytic-card">
      <div class="analytic-icon">${trendUp ? "🔴" : "🟢"}</div>
      <div class="analytic-body">
        <span class="analytic-label">Tendencia de gastos</span>
        <strong class="analytic-value ${trendUp ? "expense" : "income"}">
          ${trendPct !== null ? `${trendUp ? "+" : ""}${trendPct}%` : "—"}
        </strong>
        <span class="analytic-sub">vs mes anterior</span>
      </div>
    </div>`;
}

// ==========================
// GRÁFICA 1: Evolución histórica (barras ingresos vs gastos, últimos 6 meses)
// ==========================
function renderEvolutionChart() {
  const canvas = document.getElementById("evolution-chart");
  if (!canvas) return;

  const months = getLastNMonths(6);
  const labels  = months.map((m) => m.label);
  const incomes  = months.map(({ month, year }) => getTotalsForMonth(month, year).income);
  const expenses = months.map(({ month, year }) => getTotalsForMonth(month, year).expense);

  if (evolutionChart) evolutionChart.destroy();

  evolutionChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: incomes,
          backgroundColor: "rgba(34,197,94,0.75)",
          borderColor: "#22c55e",
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: "Gastos",
          data: expenses,
          backgroundColor: "rgba(239,68,68,0.75)",
          borderColor: "#ef4444",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(71,85,105,0.3)" } },
        y: {
          ticks: {
            color: "#94a3b8",
            callback: (v) => {
              if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
              if (v >= 1_000)    return `$${(v/1_000).toFixed(0)}K`;
              return `$${v}`;
            },
          },
          grid: { color: "rgba(71,85,105,0.3)" },
        },
      },
    },
  });
}

// ==========================
// GRÁFICA 2: Balance acumulado mensual (línea)
// ==========================
function renderBalanceChart() {
  const canvas = document.getElementById("balance-chart");
  if (!canvas) return;

  const months = getLastNMonths(6);
  const labels  = months.map((m) => m.label);

  // Balance acumulado: suma progresiva de todos los balances mes a mes
  let accumulated = 0;
  const accBalances = months.map(({ month, year }) => {
    const { balance } = getTotalsForMonth(month, year);
    accumulated += balance;
    return accumulated;
  });

  // Balance neto de cada mes (sin acumular)
  const monthlyBalances = months.map(({ month, year }) =>
    getTotalsForMonth(month, year).balance
  );

  if (balanceChart) balanceChart.destroy();

  balanceChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Balance acumulado",
          data: accBalances,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56,189,248,0.12)",
          borderWidth: 2.5,
          pointBackgroundColor: "#38bdf8",
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Balance mensual",
          data: monthlyBalances,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139,92,246,0.08)",
          borderWidth: 2,
          pointBackgroundColor: "#8b5cf6",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
          borderDash: [5, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(71,85,105,0.3)" } },
        y: {
          ticks: {
            color: "#94a3b8",
            callback: (v) => {
              if (Math.abs(v) >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
              if (Math.abs(v) >= 1_000)    return `$${(v/1_000).toFixed(0)}K`;
              return `$${v}`;
            },
          },
          grid: { color: "rgba(71,85,105,0.3)" },
        },
      },
    },
  });
}

// ==========================
// GRÁFICA 3: Tendencia financiera (área — ahorro % del ingreso por mes)
// ==========================
function renderTendencyChart() {
  const canvas = document.getElementById("tendency-chart");
  if (!canvas) return;

  const months = getLastNMonths(6);
  const labels  = months.map((m) => m.label);

  // % de ahorro = (ingreso - gasto) / ingreso * 100
  const savingsRate = months.map(({ month, year }) => {
    const { income, expense } = getTotalsForMonth(month, year);
    if (income === 0) return 0;
    return parseFloat(((income - expense) / income * 100).toFixed(1));
  });

  // Ratio gasto/ingreso
  const spendRate = months.map(({ month, year }) => {
    const { income, expense } = getTotalsForMonth(month, year);
    if (income === 0) return 0;
    return parseFloat(((expense / income) * 100).toFixed(1));
  });

  if (tendencyChart) tendencyChart.destroy();

  tendencyChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "% Ahorro",
          data: savingsRate,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          borderWidth: 2.5,
          pointBackgroundColor: savingsRate.map((v) => v >= 0 ? "#22c55e" : "#ef4444"),
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4,
        },
        {
          label: "% Gasto sobre ingreso",
          data: spendRate,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.08)",
          borderWidth: 2,
          pointBackgroundColor: "#f59e0b",
          pointRadius: 4,
          fill: false,
          tension: 0.4,
          borderDash: [4, 3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`,
          },
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: "line",
              yMin: 0, yMax: 0,
              borderColor: "rgba(239,68,68,0.5)",
              borderWidth: 1,
              borderDash: [4, 4],
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(71,85,105,0.3)" } },
        y: {
          ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
          grid: { color: "rgba(71,85,105,0.3)" },
        },
      },
    },
  });
}

// ==========================
// RENDER GENERAL DE ANALYTICS
// ==========================
function renderAnalytics() {
  renderAnalyticCards();
  renderEvolutionChart();
  renderBalanceChart();
  renderTendencyChart();
}

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