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

// Verificar se o usuário está autenticado
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Se o usuário não estiver autenticado, redirecionar para index.html
        window.location.href = 'index.html';
    }
});
