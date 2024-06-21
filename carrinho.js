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
const cartItemsContainer = document.getElementById('cart-items');
const totalAmountElement = document.getElementById('total-amount');
const cartCountElement = document.getElementById('cart-count');
const checkoutButton = document.getElementById('checkout-btn');

// Função para buscar itens do carrinho e exibi-los
async function fetchCartItems() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para ver o carrinho.');
            window.location.href = 'login.html';
            return;
        }

        const snapshot = await db.collection('cartItems').where('userId', '==', user.uid).get();

        if (snapshot.empty) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            totalAmountElement.textContent = '0.00';
            return;
        }

        cartItemsContainer.innerHTML = ''; // Limpa o conteúdo anterior
        let totalAmount = 0;

        snapshot.forEach((doc) => {
            const cartItem = doc.data();
            totalAmount += cartItem.totalPrice;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div>${cartItem.productName}</div>
                <div>
                    <i class="material-icons" onclick="subtractQuantity('${doc.id}', ${cartItem.productPrice})">remove</i>
                    <span>${cartItem.quantity}</span>
                    <i class="material-icons" onclick="addQuantity('${doc.id}', ${cartItem.productPrice})">add</i>
                </div>
                <div>Preço: R$ ${cartItem.productPrice.toFixed(2)}</div>
                <div>Total: R$ ${cartItem.totalPrice.toFixed(2)}</div>
                <i class="material-icons" onclick="removeItem('${doc.id}')">delete</i>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        totalAmountElement.textContent = totalAmount.toFixed(2);
    } catch (error) {
        console.error('Erro ao buscar itens do carrinho:', error);
        cartItemsContainer.innerHTML = '<p>Ocorreu um erro ao buscar itens do carrinho.</p>';
    }
}

// Função para adicionar quantidade
async function addQuantity(itemId, productPrice) {
    const itemRef = db.collection('cartItems').doc(itemId);
    const item = await itemRef.get();

    if (item.exists) {
        const newQuantity = item.data().quantity + 1;
        await itemRef.update({
            quantity: newQuantity,
            totalPrice: newQuantity * productPrice
        });
        fetchCartItems();
    }
}

// Função para subtrair quantidade
async function subtractQuantity(itemId, productPrice) {
    const itemRef = db.collection('cartItems').doc(itemId);
    const item = await itemRef.get();

    if (item.exists) {
        const newQuantity = item.data().quantity - 1;
        if (newQuantity > 0) {
            await itemRef.update({
                quantity: newQuantity,
                totalPrice: newQuantity * productPrice
            });
        } else {
            await itemRef.delete();
        }
        fetchCartItems();
    }
}

// Função para remover item
async function removeItem(itemId) {
    await db.collection('cartItems').doc(itemId).delete();
    fetchCartItems();
}

// Função para concluir a compra
checkoutButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        const cartItemsRef = db.collection('cartItems').where('userId', '==', user.uid);
        const snapshot = await cartItemsRef.get();

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        alert('Compra concluída com sucesso!');
        window.location.href = 'produtos.html';
    }
});

// Carregar itens do carrinho ao iniciar
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchCartItems();
    } else {
        cartItemsContainer.innerHTML = '<p>Por favor, faça login para ver seu carrinho.</p>';
        totalAmountElement.textContent = '0.00';
    }
});
