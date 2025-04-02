// Funções para exportação de dados

// Função para exportar para CSV
function exportarCSV(produtos) {
    // Definir cabeçalhos da tabela
    const cabecalhos = ['ID', 'Nome', 'Categoria', 'Volume', 'Unidade', 'Estoque', 'Preço'];
    
    // Criar a linha de cabeçalho
    let csvContent = cabecalhos.join(',') + '\n';
    
    // Adicionar as linhas de dados
    produtos.forEach(produto => {
        const row = [
            produto.id,
            '"' + produto.nome.replace(/"/g, '""') + '"', // Escape em caso de aspas no nome
            '"' + produto.categoria.replace(/"/g, '""') + '"',
            produto.volume,
            produto.unidade_volume,
            produto.estoque,
            produto.preco.toFixed(2).replace('.', ',')
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Criar o blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link temporário
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'produtos_bebidas.csv');
    link.style.visibility = 'hidden';
    
    // Adicionar ao DOM, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para exportar para Excel (XLSX)
async function exportarExcel(produtos) {
    try {
        // Verificar se a biblioteca SheetJS está disponível, caso contrário, carregar
        if (typeof XLSX === 'undefined') {
            await carregarScript('https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js');
        }
        
        // Preparar os dados para o formato do Excel
        const dados = produtos.map(produto => ({
            ID: produto.id,
            Nome: produto.nome,
            Categoria: produto.categoria,
            Volume: produto.volume,
            Unidade: produto.unidade_volume,
            Estoque: produto.estoque,
            Preço: parseFloat(produto.preco).toFixed(2).replace('.', ',')
        }));
        
        // Criar uma planilha
        const ws = XLSX.utils.json_to_sheet(dados);
        
        // Criar um livro
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produtos");
        
        // Exportar para XLSX
        XLSX.writeFile(wb, "produtos_bebidas.xlsx");
        
        return { sucesso: true, mensagem: "Exportação para Excel concluída!" };
    } catch (err) {
        console.error("Erro ao exportar para Excel:", err);
        return { sucesso: false, mensagem: "Erro ao exportar para Excel: " + err.message };
    }
}

// Função para exportar para PDF
async function exportarPDF(produtos) {
    try {
        // Verificar se a biblioteca jsPDF está disponível, caso contrário, carregar
        if (typeof jspdf === 'undefined') {
            await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        
        // Verificar se a biblioteca jsPDF-AutoTable está disponível, caso contrário, carregar
        if (typeof jspdf.jsPDF.API.autoTable === 'undefined') {
            await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js');
        }
        
        // Criar um novo documento PDF
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        // Adicionar título
        doc.setFontSize(18);
        doc.text("Relatório de Produtos - Distribuidora de Bebidas", 14, 22);
        
        // Adicionar data de geração
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(11);
        doc.text(`Gerado em: ${dataAtual}`, 14, 30);
        
        // Preparar os dados para a tabela
        const dadosTabela = produtos.map(produto => [
            produto.id,
            produto.nome,
            produto.categoria,
            `${produto.volume} ${produto.unidade_volume}`,
            produto.estoque,
            `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`
        ]);
        
        // Adicionar tabela com os dados
        doc.autoTable({
            startY: 35,
            head: [['ID', 'Nome', 'Categoria', 'Volume', 'Estoque', 'Preço']],
            body: dadosTabela,
            theme: 'striped',
            headStyles: { fillColor: [0, 123, 255] }
        });
        
        // Salvar o PDF
        doc.save("produtos_bebidas.pdf");
        
        return { sucesso: true, mensagem: "Exportação para PDF concluída!" };
    } catch (err) {
        console.error("Erro ao exportar para PDF:", err);
        return { sucesso: false, mensagem: "Erro ao exportar para PDF: " + err.message };
    }
}

// Função para carregar scripts dinamicamente
function carregarScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = (err) => reject(new Error(`Erro ao carregar o script ${url}: ${err}`));
        document.head.appendChild(script);
    });
}

// Exportar funções
window.exportManager = {
    exportarCSV,
    exportarExcel,
    exportarPDF
}; 