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
const checkoutBtn = document.getElementById('checkout-btn');
const cartCountElement = document.getElementById('cart-count');

// Função para carregar itens do carrinho
async function loadCartItems() {
    cartItemsContainer.innerHTML = ''; // Limpa o conteúdo anterior
    let totalPrice = 0; // Inicializar o total de preço

    try {
        const user = auth.currentUser;

        if (user) {
            // Consultar os itens do carrinho do usuário logado
            const snapshot = await db.collection('cartItems')
                .where('userId', '==', user.uid)
                .get();

            if (snapshot.empty) {
                cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
                totalAmountElement.textContent = `0.00`;
                return;
            }

            snapshot.forEach(doc => {
                const cartItem = doc.data();
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <h3>${cartItem.productName}</h3>
                    <p>Preço: R$ ${cartItem.productPrice.toFixed(2)}</p>
                    <p>Quantidade: ${cartItem.quantity}</p>
                    <button onclick="removeCartItem('${doc.id}')">Remover</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);

                // Atualizar o preço total
                totalPrice += cartItem.productPrice * cartItem.quantity;
            });

            // Exibir o preço total
            totalAmountElement.textContent = `${totalPrice.toFixed(2)}`;

        } else {
            // Usuário não está autenticado
            cartItemsContainer.innerHTML = '<p>Por favor, faça login para ver seu carrinho.</p>';
            totalAmountElement.textContent = `0.00`;
        }
    } catch (error) {
        console.error('Erro ao carregar itens do carrinho:', error);
        cartItemsContainer.innerHTML = '<p>Ocorreu um erro ao carregar seu carrinho.</p>';
        totalAmountElement.textContent = `0.00`;
    }
}

// Função para remover item do carrinho
async function removeCartItem(cartItemId) {
    try {
        await db.collection('cartItems').doc(cartItemId).delete();
        // Recarregar a lista de itens do carrinho após a remoção
        loadCartItems();
    } catch (error) {
        console.error('Erro ao remover item do carrinho:', error);
        alert('Erro ao remover item do carrinho. Tente novamente mais tarde.');
    }
}

// Função para enviar o pedido pelo WhatsApp
function sendOrderToWhatsApp(orderDetails) {
    const phoneNumber = '5581999999999'; // Substitua pelo número de telefone desejado
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
}

// Evento de clique no botão "Concluir Compra"
checkoutBtn.addEventListener('click', async () => {
    const user = auth.currentUser;

    if (!user) {
        alert('Você precisa estar logado para concluir a compra.');
        return;
    }

    try {
        // Consultar os itens do carrinho do usuário logado
        const snapshot = await db.collection('cartItems')
            .where('userId', '==', user.uid)
            .get();

        if (snapshot.empty) {
            alert('Seu carrinho está vazio.');
            return;
        }

        // Construir a mensagem do pedido
        let orderDetails = `Pedido de ${user.email}:\n\n`;
        let totalPrice = 0;

        snapshot.forEach(doc => {
            const cartItem = doc.data();
            const itemTotal = cartItem.productPrice * cartItem.quantity;
            orderDetails += `${cartItem.productName} - Quantidade: ${cartItem.quantity}, Preço: R$ ${cartItem.productPrice.toFixed(2)}, Total: R$ ${itemTotal.toFixed(2)}\n`;
            totalPrice += itemTotal;
        });

        orderDetails += `\nPreço Total: R$ ${totalPrice.toFixed(2)}`;

        // Enviar a mensagem pelo WhatsApp
        sendOrderToWhatsApp(orderDetails);

        // Limpar o carrinho do usuário
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Atualizar a interface
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalAmountElement.textContent = `0.00`;
        cartCount = 0;
        updateCartCount();

        alert('Pedido enviado com sucesso!');

    } catch (error) {
        console.error('Erro ao concluir a compra:', error);
        alert('Erro ao concluir a compra. Tente novamente mais tarde.');
    }
});

// Verificar se o usuário está autenticado ao iniciar
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário está autenticado, carregar itens do carrinho
        loadCartItems();
    } else {
        // Usuário não está autenticado, limpar itens do carrinho
        cartItemsContainer.innerHTML = '<p>Por favor, faça login para ver seu carrinho.</p>';
        totalAmountElement.textContent = `0.00`;
    }
});
