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

const db = firebase.firestore();

// Carregar o contador do carrinho do localStorage
let cartCount = JSON.parse(localStorage.getItem('cartCount')) || 0;

// Atualizar contador do carrinho
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = cartCount;
    localStorage.setItem('cartCount', JSON.stringify(cartCount));
}

// Buscar e exibir produtos
async function fetchProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    const snapshot = await db.collection('products').get();
    snapshot.forEach((doc) => {
        const product = doc.data();
        const productItem = document.createElement('div');
        productItem.classList.add('card');
        productItem.innerHTML = `
            <h3>${product.name}</h3>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <p>Estoque: <span id="stock-${doc.id}">${product.stock}</span></p>
            <button onclick="buyProduct('${doc.id}', ${product.stock})">Comprar</button>
        `;
        productsContainer.appendChild(productItem);
    });
}

// Função para comprar produto
async function buyProduct(productId, currentStock) {
    if (currentStock > 0) {
        try {
            // Reduzir o estoque em 1
            const newStock = currentStock - 1;
            await db.collection('products').doc(productId).update({
                stock: newStock
            });

            // Atualizar a quantidade em estoque exibida
            document.getElementById(`stock-${productId}`).textContent = newStock;

            // Adicionar ao carrinho e atualizar contador
            cartCount += 1;
            updateCartCount();

            // Recarregar a página para atualizar os dados
            window.location.reload();
        } catch (error) {
            alert('Erro ao comprar produto: ' + error.message);
        }
    } else {
        alert('Produto esgotado!');
    }
}

// Carregar produtos ao iniciar
fetchProducts();
updateCartCount();
