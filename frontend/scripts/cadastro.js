function playMusic() {
    const audio = document.getElementById("music");
    audio.play();
}

function pauseMusic() {
    const audio = document.getElementById("music");
    audio.pause();
    audio.currentTime = 0; // Reinicia a música quando o mouse sai
}

document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                password 
            }), // Objeto fechado corretamente
        });

        const result = await response.json();
        document.getElementById('Res').textContent = result.message;
    } catch (error) {
        document.getElementById('Res').textContent = "Erro ao conectar ao servidor."; // Parêntese removido
    }
});