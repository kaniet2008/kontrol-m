const API_URL = 'http://localhost:8000/products';
const tableBody = document.getElementById('productsTable');
const message = document.getElementById('message');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchId');
const toggleFavoritesBtn = document.getElementById('toggleFavorites');
const img = new Image();
img.src = './heart-58.png';
let allProducts = [];
let showFavoritesOnly = false;

function getFavorites() {
  return JSON.parse(localStorage.getItem('favoriteIds')) || [];
}

function toggleFavorite(id) {
  let favs = getFavorites();

  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }

  localStorage.setItem('favoriteIds', JSON.stringify(favs));
  renderProducts(allProducts);
}

async function fetchProducts() {
  try {
    message.textContent = 'Loading...';

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка загрузки продуктов');

    allProducts = await response.json();

    if (allProducts.length === 0) {
      message.textContent = 'Пока нет товаров';
      tableBody.innerHTML = '';
      return;
    }

    renderProducts(allProducts);
    message.textContent = '';
  } catch (error) {
    message.textContent = error.message;
  }
}

function renderProducts(products) {
  tableBody.innerHTML = '';

  const favorites = getFavorites();
  const list = showFavoritesOnly
    ? products.filter(p => favorites.includes(p.id))
    : products;

  if (list.length === 0) {
    message.textContent = 'Пока нет товаров';
    return;
  }

  list.forEach(product => {
    const isFav = favorites.includes(product.id);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.title}</td>
      <td>${product.price}</td>
      <td>${product.status}</td>
      <td><img src="${product.image}" width="50"></td>
      <td>
        <button onclick="deleteProduct('${product.id}')">Удалить</button>
      </td>
      <td>
        <button class="fav-btn" onclick="toggleFavorite('${product.id}')">
          <i class="fas fa-heart ${isFav ? 'active' : ''}"></i>
        </button>
      </td>
      <td><img src="${img.src}"></td>
    `;
    tableBody.appendChild(row);
  });
}

async function deleteProduct(id) {
  if (!confirm('Удалить продукт?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Ошибка при удалении');

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
    message.textContent = 'Поиск...';

    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Продукт не найден');

    const product = await response.json();
    renderProducts([product]);
    message.textContent = '';
  } catch (error) {
    message.textContent = error.message;
  }
}

searchBtn.addEventListener('click', searchProductById);
toggleFavoritesBtn.addEventListener('click', () => {
  showFavoritesOnly = !showFavoritesOnly;
  toggleFavoritesBtn.textContent = showFavoritesOnly
    ? 'Показать все'
    : 'Показать избранное';
  renderProducts(allProducts);
});

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    if (!response.ok) throw new Error('Ошибка при создании продукта');

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
fetchProducts();
