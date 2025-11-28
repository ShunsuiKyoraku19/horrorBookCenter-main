document.getElementById('loginBibliotecarioForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mensagem = document.getElementById('Res');
    
    try {
        const resposta = await fetch('http://localhost:3000/api/bibliotecario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (resposta.ok) {
            const dados = await resposta.json();
            mensagem.textContent = 'Login bem-sucedido!';
            mensagem.style.color = 'green';
            
            // Salvar token de autenticação
            localStorage.setItem('tokenBibliotecario', dados.token);
            
            setTimeout(() => {
                window.location.href = 'painel-bibliotecario.html';
            }, 1000);
        } else {
            const erro = await resposta.json();
            mensagem.textContent = erro.error || 'Usuário ou senha incorretos!';
            mensagem.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro:', error);
        mensagem.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
        mensagem.style.color = 'red';
    }
});
document.getElementById('loginBibliotecarioForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mensagem = document.getElementById('Res');
    
    console.log('Tentando login com:', username); // DEBUG
    
    try {
        const resposta = await fetch('http://localhost:3000/api/bibliotecario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        console.log('Resposta do servidor:', resposta.status); // DEBUG
        
        if (resposta.ok) {
            const dados = await resposta.json();
            console.log('Dados recebidos:', dados); // DEBUG
            
            mensagem.textContent = 'Login bem-sucedido!';
            mensagem.style.color = 'green';
            
            // Salvar token de autenticação
            localStorage.setItem('tokenBibliotecario', dados.token);
            localStorage.setItem('bibliotecarioInfo', JSON.stringify(dados.bibliotecario));
            
            console.log('Token salvo:', dados.token); // DEBUG
            
            setTimeout(() => {
                console.log('Redirecionando para painel...'); // DEBUG
                window.location.href = 'painelbibliotecario.html';
            }, 1000);
        } else {
            const erro = await resposta.json();
            console.log('Erro no login:', erro); // DEBUG
            mensagem.textContent = erro.error || 'Usuário ou senha incorretos!';
            mensagem.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro completo:', error); // DEBUG
        mensagem.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
        mensagem.style.color = 'red';
    }
});