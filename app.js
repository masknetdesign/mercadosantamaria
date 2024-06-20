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

document.getElementById('authButton').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const title = document.getElementById('title').innerText;

    try {
        if (title === 'Login') {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            alert('Login realizado com sucesso!');
            // Redirecionar para a página de produtos após o login
            window.location.href = 'produtos.html';
        } else {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email
            });
            alert('Cadastro realizado com sucesso e dados salvos no Firestore!');
            // Verificar se o cadastro foi concluído com sucesso
            auth.onAuthStateChanged((user) => {
                if (user) {
                    alert('Usuário autenticado!');
                    // Redirecionar para a página de produtos após o cadastro
                    window.location.href = 'produtos.html';
                }
            });
        }
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('toggleButton').addEventListener('click', () => {
    const title = document.getElementById('title');
    const authButton = document.getElementById('authButton');
    const toggleButton = document.getElementById('toggleButton');
    const nameInput = document.getElementById('name');

    if (title.innerText === 'Login') {
        title.innerText = 'Cadastro';
        authButton.innerText = 'Cadastrar';
        toggleButton.innerText = 'Já tem uma conta? Faça login';
        nameInput.style.display = 'block';
    } else {
        title.innerText = 'Login';
        authButton.innerText = 'Entrar';
        toggleButton.innerText = 'Não tem uma conta? Cadastre-se';
        nameInput.style.display = 'none';
    }
});
