// Inicializando o banco de dados SQLite usando SQL.js
let SQL;
let db;

// Função para inicializar o banco de dados
async function initDB() {
  try {
    // Carregando o SQL.js
    SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // Criando um novo banco de dados
    db = new SQL.Database();
    
    // Criando a tabela de produtos
    db.run(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        volume REAL NOT NULL,
        unidade_volume TEXT NOT NULL,
        estoque INTEGER NOT NULL,
        preco REAL NOT NULL
      )
    `);
    
    console.log("Banco de dados inicializado com sucesso!");
    return true;
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
    return false;
  }
}

// Função para adicionar um produto
function adicionarProduto(produto) {
  try {
    const { nome, categoria, volume, unidadeVolume, estoque, preco } = produto;
    
    db.run(`
      INSERT INTO produtos (nome, categoria, volume, unidade_volume, estoque, preco)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, categoria, volume, unidadeVolume, estoque, preco]);
    
    return { sucesso: true, mensagem: "Produto adicionado com sucesso!" };
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    return { sucesso: false, mensagem: "Erro ao adicionar produto: " + err.message };
  }
}

// Função para listar todos os produtos
function listarProdutos() {
  try {
    const resultado = db.exec("SELECT * FROM produtos ORDER BY id DESC");
    
    if (resultado.length === 0) {
      return [];
    }
    
    const colunas = resultado[0].columns;
    const valores = resultado[0].values;
    
    // Convertendo para um array de objetos
    const produtos = valores.map(linha => {
      const produto = {};
      colunas.forEach((coluna, index) => {
        produto[coluna] = linha[index];
      });
      return produto;
    });
    
    return produtos;
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return [];
  }
}

// Função para atualizar um produto
function atualizarProduto(id, produto) {
  try {
    const { nome, categoria, volume, unidadeVolume, estoque, preco } = produto;
    
    db.run(`
      UPDATE produtos 
      SET nome = ?, categoria = ?, volume = ?, unidade_volume = ?, estoque = ?, preco = ?
      WHERE id = ?
    `, [nome, categoria, volume, unidadeVolume, estoque, preco, id]);
    
    return { sucesso: true, mensagem: "Produto atualizado com sucesso!" };
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    return { sucesso: false, mensagem: "Erro ao atualizar produto: " + err.message };
  }
}

// Função para excluir um produto
function excluirProduto(id) {
  try {
    db.run("DELETE FROM produtos WHERE id = ?", [id]);
    return { sucesso: true, mensagem: "Produto excluído com sucesso!" };
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    return { sucesso: false, mensagem: "Erro ao excluir produto: " + err.message };
  }
}

// Função para obter um produto pelo ID
function obterProdutoPorId(id) {
  try {
    const resultado = db.exec("SELECT * FROM produtos WHERE id = ?", [id]);
    
    if (resultado.length === 0 || resultado[0].values.length === 0) {
      return null;
    }
    
    const colunas = resultado[0].columns;
    const valores = resultado[0].values[0];
    
    const produto = {};
    colunas.forEach((coluna, index) => {
      produto[coluna] = valores[index];
    });
    
    return produto;
  } catch (err) {
    console.error("Erro ao obter produto:", err);
    return null;
  }
}

// Função para salvar o banco de dados
function salvarDB() {
  try {
    // Exportando o banco de dados como um arquivo binário
    const data = db.export();
    const buffer = new Uint8Array(data);
    
    // Armazenando no localStorage como string base64
    const base64 = btoa(String.fromCharCode.apply(null, buffer));
    localStorage.setItem('produtosDB', base64);
    
    return { sucesso: true, mensagem: "Banco de dados salvo com sucesso!" };
  } catch (err) {
    console.error("Erro ao salvar banco de dados:", err);
    return { sucesso: false, mensagem: "Erro ao salvar banco de dados: " + err.message };
  }
}

// Função para carregar o banco de dados do localStorage
function carregarDB() {
  try {
    const base64 = localStorage.getItem('produtosDB');
    
    if (!base64) {
      console.log("Nenhum banco de dados encontrado no localStorage.");
      return false;
    }
    
    const binaryString = atob(base64);
    const buffer = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
    
    db = new SQL.Database(buffer);
    console.log("Banco de dados carregado com sucesso!");
    return true;
  } catch (err) {
    console.error("Erro ao carregar banco de dados:", err);
    return false;
  }
}

// Exportando as funções
window.dbManager = {
  initDB,
  adicionarProduto,
  listarProdutos,
  atualizarProduto,
  excluirProduto,
  obterProdutoPorId,
  salvarDB,
  carregarDB
}; 