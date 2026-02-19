
// RIBEIRIO MÓVEIS - SISTEMA ATUALIZADO
// ============================================

// Carregar produtos do localStorage
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

let currentImageIndex = 0;
let currentProduto = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('produtosGrid')) {
        renderProdutos('todos');
    }
});

// ============================================
// PRODUTOS
// ============================================

function renderProdutos(filtro) {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Se não houver produtos, mostrar mensagem
    if (produtos.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 4rem; color: var(--dourado); margin-bottom: 20px;"></i>
                <h3 style="color: var(--vinho); margin-bottom: 10px;">Nenhum produto cadastrado</h3>
                <p style="color: #666;">Acesse a área administrativa para adicionar produtos.</p>
                <a href="admin.html" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: var(--vinho); color: var(--dourado); text-decoration: none; border-radius: 5px;">
                    <i class="fas fa-cog"></i> Ir para Admin
                </a>
            </div>
        `;
        return;
    }
    
    let produtosFiltrados;
    
    if (filtro === 'todos') {
        produtosFiltrados = produtos;
    } else if (filtro === 'premium') {
        produtosFiltrados = produtos.filter(p => p.premium === true);
    } else {
        produtosFiltrados = produtos.filter(p => p.categoria === filtro);
    }
    
    if (produtosFiltrados.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: #666;">Nenhum produto nesta categoria.</p>
            </div>
        `;
        return;
    }
    
    produtosFiltrados.forEach(produto => {
        const card = createProdutoCard(produto);
        grid.appendChild(card);
    });
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.toLowerCase().trim();
        if ((filtro === 'todos' && btnText.includes('todos')) ||
            (filtro === 'premium' && btnText.includes('premium')) ||
            (filtro === 'sofas' && btnText.includes('sofás')) ||
            (filtro === 'camas' && btnText.includes('camas')) ||
            (filtro === 'mesas' && btnText.includes('mesas')) ||
            (filtro === 'armarios' && btnText.includes('armários')) ||
            (filtro === 'colchoes' && btnText.includes('colchões'))) {
            btn.classList.add('active');
        }
    });
}

function createProdutoCard(produto) {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.onclick = () => openModal(produto);
    
    const coresHtml = produto.cores.slice(0, 4).map(cor => 
        `<span class="color-dot" style="background-color: ${getColorCode(cor)}" title="${cor}"></span>`
    ).join('');
    
    // Badge Premium ou Normal
    const badgeHtml = produto.premium 
        ? '<span class="produto-badge premium"><i class="fas fa-crown"></i> Premium</span>'
        : '<span class="produto-badge">Disponível</span>';
    
    card.innerHTML = `
        <div class="produto-image">
            <img src="${produto.imagens[0]}" alt="${produto.nome}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Sem+Imagem'">
            ${badgeHtml}
        </div>
        <div class="produto-info">
            <h3>${produto.nome}</h3>
            <p class="produto-price">R$ ${formatarPreco(produto.preco)}</p>
            <div class="produto-colors">
                ${coresHtml}
                ${produto.cores.length > 4 ? `<span class="color-dot" style="background: linear-gradient(45deg, #ddd, #999); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #666;">+</span>` : ''}
            </div>
            <button class="produto-btn">
                Ver Detalhes <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    return card;
}

function filtrarProdutos(categoria) {
    renderProdutos(categoria);
}

// ============================================
// MODAL DO PRODUTO
// ============================================

function openModal(produto) {
    currentProduto = produto;
    currentImageIndex = 0;
    
    const modal = document.getElementById('produtoModal');
    document.getElementById('modalTitle').textContent = produto.nome;
    document.getElementById('modalPrice').textContent = `R$ ${formatarPreco(produto.preco)}`;
    document.getElementById('modalDescription').textContent = produto.descricao;
    document.getElementById('modalDimensions').textContent = produto.dimensoes;
    
    // Cores
    const coresContainer = document.getElementById('colorOptions');
    coresContainer.innerHTML = produto.cores.map((cor, idx) => 
        `<span class="color-option ${idx === 0 ? 'active' : ''}" onclick="selectColor(this)">${cor}</span>`
    ).join('');
    
    // Galeria
    updateGallery();
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function selectColor(element) {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

function updateGallery() {
    if (!currentProduto) return;
    
    const mainImg = document.getElementById('modalMainImage');
    mainImg.src = currentProduto.imagens[currentImageIndex];
    
    const thumbs = document.getElementById('galleryThumbs');
    thumbs.innerHTML = currentProduto.imagens.map((img, idx) => 
        `<img src="${img}" class="${idx === currentImageIndex ? 'active' : ''}" onclick="setImage(${idx})" alt="Miniatura ${idx + 1}" onerror="this.style.display='none'">`
    ).join('');
}

function changeImage(direction) {
    if (!currentProduto) return;
    currentImageIndex = (currentImageIndex + direction + currentProduto.imagens.length) % currentProduto.imagens.length;
    updateGallery();
}

function setImage(index) {
    currentImageIndex = index;
    updateGallery();
}

function closeModal() {
    const modal = document.getElementById('produtoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentProduto = null;
}

// ============================================
// WHATSAPP
// ============================================

function enviarWhatsApp() {
    if (!currentProduto) return;
    
    const corSelecionada = document.querySelector('.color-option.active')?.textContent || currentProduto.cores[0];
    const tipoProduto = currentProduto.premium ? '⭐ PREMIUM' : '';
    
    const mensagem = `👑 *Ribeiro Móveis e Colchões* 👑\\n\\n` +
                    `Olá! Tenho interesse no produto:\\n\\n` +
                    `${tipoProduto}\\n` +
                    `*${currentProduto.nome}*\\n` +
                    `💰 Preço: R$ ${formatarPreco(currentProduto.preco)}\\n` +
                    `🎨 Cor: ${corSelecionada}\\n` +
                    `📐 ${currentProduto.dimensoes}\\n\\n` +
                    `Poderia me passar mais informações e formas de pagamento?\\n\\n` +
                    `Aguardo seu retorno. Obrigado!`;
    
    const url = `https://wa.me/5512991652100?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatarPreco(preco) {
    return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getColorCode(cor) {
    const cores = {
        'marrom': '#8B4513',
        'bege': '#F5F5DC',
        'cinza': '#808080',
        'branco': '#FFFFFF',
        'preto': '#000000',
        'madeira': '#DEB887',
        'carvalho': '#D2691E',
        'nogueira': '#654321',
        'vinho': '#722F37',
        'azul marinho': '#000080',
        'azul': '#0000FF',
        'vermelho': '#FF0000',
        'verde': '#008000',
        'amarelo': '#FFFF00',
        'rosa': '#FFC0CB',
        'roxo': '#800080',
        'laranja': '#FFA500'
    };
    return cores[cor.toLowerCase().trim()] || '#ddd';
}

function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Animações de scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
    } else {
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
    }
});