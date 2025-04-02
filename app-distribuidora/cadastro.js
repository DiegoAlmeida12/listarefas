// Armazenando referências aos elementos DOM
const produtoForm = document.getElementById('produtoForm');
const notificationArea = document.getElementById('notificationArea');
const loadingIcon = document.getElementById('loadingIcon');

// Botões de exportação
const exportarExcelBtn = document.getElementById('exportarExcel');
const exportarPDFBtn = document.getElementById('exportarPDF');
const exportarCSVBtn = document.getElementById('exportarCSV');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar a biblioteca SQL.js
    const sqlJsScript = document.createElement('script');
    sqlJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    document.head.appendChild(sqlJsScript);

    // Mostrar ícone de carregamento
    if (loadingIcon) loadingIcon.style.display = 'block';

    sqlJsScript.onload = async () => {
        // Inicializar o banco de dados
        const dbInitializado = await window.dbManager.initDB();
        
        if (dbInitializado) {
            // Tentar carregar dados salvos anteriormente
            const dbCarregado = window.dbManager.carregarDB();
            
            if (!dbCarregado) {
                console.log('Criando um novo banco de dados...');
                mostrarNotificacao('Criando um novo banco de dados...', 'info');
            } else {
                mostrarNotificacao('Banco de dados carregado com sucesso!', 'success');
            }
            
            // Configurar os botões de exportação
            configurarBotoesExportacao();
        } else {
            mostrarNotificacao('Não foi possível inicializar o banco de dados', 'danger');
        }

        // Esconder ícone de carregamento
        if (loadingIcon) loadingIcon.style.display = 'none';
    };
});

// Configurar os botões de exportação
function configurarBotoesExportacao() {
    // Verificar se os botões existem na página
    if (!exportarExcelBtn || !exportarPDFBtn || !exportarCSVBtn) {
        console.log('Botões de exportação não encontrados');
        return;
    }
    
    // Exportar para Excel
    exportarExcelBtn.addEventListener('click', async function() {
        const produtos = window.dbManager.listarProdutos();
        if (produtos.length === 0) {
            mostrarNotificacao('Não há produtos para exportar', 'warning');
            return;
        }
        
        mostrarNotificacao('Gerando arquivo Excel...', 'info');
        const resultado = await window.exportManager.exportarExcel(produtos);
        
        if (resultado.sucesso) {
            mostrarNotificacao(resultado.mensagem, 'success');
        } else {
            mostrarNotificacao(resultado.mensagem, 'danger');
        }
    });
    
    // Exportar para PDF
    exportarPDFBtn.addEventListener('click', async function() {
        const produtos = window.dbManager.listarProdutos();
        if (produtos.length === 0) {
            mostrarNotificacao('Não há produtos para exportar', 'warning');
            return;
        }
        
        mostrarNotificacao('Gerando arquivo PDF...', 'info');
        const resultado = await window.exportManager.exportarPDF(produtos);
        
        if (resultado.sucesso) {
            mostrarNotificacao(resultado.mensagem, 'success');
        } else {
            mostrarNotificacao(resultado.mensagem, 'danger');
        }
    });
    
    // Exportar para CSV
    exportarCSVBtn.addEventListener('click', function() {
        const produtos = window.dbManager.listarProdutos();
        if (produtos.length === 0) {
            mostrarNotificacao('Não há produtos para exportar', 'warning');
            return;
        }
        
        try {
            window.exportManager.exportarCSV(produtos);
            mostrarNotificacao('Exportação para CSV concluída!', 'success');
        } catch (err) {
            mostrarNotificacao('Erro ao exportar para CSV: ' + err.message, 'danger');
        }
    });
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo) {
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

// Submissão do formulário de cadastro
produtoForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Coletar dados do formulário
    const produto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        volume: parseFloat(document.getElementById('volume').value),
        unidadeVolume: document.getElementById('unidadeVolume').value,
        estoque: parseInt(document.getElementById('estoque').value),
        preco: parseFloat(document.getElementById('preco').value)
    };
    
    // Validação adicional
    if (produto.volume <= 0) {
        mostrarNotificacao('O volume deve ser maior que zero!', 'warning');
        return;
    }
    
    if (produto.estoque < 0) {
        mostrarNotificacao('A quantidade em estoque não pode ser negativa!', 'warning');
        return;
    }
    
    if (produto.preco <= 0) {
        mostrarNotificacao('O preço deve ser maior que zero!', 'warning');
        return;
    }
    
    // Adicionar produto ao banco de dados
    const resultado = window.dbManager.adicionarProduto(produto);
    
    if (resultado.sucesso) {
        // Salvar o banco de dados
        window.dbManager.salvarDB();
        
        // Limpar o formulário
        this.reset();
        
        // Notificar o usuário
        mostrarNotificacao(resultado.mensagem, 'success');
        
        // Opção para ir para a lista de produtos
        const confirmacao = confirm("Produto cadastrado com sucesso! Deseja visualizar a lista de produtos?");
        if (confirmacao) {
            window.location.href = "index.html#lista";
        }
    } else {
        // Notificar o usuário sobre o erro
        mostrarNotificacao(resultado.mensagem, 'danger');
    }
}); 