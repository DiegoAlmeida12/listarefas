// Armazenando referências aos elementos DOM
const produtoForm = document.getElementById('produtoForm');
const tabelaProdutos = document.querySelector('table tbody');
const pesquisaInput = document.getElementById('pesquisaProduto');
const editarForm = document.getElementById('editarForm');
const excluirModal = document.getElementById('excluirModal');

// ID do produto atualmente selecionado (para edição/exclusão)
let produtoSelecionadoId = null;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar a biblioteca SQL.js
    const sqlJsScript = document.createElement('script');
    sqlJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    document.head.appendChild(sqlJsScript);

    // Mostrar ícone de carregamento
    const loadingIcon = document.getElementById('loadingIcon');
    if (loadingIcon) loadingIcon.style.display = 'block';

    sqlJsScript.onload = async () => {
        // Inicializar o banco de dados
        const dbInitializado = await window.dbManager.initDB();
        
        if (dbInitializado) {
            // Tentar carregar dados salvos anteriormente
            const dbCarregado = window.dbManager.carregarDB();
            
            if (!dbCarregado) {
                console.log('Criando um novo banco de dados...');
                // Inserir alguns produtos de exemplo
                await inserirProdutosExemplo();
            }
            
            // Atualizar a tabela de produtos
            atualizarTabelaProdutos();
        } else {
            mostrarNotificacao('Não foi possível inicializar o banco de dados', 'danger');
        }

        // Esconder ícone de carregamento
        if (loadingIcon) loadingIcon.style.display = 'none';
    };
});

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo) {
    const notificationArea = document.getElementById('notificationArea');
    
    // Criar o elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.role = 'alert';
    
    alert.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao área de notificação
    notificationArea.appendChild(alert);
    
    // Remover a notificação após 5 segundos
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            notificationArea.removeChild(alert);
        }, 500);
    }, 5000);
}

// Função para inserir produtos de exemplo
async function inserirProdutosExemplo() {
    const produtosExemplo = [
        { 
            nome: 'Coca-Cola', 
            categoria: 'Refrigerante', 
            volume: 2, 
            unidadeVolume: 'L', 
            estoque: 150, 
            preco: 8.50 
        },
        { 
            nome: 'Heineken', 
            categoria: 'Cerveja', 
            volume: 350, 
            unidadeVolume: 'ml', 
            estoque: 300, 
            preco: 5.99 
        },
        { 
            nome: 'Johnnie Walker', 
            categoria: 'Destilado', 
            volume: 750, 
            unidadeVolume: 'ml', 
            estoque: 50, 
            preco: 110.00 
        }
    ];
    
    for (const produto of produtosExemplo) {
        window.dbManager.adicionarProduto(produto);
    }
    
    // Salvar o banco de dados após inserir os exemplos
    window.dbManager.salvarDB();
}

// Atualizar a tabela de produtos com os dados do banco
function atualizarTabelaProdutos() {
    const produtos = window.dbManager.listarProdutos();
    
    // Limpar a tabela
    tabelaProdutos.innerHTML = '';
    
    if (produtos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">Nenhum produto cadastrado</td>';
        tabelaProdutos.appendChild(row);
        return;
    }
    
    // Adicionar produtos à tabela
    produtos.forEach(produto => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', produto.id);
        
        row.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${produto.volume} ${produto.unidade_volume}</td>
            <td>${produto.estoque}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</td>
            <td>
                <button class="btn btn-sm btn-warning btn-action editar-btn" data-bs-toggle="modal" data-bs-target="#editarModal">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action excluir-btn" data-bs-toggle="modal" data-bs-target="#excluirModal">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tabelaProdutos.appendChild(row);
    });
    
    // Adicionar event listeners aos botões de ação
    adicionarEventListenersAcoes();
}

// Adicionar event listeners aos botões de ação
function adicionarEventListenersAcoes() {
    // Event listeners para os botões de editar
    document.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            produtoSelecionadoId = parseInt(row.getAttribute('data-id'));
            preencherFormularioEdicao(produtoSelecionadoId);
        });
    });
    
    // Event listeners para os botões de excluir
    document.querySelectorAll('.excluir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            produtoSelecionadoId = parseInt(row.getAttribute('data-id'));
            const nomeProduto = row.querySelector('td:nth-child(2)').textContent;
            
            // Atualizar o modal de exclusão
            const produtoNomeElement = document.querySelector('#excluirModal .modal-body strong');
            produtoNomeElement.textContent = nomeProduto;
        });
    });
}

// Preencher o formulário de edição com os dados do produto
function preencherFormularioEdicao(id) {
    const produto = window.dbManager.obterProdutoPorId(id);
    
    if (produto) {
        document.getElementById('editNome').value = produto.nome;
        document.getElementById('editCategoria').value = produto.categoria;
        document.getElementById('editVolume').value = produto.volume;
        document.getElementById('editUnidadeVolume').value = produto.unidade_volume;
        document.getElementById('editEstoque').value = produto.estoque;
        document.getElementById('editPreco').value = produto.preco;
    }
}

// Submissão do formulário de cadastro
produtoForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validar o formulário (a validação básica já está no HTML e no script anterior)
    
    // Coletar dados do formulário
    const produto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        volume: parseFloat(document.getElementById('volume').value),
        unidadeVolume: document.getElementById('unidadeVolume').value,
        estoque: parseInt(document.getElementById('estoque').value),
        preco: parseFloat(document.getElementById('preco').value)
    };
    
    // Adicionar produto ao banco de dados
    const resultado = window.dbManager.adicionarProduto(produto);
    
    if (resultado.sucesso) {
        // Salvar o banco de dados
        window.dbManager.salvarDB();
        
        // Atualizar a tabela
        atualizarTabelaProdutos();
        
        // Limpar o formulário
        this.reset();
        
        // Notificar o usuário
        mostrarNotificacao(resultado.mensagem, 'success');
    } else {
        // Notificar o usuário sobre o erro
        mostrarNotificacao(resultado.mensagem, 'danger');
    }
});

// Evento de clique no botão Salvar Alterações do modal de edição
document.querySelector('#editarModal .btn-primary').addEventListener('click', function() {
    // Coletar dados do formulário de edição
    const produto = {
        nome: document.getElementById('editNome').value,
        categoria: document.getElementById('editCategoria').value,
        volume: parseFloat(document.getElementById('editVolume').value),
        unidadeVolume: document.getElementById('editUnidadeVolume').value,
        estoque: parseInt(document.getElementById('editEstoque').value),
        preco: parseFloat(document.getElementById('editPreco').value)
    };
    
    // Atualizar produto no banco de dados
    const resultado = window.dbManager.atualizarProduto(produtoSelecionadoId, produto);
    
    if (resultado.sucesso) {
        // Salvar o banco de dados
        window.dbManager.salvarDB();
        
        // Atualizar a tabela
        atualizarTabelaProdutos();
        
        // Fechar o modal
        const modalElement = document.getElementById('editarModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Notificar o usuário
        mostrarNotificacao(resultado.mensagem, 'success');
    } else {
        // Notificar o usuário sobre o erro
        mostrarNotificacao(resultado.mensagem, 'danger');
    }
});

// Evento de clique no botão Excluir do modal de exclusão
document.querySelector('#excluirModal .btn-danger').addEventListener('click', function() {
    // Excluir produto do banco de dados
    const resultado = window.dbManager.excluirProduto(produtoSelecionadoId);
    
    if (resultado.sucesso) {
        // Salvar o banco de dados
        window.dbManager.salvarDB();
        
        // Atualizar a tabela
        atualizarTabelaProdutos();
        
        // Fechar o modal
        const modalElement = document.getElementById('excluirModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Notificar o usuário
        mostrarNotificacao(resultado.mensagem, 'success');
    } else {
        // Notificar o usuário sobre o erro
        mostrarNotificacao(resultado.mensagem, 'danger');
    }
});

// Funcionalidade de pesquisa
pesquisaInput.addEventListener('keyup', function() {
    const termo = this.value.toLowerCase();
    const linhas = tabelaProdutos.getElementsByTagName('tr');
    
    for (let i = 0; i < linhas.length; i++) {
        const colunas = linhas[i].getElementsByTagName('td');
        let encontrado = false;
        
        for (let j = 0; j < colunas.length; j++) {
            const texto = colunas[j].textContent.toLowerCase();
            if (texto.indexOf(termo) > -1) {
                encontrado = true;
                break;
            }
        }
        
        if (encontrado) {
            linhas[i].style.display = '';
        } else {
            linhas[i].style.display = 'none';
        }
    }
}); 