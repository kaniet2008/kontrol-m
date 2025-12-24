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
