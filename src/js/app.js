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

let transactions = [];
let editingId = null;

let filters = {
  type: "",
  category: "",
  search: "",
};

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
  localStorage.setItem("transactions", JSON.stringify(transactions));
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
    const matchType = filters.type ? tx.type === filters.type : true;

    const matchCategory = filters.category
      ? tx.category === filters.category
      : true;

    const matchSearch = filters.search
      ? (tx.description || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : true;

    return matchType && matchCategory && matchSearch;
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

// ==========================
// INIT
// ==========================
function init() {
  loadTransactions();
  setDefaultDateTime();
  setFormMode();
  updateUI();
  updateFilterCategories("");
}

init();