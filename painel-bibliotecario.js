// Variáveis globais
const API_BASE = 'http://localhost:3000/api';

// Elementos do DOM
const listaSolicitacoes = document.getElementById('listaSolicitacoes');
const listaLivros = document.getElementById('listaLivros');
const modal = document.getElementById('modalLivro');
const btnAdicionar = document.getElementById('btnAdicionarLivro');
const btnAtualizar = document.getElementById('btnAtualizar');
const formLivro = document.getElementById('formLivro');
const span = document.getElementsByClassName('fechar')[0];

// Verificar autenticação
function verificarAutenticacao() {
    const token = localStorage.getItem('tokenBibliotecario');
    const bibliotecarioInfo = localStorage.getItem('bibliotecarioInfo');
    
    if (!token || !bibliotecarioInfo) {
        window.location.href = 'bibliotecario.html';
        return null;
    }
    
    return {
        token: token,
        info: JSON.parse(bibliotecarioInfo)
    };
}

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', function() {
    const auth = verificarAutenticacao();
    if (!auth) return;
    
    carregarSolicitacoesPendentes();
    carregarLivros();
});

// Função para carregar solicitações pendentes
async function carregarSolicitacoesPendentes() {
    try {
        const auth = verificarAutenticacao();
        if (!auth) return;
        
        const resposta = await fetch(`${API_BASE}/bibliotecario/solicitacoes`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (resposta.ok) {
            const solicitacoes = await resposta.json();
            exibirSolicitacoes(solicitacoes);
        } else if (resposta.status === 401) {
            logoutBibliotecario();
        } else {
            console.error('Erro ao carregar solicitações');
            exibirSolicitacoes([]);
        }
    } catch (error) {
        console.error('Erro:', error);
        exibirSolicitacoes([]);
    }
}

// Função para exibir solicitações na interface
function exibirSolicitacoes(solicitacoes) {
    listaSolicitacoes.innerHTML = '';
    
    if (!solicitacoes || solicitacoes.length === 0) {
        listaSolicitacoes.innerHTML = '<p style="text-align: center; color: #ccc; padding: 20px;">Nenhuma solicitação pendente</p>';
        return;
    }
    
    solicitacoes.forEach(solicitacao => {
        const item = document.createElement('div');
        item.className = 'item-solicitacao';
        item.innerHTML = `
            <div class="info-item">
                <h4>${solicitacao.titulo}</h4>
                <p><strong>Estudante:</strong> ${solicitacao.username}</p>
                <p><strong>Data:</strong> ${new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="acoes-item">
                <button class="btn-aprovar" onclick="aprovarSolicitacao(${solicitacao.id}, ${solicitacao.id_usuario}, ${solicitacao.id_livro})">
                    ✅ Aprovar
                </button>
                <button class="btn-recusar" onclick="recusarSolicitacao(${solicitacao.id})">
                    ❌ Recusar
                </button>
            </div>
        `;
        listaSolicitacoes.appendChild(item);
    });
}

// Função para carregar livros (agora usando a rota /api/livros)
async function carregarLivros() {
    try {
        const resposta = await fetch(`${API_BASE}/livros`);
        
        if (resposta.ok) {
            const livros = await resposta.json();
            exibirLivros(livros);
        } else {
            console.error('Erro ao carregar livros');
            exibirLivros([]);
        }
    } catch (error) {
        console.error('Erro:', error);
        exibirLivros([]);
    }
}

// Função para exibir livros na interface
function exibirLivros(livros) {
    listaLivros.innerHTML = '';
    
    if (!livros || livros.length === 0) {
        listaLivros.innerHTML = '<p style="text-align: center; color: #ccc; padding: 20px;">Nenhum livro cadastrado</p>';
        return;
    }
    
    livros.forEach(livro => {
        const item = document.createElement('div');
        item.className = 'item-livro';
        item.innerHTML = `
            <div class="info-item">
                <h4>${livro.titulo}</h4>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Categoria:</strong> ${livro.categoria || 'Não informada'}</p>
                <p><strong>Status:</strong> ${livro.disponivel ? '🟢 Disponível' : '🔴 Emprestado'}</p>
            </div>
            <div class="acoes-item">
                <button class="btn-remover" onclick="removerLivro(${livro.id})" ${!livro.disponivel ? 'disabled' : ''}>
                    🗑️ Remover
                </button>
            </div>
        `;
        listaLivros.appendChild(item);
    });
}

// Função para aprovar solicitação
async function aprovarSolicitacao(id_solicitacao, id_usuario, id_livro) {
    try {
        const auth = verificarAutenticacao();
        if (!auth) return;
        
        const resposta = await fetch(`${API_BASE}/bibliotecario/aprovar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({
                id_solicitacao: id_solicitacao,
                id_usuario: id_usuario,
                id_livro: id_livro
            })
        });
        
        const dados = await resposta.json();
        
        if (resposta.ok) {
            alert(dados.message);
            carregarSolicitacoesPendentes();
            carregarLivros();
        } else if (resposta.status === 401) {
            logoutBibliotecario();
        } else {
            alert(dados.error || 'Erro ao aprovar solicitação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão');
    }
}

// Função para recusar solicitação
async function recusarSolicitacao(id_solicitacao) {
    if (confirm('Tem certeza que deseja recusar esta solicitação?')) {
        try {
            const auth = verificarAutenticacao();
            if (!auth) return;
            
            const resposta = await fetch(`${API_BASE}/bibliotecario/recusar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    id_solicitacao: id_solicitacao
                })
            });
            
            const dados = await resposta.json();
            
            if (resposta.ok) {
                alert(dados.message);
                carregarSolicitacoesPendentes();
            } else if (resposta.status === 401) {
                logoutBibliotecario();
            } else {
                alert(dados.error || 'Erro ao recusar solicitação');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão');
        }
    }
}

// Função para adicionar livro (agora usando a rota /api/livros)
async function adicionarLivro(dadosLivro) {
    try {
        const resposta = await fetch(`${API_BASE}/livros`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosLivro)
        });
        
        const dados = await resposta.json();
        
        if (resposta.ok) {
            return { success: true, message: 'Livro adicionado com sucesso!' };
        } else {
            return { success: false, message: dados.error || 'Erro ao adicionar livro' };
        }
    } catch (error) {
        console.error('Erro:', error);
        return { success: false, message: 'Erro de conexão' };
    }
}

// Função para remover livro (agora usando a rota /api/livros/:id)
async function removerLivro(id_livro) {
    if (confirm('Tem certeza que deseja remover este livro do acervo?')) {
        try {
            const resposta = await fetch(`${API_BASE}/livros/${id_livro}`, {
                method: 'DELETE'
            });
            
            if (resposta.ok) {
                alert('Livro removido com sucesso!');
                carregarLivros();
            } else {
                const dados = await resposta.json();
                alert(dados.error || 'Erro ao remover livro');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão');
        }
    }
}

// Modal functions
btnAdicionar.onclick = function() {
    modal.style.display = 'block';
}

span.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Adicionar novo livro
formLivro.onsubmit = async function(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const categoria = document.getElementById('categoria').value;
    const imagem = document.getElementById('imagem').value;
    
    const resultado = await adicionarLivro({
        titulo: titulo,
        autor: autor,
        categoria: categoria,
        imagem: imagem
    });
    
    if (resultado.success) {
        alert(resultado.message);
        modal.style.display = 'none';
        formLivro.reset();
        carregarLivros();
    } else {
        alert(resultado.message);
    }
}

// Atualizar lista
btnAtualizar.onclick = function() {
    carregarSolicitacoesPendentes();
    carregarLivros();
}

// Logout
function logoutBibliotecario() {
    localStorage.removeItem('tokenBibliotecario');
    localStorage.removeItem('bibliotecarioInfo');
    window.location.href = 'bibliotecario.html';
}

// Adicionar evento de logout ao link "Sair"
document.addEventListener('DOMContentLoaded', function() {
    const linkSair = document.querySelector('a[href="bibliotecario.html"]');
    if (linkSair) {
        linkSair.addEventListener('click', function(e) {
            e.preventDefault();
            logoutBibliotecario();
        });
    }
});