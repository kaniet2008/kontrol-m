const API_URL = 'http://localhost:8000/products';

const tableBody = document.getElementById('productsTable');
const message = document.getElementById('message');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchId');


async function fetchProducts() {
  try {
    message.textContent = 'Загрузка продуктов...';

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Ошибка загрузки продуктов');
    }

    const products = await response.json();
    renderProducts(products);
    message.textContent = 'Продукты загружены';
  } catch (error) {
    message.textContent = error.message;
  }
}


function renderProducts(products) {
  tableBody.innerHTML = '';

  products.forEach(product => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.title}</td>
      <td>${product.price}</td>
      <td>${product.status}</td>
      <td>
        <img src="${product.image}" alt="${product.title}">
      </td>
      <td>
        <button onclick="deleteProduct('${product.id}')">Удалить</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

async function deleteProduct(id) {
  const confirmDelete = confirm('Вы уверены, что хотите удалить продукт?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:8000/products${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении');
    }

    message.textContent = 'Продукт удалён';
    fetchProducts();
  } catch (error) {
    message.textContent = error.message;
  }
}

async function searchProductById() {
  const id = searchInput.value.trim();
  if (!id) return;

  try {
    message.textContent = 'Поиск продукта...';

    const response = await fetch(`http://localhost:8000/products${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Продукт не найден');
    }

    const product = await response.json();
    renderProducts([product]);
    message.textContent = 'Продукт найден';
  } catch (error) {
    message.textContent = error.message;
  }
}


searchBtn.addEventListener('click', searchProductById);


fetchProducts();


const createForm = document.getElementById('createForm');

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();


  const title = document.getElementById('title');
  const price = document.getElementById('price');
  const status = document.getElementById('status');
  const image = document.getElementById('image');


  clearCreateErrors();
  let isValid = true;

  if (title.value.trim().length < 3) {
    showCreateError('titleError', 'Минимум 3 символа');
    isValid = false;
  }

  if (price.value === '' || Number(price.value) <= 0) {
    showCreateError('priceError', 'Цена должна быть больше 0');
    isValid = false;
  }

  if (!status.value.trim()) {
    showCreateError('statusError', 'Статус обязателен');
    isValid = false;
  }

  if (!image.value.trim()) {
    showCreateError('imageError', 'Введите URL изображения');
    isValid = false;
  }

  if (!isValid) return;

  const newProduct = {
    title: title.value.trim(),
    price: Number(price.value),
    status: status.value.trim(),
    image: image.value.trim()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    });

    if (!response.ok) {
      throw new Error('Ошибка при создании продукта');
    }

    message.textContent = 'Продукт создан';
    createForm.reset();
    fetchProducts();
  } catch (error) {
    message.textContent = error.message;
  }
});

function showCreateError(id, text) {
  document.getElementById(id).textContent = text;
}

function clearCreateErrors() {
  document.querySelectorAll('.error').forEach(e => e.textContent = '');
}
