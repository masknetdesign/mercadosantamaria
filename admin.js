// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCc13jXAn0iMpA51o3xuSrEpjdkJjXLv2Q",
  authDomain: "mercado-santa-maria.firebaseapp.com",
  projectId: "mercado-santa-maria",
  storageBucket: "mercado-santa-maria.appspot.com",
  messagingSenderId: "561473746533",
  appId: "1:561473746533:web:253f4b8be9009aa522b88c"
};

// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Verificar se o usuário está autenticado
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Se o usuário não estiver autenticado, redirecionar para index.html
        window.location.href = 'index.html';
    }
});

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeButton = document.querySelector('.close-button');
let editProductId = null;

// Adicionar produto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;

    try {
        await db.collection('products').add({
            name: name,
            category: category,
            price: parseFloat(price),
            stock: parseInt(stock)
        });
        alert('Produto adicionado com sucesso!');
        productForm.reset();
        fetchProducts();
    } catch (error) {
        alert('Erro ao adicionar produto: ' + error.message);
    }
});

// Buscar e exibir produtos
async function fetchProducts() {
    productList.innerHTML = '';
    const snapshot = await db.collection('products').get();
    snapshot.forEach((doc) => {
        const product = doc.data();
        const productItem = document.createElement('div');
        productItem.classList.add('card');
        productItem.innerHTML = `
            <h3>${product.name}</h3>
            <p>Categoria: ${product.category}</p>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <p>Estoque: ${product.stock}</p>
            <button onclick="editProduct('${doc.id}', '${product.name}', '${product.category}', ${product.price}, ${product.stock})">Editar</button>
        `;
        productList.appendChild(productItem);
    });
}

// Carregar produtos ao iniciar
fetchProducts();

// Função para abrir o modal de edição com os dados do produto
window.editProduct = (id, name, category, price, stock) => {
    editProductId = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-category').value = category;
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-stock').value = stock;
    editModal.style.display = 'block';
}

// Fechar o modal de edição
closeButton.onclick = () => {
    editModal.style.display = 'none';
}

// Atualizar produto
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const category = document.getElementById('edit-category').value;
    const price = document.getElementById('edit-price').value;
    const stock = document.getElementById('edit-stock').value;

    try {
        await db.collection('products').doc(editProductId).update({
            name: name,
            category: category,
            price: parseFloat(price),
            stock: parseInt(stock)
        });
        alert('Produto atualizado com sucesso!');
        editModal.style.display = 'none';
        fetchProducts();
    } catch (error) {
        alert('Erro ao atualizar produto: ' + error.message);
    }
});

// Fechar o modal ao clicar fora dele
window.onclick = (event) => {
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
}
