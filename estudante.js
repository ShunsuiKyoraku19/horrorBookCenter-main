(() => {
   
    const sampleBooks = [
        { id: 'b1', titulo: 'Drácula', autor: 'Bram Stoker', precoPorDia: 2.5, disponivel: true },
        { id: 'b2', titulo: 'Frankenstein', autor: 'Mary Shelley', precoPorDia: 3.0, disponivel: true },
        { id: 'b3', titulo: 'O Iluminado', autor: 'Stephen King', precoPorDia: 4.0, disponivel: true },
        { id: 'b4', titulo: 'Histórias de Terror', autor: 'Vários', precoPorDia: 1.5, disponivel: true },
    ];

    const BOOKS_KEY = 'estudante_books_v1';
    const RENTALS_KEY = 'estudante_rentals_v1';

    function loadState() {
        let books = JSON.parse(localStorage.getItem(BOOKS_KEY));
        let rentals = JSON.parse(localStorage.getItem(RENTALS_KEY));
        if (!books) {
            books = sampleBooks;
            localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
        }
        if (!rentals) {
            rentals = [];
            localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
        }
        return { books, rentals };
    }

    function saveState({ books, rentals }) {
        localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
        localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
    }

    function ensureUI() {
        let app = document.getElementById('estudante-app');
        if (!app) {
            app = document.createElement('div');
            app.id = 'estudante-app';
            app.style.fontFamily = 'Arial, sans-serif';
            app.style.maxWidth = '800px';
            app.style.margin = '10px';
            document.body.appendChild(app);
        }
        app.innerHTML = `
            <h2>Biblioteca - Estudante</h2>
            <div>
                <input id="search-input" placeholder="Pesquisar por título ou autor..." style="width:60%;padding:6px" />
                <button id="search-clear" title="Limpar" style="margin-left:8px">Limpar</button>
            </div>
            <div id="search-results" style="margin-top:12px"></div>
            <h3>Meus Aluguéis</h3>
            <div id="rentals-list" style="margin-top:8px"></div>
        `;
        return app;
    }

    function renderSearchResults(books, rentals, query = '') {
        const container = document.getElementById('search-results');
        const q = query.trim().toLowerCase();
        const filtered = books.filter(b => {
            if (!q) return true;
            return b.titulo.toLowerCase().includes(q) || b.autor.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p>Nenhum livro encontrado.</p>';
            return;
        }

        container.innerHTML = filtered.map(book => {
            const rented = rentals.find(r => r.bookId === book.id);
            const status = rented ? `<em style="color:orange">Alugado</em>` : (book.disponivel ? `<em style="color:green">Disponível</em>` : `<em style="color:red">Indisponível</em>`);
            const price = `R$ ${book.precoPorDia.toFixed(2)}/dia`;
            const btn = rented ? `<button data-action="view" data-id="${book.id}">Ver aluguel</button>` :
                (book.disponivel ? `<button data-action="rent" data-id="${book.id}">Alugar</button>` : `<button disabled>Indisponível</button>`);
            return `
                <div style="border:1px solid #ddd;padding:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <strong>${escapeHtml(book.titulo)}</strong> <small>— ${escapeHtml(book.autor)}</small>
                        <div style="font-size:90%">${price} · ${status}</div>
                    </div>
                    <div>${btn}</div>
                </div>
            `;
        }).join('');
    }

    function renderRentals(books, rentals) {
        const container = document.getElementById('rentals-list');
        if (rentals.length === 0) {
            container.innerHTML = '<p>Você não tem livros alugados.</p>';
            return;
        }
        container.innerHTML = rentals.map(r => {
            const book = books.find(b => b.id === r.bookId) || { titulo: 'Livro removido' };
            const paid = r.pago ? `<span style="color:green">Pago</span>` : `<span style="color:red">Pendente</span>`;
            const requested = r.solicitadoAoBibliotecario ? `<span style="color:orange">Aguardando aceitação do bibliotecário</span>` : '';
            const rentedAt = new Date(r.rentedAt).toLocaleString();
            const priceTotal = (r.days * (r.pricePerDay || 0)).toFixed(2);

            // Se já foi pago, não mostra botão de solicitação; se não foi pago e ainda não solicitado, mostra botão para "Solicitar aceitação"
            const requestBtn = r.pago ? '' : (r.solicitadoAoBibliotecario ? `<button disabled style="margin-right:6px">Pedido enviado</button>` : `<button data-action="request" data-id="${r.id}" style="margin-right:6px">Solicitar aceitação</button>`);

            return `
                <div style="border:1px solid #ccc;padding:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <strong>${escapeHtml(book.titulo)}</strong><div style="font-size:90%">Alugado em: ${rentedAt} · dias: ${r.days} · Total: R$ ${priceTotal} · ${paid} ${requested}</div>
                    </div>
                    <div>
                        ${requestBtn}
                        <button data-action="cancel" data-id="${r.id}">Cancelar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }

    function generateId(prefix = '') {
        return prefix + Math.random().toString(36).slice(2, 9);
    }

    function rentBook(bookId) {
        const state = loadState();
        const book = state.books.find(b => b.id === bookId);
        if (!book) { alert('Livro não encontrado'); return; }
        if (!book.disponivel) { alert('Livro indisponível'); return; }

        let days = parseInt(prompt('Quantos dias deseja alugar?', '7'), 10);
        if (!days || days <= 0) { alert('Aluguel cancelado'); return; }

        const rental = {
            id: generateId('r_'),
            bookId: book.id,
            rentedAt: new Date().toISOString(),
            days,
            pricePerDay: book.precoPorDia,
            pago: false,
            solicitadoAoBibliotecario: false // novo campo para controlar pedido ao bibliotecário
        };
        book.disponivel = false;
        state.rentals.push(rental);
        saveState(state);
        renderSearchResults(state.books, state.rentals, document.getElementById('search-input').value);
        renderRentals(state.books, state.rentals);
        alert('Livro alugado. Para confirmar o pagamento, solicite a aceitação do bibliotecário.');
    }

    // Substitui o fluxo de pagamento direto por um pedido ao bibliotecário
    function requestPaymentApproval(rentalId) {
        const state = loadState();
        const rental = state.rentals.find(r => r.id === rentalId);
        if (!rental) { alert('Aluguel não encontrado'); return; }
        if (rental.pago) { alert('Aluguel já pago'); return; }
        if (rental.solicitadoAoBibliotecario) { alert('Pedido já enviado ao bibliotecário.'); return; }
        if (!confirm('Deseja enviar ao bibliotecário o pedido de aceitação do pagamento deste aluguel?')) return;

        rental.solicitadoAoBibliotecario = true;
        rental.solicitadoEm = new Date().toISOString();
        saveState(state);
        renderSearchResults(state.books, state.rentals, document.getElementById('search-input').value);
        renderRentals(state.books, state.rentals);
        alert('Pedido enviado ao bibliotecário. Aguarde a confirmação.');
    }

    // Método que o bibliotecário usaria para aceitar o pagamento (ex.: via painel do bibliotecário)
    function approvePaymentByLibrarian(rentalId) {
        const state = loadState();
        const rental = state.rentals.find(r => r.id === rentalId);
        if (!rental) { console.warn('Aluguel não encontrado para aprovação'); return false; }
        if (rental.pago) { console.warn('Aluguel já está marcado como pago'); return false; }

        rental.pago = true;
        rental.paidAt = new Date().toISOString();
        rental.solicitadoAoBibliotecario = false;
        saveState(state);
        // atualiza UI caso esteja aberto
        if (document.getElementById('estudante-app')) {
            renderSearchResults(state.books, state.rentals, document.getElementById('search-input').value);
            renderRentals(state.books, state.rentals);
        }
        console.info(`Pagamento do aluguel ${rentalId} aprovado pelo bibliotecário.`);
        return true;
    }

    function cancelRental(rentalId) {
        const state = loadState();
        const idx = state.rentals.findIndex(r => r.id === rentalId);
        if (idx === -1) { alert('Aluguel não encontrado'); return; }
        const rental = state.rentals[idx];
        if (!confirm('Deseja realmente cancelar este aluguel?')) return;

        const book = state.books.find(b => b.id === rental.bookId);
        if (book) book.disponivel = true;
        state.rentals.splice(idx, 1);
        saveState(state);
        renderSearchResults(state.books, state.rentals, document.getElementById('search-input').value);
        renderRentals(state.books, state.rentals);
        alert('Aluguel cancelado.');
    }

    function attachDelegation() {
        document.getElementById('estudante-app').addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            if (action === 'rent') rentBook(id);
            else if (action === 'request') requestPaymentApproval(id);
            else if (action === 'cancel') cancelRental(id);
            else if (action === 'view') {
                const state = loadState();
                const rental = state.rentals.find(r => r.bookId === id);
                if (rental) {
                    alert(`Aluguel:\nLivro: ${id}\nAlugado em: ${new Date(rental.rentedAt).toLocaleString()}\nPago: ${rental.pago ? 'Sim' : 'Não'}\nPedido ao bibliotecário: ${rental.solicitadoAoBibliotecario ? 'Sim' : 'Não'}`);
                } else alert('Nenhum aluguel encontrado para este livro.');
            }
        });
    }

    function attachSearch() {
        const input = document.getElementById('search-input');
        const clear = document.getElementById('search-clear');
        input.addEventListener('input', () => {
            const state = loadState();
            renderSearchResults(state.books, state.rentals, input.value);
        });
        clear.addEventListener('click', () => {
            input.value = '';
            const state = loadState();
            renderSearchResults(state.books, state.rentals, '');
        });
    }

    function init() {
        ensureUI();
        const state = loadState();
        renderSearchResults(state.books, state.rentals, '');
        renderRentals(state.books, state.rentals);
        attachDelegation();
        attachSearch();
        // expõe função para que o bibliotecário (ou testes) possam aprovar via console:
        window.approvePaymentByLibrarian = approvePaymentByLibrarian;
    }

    document.addEventListener('DOMContentLoaded', init);
})();

function registerPaymentRequest(rentalId, userId, bookId) {
    const state = loadState();
    
    const solicitacoes = JSON.parse(localStorage.getItem("solicitacoes_pagamento")) || [];

    solicitacoes.push({
        id_solicitacao: Date.now(),
        rentalId,
        userId,
        bookId,
        criadoEm: new Date().toISOString()
    });

    localStorage.setItem("solicitacoes_pagamento", JSON.stringify(solicitacoes));

    console.log("Solicitação enviada ao bibliotecário:", solicitacoes);
}

// estudante.js
// Lógica para gerenciar estado (books, rentals, users) + gerar solicitações de pagamento

const STATE_KEY = 'app_state_v1';
const SOLICITACOES_KEY = 'solicitacoes_pagamento_v1';

/* ---------------------------
   Helpers: load/save state
   --------------------------- */
function loadState() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) {
        // estado inicial exemplo (substitua ou expanda conforme precisar)
        const initial = {
            users: [
                { id: 1, name: 'Aluno Exemplo' }
            ],
            books: [
                { id: 101, title: 'Livro A', disponivel: true },
                { id: 102, title: 'Livro B', disponivel: true }
            ],
            rentals: [] // { id, userId, bookId, createdAt, pago:false, paidAt:null, solicitadoAoBibliotecario:false }
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(raw);
}

function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/* ---------------------------
   Função: criar aluguel (exemplo)
   --------------------------- */
function createRental(userId, bookId) {
    const state = loadState();
    const book = state.books.find(b => b.id === bookId);
    if (!book) { alert('Livro não encontrado'); return null; }
    if (!book.disponivel) { alert('Livro não está disponível'); return null; }

    const newRental = {
        id: Date.now(),
        userId,
        bookId,
        createdAt: new Date().toISOString(),
        pago: false,
        paidAt: null,
        solicitadoAoBibliotecario: true // marcado para solicitar pagamento ao bibliotecário
    };

    // marca livro indisponível
    book.disponivel = false;
    state.rentals.push(newRental);
    saveState(state);

    // registra solicitação de pagamento para o bibliotecário
    registerPaymentRequest(newRental.id, userId, bookId);

    // atualiza UI local (implemente suas funções de renderização)
    if (typeof renderSearchResults === 'function') {
        renderSearchResults(state.books, state.rentals, document.getElementById('search-input')?.value || '');
    }
    if (typeof renderRentals === 'function') {
        renderRentals(state.books, state.rentals);
    }

    alert('Aluguel criado e solicitação de pagamento enviada ao bibliotecário.');
    return newRental;
}

/* ---------------------------
   Função: registrar solicitação para bibliotecário (localStorage)
   --------------------------- */
function registerPaymentRequest(rentalId, userId, bookId) {
    const solicitacoes = JSON.parse(localStorage.getItem(SOLICITACOES_KEY)) || [];
    const id_solicitacao = Date.now();

    solicitacoes.push({
        id_solicitacao,
        rentalId,
        userId,
        bookId,
        criadoEm: new Date().toISOString()
    });

    localStorage.setItem(SOLICITACOES_KEY, JSON.stringify(solicitacoes));
    console.log('Solicitação registrada:', id_solicitacao);
    return id_solicitacao;
}

/* ---------------------------
   Função: bibliotecário aprova pagamento (invocado pelo painel)
   --------------------------- */
function approvePaymentByLibrarian(rentalId) {
    const state = loadState();
    const rental = state.rentals.find(r => r.id === rentalId);
    if (!rental) { console.warn('Aluguel não encontrado para aprovação'); return false; }
    if (rental.pago) { console.warn('Aluguel já está marcado como pago'); return false; }

    rental.pago = true;
    rental.paidAt = new Date().toISOString();
    rental.solicitadoAoBibliotecario = false;

    saveState(state);

    // atualiza UI caso o estudante esteja na mesma página
    if (document.getElementById('estudante-app')) {
        if (typeof renderSearchResults === 'function') {
            renderSearchResults(state.books, state.rentals, document.getElementById('search-input')?.value || '');
        }
        if (typeof renderRentals === 'function') {
            renderRentals(state.books, state.rentals);
        }
    }

    console.info(`Pagamento do aluguel ${rentalId} aprovado pelo bibliotecário.`);
    return true;
}

/* ---------------------------
   Função: cancelar aluguel (estudante)
   --------------------------- */
function cancelRental(rentalId) {
    const state = loadState();
    const idx = state.rentals.findIndex(r => r.id === rentalId);
    if (idx === -1) { alert('Aluguel não encontrado'); return; }
    const rental = state.rentals[idx];
    if (!confirm('Deseja realmente cancelar este aluguel?')) return;

    const book = state.books.find(b => b.id === rental.bookId);
    if (book) book.disponivel = true;
    state.rentals.splice(idx, 1);
    saveState(state);

    // Remove solicitação se existir
    const solicitacoes = JSON.parse(localStorage.getItem(SOLICITACOES_KEY)) || [];
    const filtradas = solicitacoes.filter(s => s.rentalId !== rentalId);
    localStorage.setItem(SOLICITACOES_KEY, JSON.stringify(filtradas));

    if (typeof renderSearchResults === 'function') {
        renderSearchResults(state.books, state.rentals, document.getElementById('search-input')?.value || '');
    }
    if (typeof renderRentals === 'function') {
        renderRentals(state.books, state.rentals);
    }
    alert('Aluguel cancelado.');
}

/* ---------------------------
   Export globals (se precisar chamar de outras partes)
   --------------------------- */
window.createRental = createRental;
window.registerPaymentRequest = registerPaymentRequest;
window.approvePaymentByLibrarian = approvePaymentByLibrarian;
window.cancelRental = cancelRental;
window.loadState = loadState;
window.saveState = saveState;
