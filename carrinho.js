// Inicializar o Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCc13jXAn0iMpA51o3xuSrEpjdkJjXLv2Q",
    authDomain: "mercado-santa-maria.firebaseapp.com",
    projectId: "mercado-santa-maria",
    storageBucket: "mercado-santa-maria.appspot.com",
    messagingSenderId: "561473746533",
    appId: "1:561473746533:web:253f4b8be9009aa522b88c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const cartItemsContainer = document.getElementById('cart-items-container');
const totalPriceElement = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Função para carregar itens do carrinho
async function loadCartItems() {
    const user = auth.currentUser;

    if (!user) {
        alert('Você precisa estar logado para visualizar seu carrinho.');
        return;
    }

    try {
        const cartItemsRef = db.collection('cartItems').where('userId', '==', user.uid);
        const cartItemsSnapshot = await cartItemsRef.get();

        if (cartItemsSnapshot.empty) {
            cartItemsContainer.innerHTML = '<p>Nenhum item no carrinho.</p>';
            totalPriceElement.textContent = '0.00';
            return;
        }

        let totalPrice = 0;

        cartItemsContainer.innerHTML = '';

        cartItemsSnapshot.forEach(doc => {
            const cartItem = doc.data();
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h3>${cartItem.productName}</h3>
                <p>Preço: R$ ${cartItem.productPrice.toFixed(2)}</p>
                <p>Quantidade: ${cartItem.quantity}</p>
                <button onclick="removeItem('${doc.id}')">Remover</button>
            `;
            cartItemsContainer.appendChild(itemElement);

            totalPrice += cartItem.productPrice * cartItem.quantity;
        });

        totalPriceElement.textContent = totalPrice.toFixed(2);

    } catch (error) {
        console.error('Erro ao carregar itens do carrinho:', error);
        alert('Erro ao carregar itens do carrinho. Tente novamente mais tarde.');
    }
}

// Função para remover item do carrinho
async function removeItem(cartItemId) {
    const user = auth.currentUser;

    if (!user) {
        alert('Você precisa estar logado para remover itens do carrinho.');
        return;
    }

    try {
        await db.collection('cartItems').doc(cartItemId).delete();
        alert('Item removido do carrinho com sucesso.');

        // Recarregar itens do carrinho após remoção
        loadCartItems();

    } catch (error) {
        console.error('Erro ao remover item do carrinho:', error);
        alert('Erro ao remover item do carrinho. Tente novamente mais tarde.');
    }
}

// Função para finalizar compra
checkoutBtn.addEventListener('click', async () => {
    const user = auth.currentUser;

    if (!user) {
        alert('Você precisa estar logado para finalizar sua compra.');
        return;
    }

    try {
        // Capturar dados do usuário (opcional, depende do seu sistema de autenticação)
        const userData = {
            nome: user.displayName,
            email: user.email,
            telefone: user.phoneNumber || 'Não informado'
        };

        // Capturar itens do carrinho
        const cartItemsRef = db.collection('cartItems').where('userId', '==', user.uid);
        const cartItemsSnapshot = await cartItemsRef.get();

        if (cartItemsSnapshot.empty) {
            alert('Não há itens no carrinho para finalizar a compra.');
            return;
        }

        const pedido = [];
        let totalPrice = 0;

        cartItemsSnapshot.forEach(doc => {
            const cartItem = doc.data();
            pedido.push(`${cartItem.productName} - Quantidade: ${cartItem.quantity}`);
            totalPrice += cartItem.productPrice * cartItem.quantity;
        });

        // Enviar pedido via WhatsApp
        const mensagem = `Olá! Meu pedido:\n${pedido.join('\n')}\nTotal: R$ ${totalPrice.toFixed(2)}\n\nDados do Cliente:\nNome: ${userData.nome}\nEmail: ${userData.email}\nTelefone: ${userData.telefone}`;
        
        // Aqui você pode substituir pelo seu número de WhatsApp ou de um atendente responsável
        const numeroWhatsApp = '11988896517';
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        
        // Abrir WhatsApp com a mensagem pronta para envio
        window.open(linkWhatsApp, '_blank');

        // Limpar carrinho (remover todos os itens do usuário)
        const batch = db.batch();
        cartItemsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Navegar para produtos.html após finalizar a compra
        window.location.href = 'produtos.html';

    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        alert('Erro ao finalizar compra. Tente novamente mais tarde.');
    }
});

// Carregar itens ao iniciar a página
auth.onAuthStateChanged(user => {
    if (user) {
        loadCartItems();
    } else {
        cartItemsContainer.innerHTML = '<p>Por favor, faça login para visualizar seu carrinho.</p>';
        totalPriceElement.textContent = '0.00';
    }
});
