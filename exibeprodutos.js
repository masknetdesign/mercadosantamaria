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
const auth = firebase.auth();

// Referências aos elementos HTML
const productsContainer = document.getElementById('products-container');
const cartCountElement = document.getElementById('cart-count');
const searchBox = document.getElementById('search-box');
const cartIcon = document.getElementById('cart-icon');

// Variável para armazenar o total do carrinho
let cartCount = JSON.parse(localStorage.getItem('cartCount')) || 0;

// Atualizar contador do carrinho
function updateCartCount() {
    cartCountElement.textContent = cartCount;
    localStorage.setItem('cartCount', JSON.stringify(cartCount));
}

// Função para buscar e exibir produtos filtrados
async function fetchAndDisplayProducts(filter = '') {
    try {
        const snapshot = await db.collection('products').get();

        if (snapshot.empty) {
            productsContainer.innerHTML = '<p>Nenhum produto disponível.</p>';
            return;
        }

        productsContainer.innerHTML = ''; // Limpa o conteúdo anterior
        snapshot.forEach((doc) => {
            const product = doc.data();
            if (product.name.toLowerCase().includes(filter.toLowerCase())) {
                const productItem = document.createElement('div');
                productItem.classList.add('card');
                productItem.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Preço: R$ ${product.price.toFixed(2)}</p>
                    <p>Estoque: <span id="stock-${doc.id}">${product.stock}</span></p>
                    <button onclick="buyProduct('${doc.id}', '${product.name}', ${product.price}, ${product.stock})">Comprar</button>
                `;
                productsContainer.appendChild(productItem);
            }
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productsContainer.innerHTML = '<p>Ocorreu um erro ao buscar produtos.</p>';
    }
}

// Função para comprar produto
async function buyProduct(productId, productName, productPrice, productStock) {
    const user = auth.currentUser;

    if (!user) {
        alert('Você precisa estar logado para comprar produtos.');
        return;
    }

    try {
        // Verificar se há estoque disponível
        if (productStock <= 0) {
            alert('Produto esgotado!');
            return;
        }

        // Verificar se o produto já está no carrinho
        const cartItemRef = db.collection('cartItems').doc(`${user.uid}_${productId}`);
        const cartItemDoc = await cartItemRef.get();

        if (cartItemDoc.exists) {
            // Produto já está no carrinho, atualizar a quantidade e valor total
            const cartItem = cartItemDoc.data();
            const newQuantity = cartItem.quantity + 1;
            const newTotalPrice = newQuantity * productPrice;

            await cartItemRef.update({
                quantity: newQuantity,
                totalPrice: newTotalPrice
            });
        } else {
            // Produto não está no carrinho, adicionar novo item
            await cartItemRef.set({
                productId: productId,
                productName: productName,
                productPrice: productPrice,
                quantity: 1,
                totalPrice: productPrice,
                userId: user.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Reduzir o estoque em 1
        const productRef = db.collection('products').doc(productId);
        await productRef.update({ stock: productStock - 1 });

        // Atualizar a exibição do estoque na interface
        const updatedProduct = await productRef.get();
        const updatedStock = updatedProduct.data().stock;
        document.getElementById(`stock-${productId}`).textContent = updatedStock;

        // Atualizar o contador do carrinho e localStorage
        cartCount += 1;
        updateCartCount();

        // Mostrar mensagem de sucesso
        alert(`Produto ${productName} adicionado ao carrinho!`);

        // Atualizar lista de produtos após a compra
        fetchAndDisplayProducts();

    } catch (error) {
        console.error('Erro ao comprar produto:', error);
        alert('Erro ao comprar produto. Tente novamente mais tarde.');
    }
}

// Evento de input na caixa de busca
searchBox.addEventListener('input', (event) => {
    fetchAndDisplayProducts(event.target.value);
});

// Evento de clique no ícone do carrinho
cartIcon.addEventListener('click', () => {
    window.location.href = 'carrinho.html';
});

// Carregar produtos ao iniciar
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuário está autenticado, carregar produtos e atualizar contador do carrinho
        fetchAndDisplayProducts();
        updateCartCount();
    } else {
        // Usuário não está autenticado, limpar produtos e contador do carrinho
        productsContainer.innerHTML = '<p>Por favor, faça login para ver os produtos.</p>';
        cartCountElement.textContent = '0';
    }
});
