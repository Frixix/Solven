// ==========================
// SELECTORES
// ==========================
const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");

const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const totalBalance = document.getElementById("total-balance");

let transactions = [];

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
    { value: "comida", label: "Comida" },
    { value: "transporte", label: "Transporte" },
    { value: "estudio", label: "Estudio" },
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
  localStorage.setItem("transactions", JSON.stringify(transactions));
}


// ==========================
// UTILIDADES
// ==========================
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
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;

  document.getElementById("date").value = formatted;
}

function updateCategories(type) {
  const categorySelect = document.getElementById("category");

  // limpiar opciones
  categorySelect.innerHTML = `<option value="">Selecciona una categoría</option>`;

  if (!type) return;

  categories[type].forEach((cat) => {
  const option = document.createElement("option");
  option.value = cat.value;
  option.textContent = cat.label;
  categorySelect.appendChild(option);
});
}

// ==========================
// CRUD
// ==========================
function createTransaction(data) {
  return {
    id: Date.now(),
    ...data,
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

  if (transactions.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  // Ordenar por fecha (más reciente primero)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sortedTransactions.forEach((tx) => {
    const item = document.createElement("article");
    item.classList.add("transaction-item");

    item.innerHTML = `
      <div class="transaction-info">
        <h4>${tx.description || "Sin descripción"}</h4>
        <p>Categoría: ${tx.category}</p>
      </div>

      <div class="transaction-meta">
        <span class="amount ${tx.type}">
          ${tx.type === "ingreso" ? "+" : "-"}${formatCurrency(tx.amount)}
        </span>

        <span class="date">${formatDate(tx.date)}</span>

        <div class="actions">
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
  let income = 0;
  let expense = 0;

  transactions.forEach((tx) => {
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
// UI
// ==========================
function updateUI() {
  renderTransactions();
  calculateSummary();
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

  const newTransaction = createTransaction(data);

  transactions.push(newTransaction);

  saveTransactions();
  updateUI();

  form.reset();
  updateCategories("");
  setDefaultDateTime();
});

form.type.addEventListener("change", (e) => {
  updateCategories(e.target.value);
});

// ==========================
// INIT
// ==========================
function init() {
  loadTransactions();
  setDefaultDateTime();
  updateUI();
}

init();