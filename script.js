// ===================== VARIÁVEIS GLOBAIS =====================
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let usuarioLogado = localStorage.getItem('loggedIn') === 'true';
let metodoPagamentoSelecionado = 'pix';
let formularioCheckoutValido = false;

// ===================== MENU HAMBURGUER =====================
function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    let overlay = document.getElementById('menuOverlay');

    // Criar menu lateral se não existir
    if (!menu) {
        const menuHTML = `
            <div class="menu-lateral" id="menuLateral">
                <a href="Contato.html" onclick="fecharMenu()">Contato</a>
                <a href="Sobre.html" onclick="fecharMenu()">Sobre</a>
                <a href="carrinho.html" onclick="fecharMenu()">Carrinho</a>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    // Criar overlay se não existir
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'menuOverlay';
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        overlay.onclick = toggleMenu;
    }

    const menuElement = document.getElementById('menuLateral');
    
    if (menuElement.classList.contains('active')) {
        menuElement.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        menuElement.classList.add('active');
        overlay.classList.add('active');
    }
}

function fecharMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// ===================== FUNÇÕES DO CARRINHO =====================
function atualizarContador() {
    try {
        const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItens = carrinhoAtual.reduce((acc, item) => acc + item.quantidade, 0);
        const contadores = document.querySelectorAll('.cart-counter');
        
        contadores.forEach(contador => {
            if (contador) {
                contador.textContent = totalItens;
                contador.style.display = totalItens > 0 ? 'inline-flex' : 'none';
            }
        });
        
        // Atualizar variável global
        carrinho = carrinhoAtual;
        return totalItens;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        return 0;
    }
}

function adicionarCarrinho(nome, preco, imagem = '', descricao = '') {
    try {
        // Verificar login para compras
        if (!usuarioLogado) {
            if (confirm('🔐 Você precisa estar logado para adicionar itens ao carrinho.\nDeseja fazer login agora?')) {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        // Carregar carrinho atual do localStorage
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        
        // Converter preço para número
        let precoNum;
        if (typeof preco === 'string') {
            precoNum = parseFloat(
                preco.replace('R$', '')
                     .replace(/\./g, '')
                     .replace(',', '.')
                     .trim()
            );
        } else {
            precoNum = preco;
        }
        
        // Verificar se já existe no carrinho
        const itemExistente = carrinho.find(item => item.nome === nome);
        
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({
                nome: nome,
                preco: precoNum,
                quantidade: 1,
                imagem: imagem,
                descricao: descricao
            });
        }
        
        // Salvar no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Atualizar contador
        atualizarContador();
        
        // Mostrar notificação
        mostrarNotificacao(`✅ ${nome} adicionado ao carrinho!`);
        
        return false;
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        mostrarNotificacao('❌ Erro ao adicionar produto ao carrinho!', 'error');
        return false;
    }
}

function removerDoCarrinho(nome) {
    try {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const index = carrinho.findIndex(item => item.nome === nome);
        
        if (index !== -1) {
            const itemRemovido = carrinho[index];
            carrinho.splice(index, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContador();
            
            mostrarNotificacao(`🗑️ ${itemRemovido.nome} removido do carrinho`);
            
            // Recarregar a página do carrinho se estivermos nela
            if (window.location.pathname.includes('carrinho.html') || 
                window.location.href.includes('carrinho.html')) {
                setTimeout(() => location.reload(), 500);
            }
        } else {
            mostrarNotificacao('❌ Item não encontrado no carrinho!', 'error');
        }
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        mostrarNotificacao('❌ Erro ao remover item do carrinho!', 'error');
    }
}

function alterarQuantidade(nome, delta) {
    try {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const item = carrinho.find(i => i.nome === nome);
        
        if (item) {
            const novaQuantidade = item.quantidade + delta;
            
            if (novaQuantidade <= 0) {
                removerDoCarrinho(nome);
            } else {
                item.quantidade = novaQuantidade;
                localStorage.setItem('carrinho', JSON.stringify(carrinho));
                atualizarContador();
                
                if (window.location.pathname.includes('carrinho.html') || 
                    window.location.href.includes('carrinho.html')) {
                    setTimeout(() => location.reload(), 300);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao alterar quantidade:', error);
    }
}

function esvaziarCarrinho() {
    try {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        
        if (carrinho.length === 0) {
            mostrarNotificacao('🛒 Seu carrinho já está vazio!');
            return;
        }
        
        if (confirm('⚠️ Tem certeza que deseja esvaziar todo o carrinho?\nEsta ação não pode ser desfeita.')) {
            localStorage.setItem('carrinho', JSON.stringify([]));
            atualizarContador();
            
            mostrarNotificacao('✅ Carrinho esvaziado com sucesso!');
            
            if (window.location.pathname.includes('carrinho.html') || 
                window.location.href.includes('carrinho.html')) {
                setTimeout(() => location.reload(), 500);
            }
        }
    } catch (error) {
        console.error('Erro ao esvaziar carrinho:', error);
        mostrarNotificacao('❌ Erro ao esvaziar carrinho!', 'error');
    }
}

// ===================== FUNÇÕES DE LOGIN/CADASTRO =====================
function fazerLogin(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('email-login')?.value;
    const senha = document.getElementById('senha-login')?.value;
    
    if (!email || !senha) {
        mostrarNotificacao('❌ Preencha todos os campos!', 'error');
        return false;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email === email && user.senha === senha) {
        localStorage.setItem('loggedIn', 'true');
        usuarioLogado = true;
        
        mostrarNotificacao('✅ Login realizado com sucesso! 🚀');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
        return true;
    } else {
        mostrarNotificacao('❌ Email ou senha incorretos!', 'error');
        return false;
    }
}

function fazerLogout() {
    localStorage.setItem('loggedIn', 'false');
    usuarioLogado = false;
    
    mostrarNotificacao('👋 Até logo! Você saiu da sua conta.');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function cadastrar(event) {
    if (event) event.preventDefault();
    
    const nome = document.querySelector('input[placeholder="Nome completo"]')?.value;
    const email = document.querySelector('input[type="email"]')?.value;
    const senha = document.getElementById('senha-cadastro')?.value;
    const confirmar = document.getElementById('confirmar-senha')?.value;
    
    // Validações
    if (!nome || !email || !senha || !confirmar) {
        mostrarNotificacao('❌ Preencha todos os campos!', 'error');
        return false;
    }
    
    if (senha.length < 6) {
        mostrarNotificacao('❌ A senha deve ter no mínimo 6 caracteres!', 'error');
        return false;
    }
    
    if (senha !== confirmar) {
        mostrarNotificacao('❌ As senhas não coincidem!', 'error');
        return false;
    }
    
    // Verificar se email já existe
    const userExistente = JSON.parse(localStorage.getItem('user'));
    if (userExistente && userExistente.email === email) {
        mostrarNotificacao('❌ Este email já está cadastrado!', 'error');
        return false;
    }
    
    const user = { 
        nome, 
        email, 
        senha,
        dataCadastro: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    
    mostrarNotificacao('✅ Conta criada com sucesso! Agora faça login.');
    
    // Redirecionar para login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
    
    return true;
}

// ===================== FUNÇÕES DE CHECKOUT =====================
function selecionarPagamento(elemento) {
    const opcoes = document.querySelectorAll('.pagamento-opcao');
    opcoes.forEach(e => e.classList.remove('selected'));
    elemento.classList.add('selected');
    metodoPagamentoSelecionado = elemento.getAttribute('data-value');
    
    // Remover mensagem de erro se houver
    const erroPagamento = document.getElementById('pagamento-error');
    if (erroPagamento) {
        erroPagamento.textContent = '';
    }
    
    // Validar formulário após seleção
    if (typeof validarFormularioCheckout === 'function') {
        validarFormularioCheckout();
    }
    
    return true;
}

function validarCampoCheckout(campoId, valor) {
    switch(campoId) {
        case 'cep':
            return validarCEP(valor);
        case 'rua':
            return valor.length >= 3;
        case 'numero':
            return /^\d+$/.test(valor) && parseInt(valor) > 0;
        case 'bairro':
            return valor.length >= 3;
        case 'cidade':
            return valor.length >= 3;
        case 'estado':
            return /^[A-Z]{2}$/.test(valor.toUpperCase());
        default:
            return true;
    }
}

function validarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    return cep.length === 8;
}

function mostrarErroCheckout(elementId, mensagem) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = mensagem;
        elemento.style.display = 'block';
    }
}

function limparErroCheckout(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = '';
        elemento.style.display = 'none';
    }
}

function validarFormularioCheckout() {
    const campos = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    let todosValidos = true;
    
    // Verificar campos obrigatórios
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        const valor = input ? input.value.trim() : '';
        
        if (!valor) {
            todosValidos = false;
            mostrarErroCheckout(campo + '-error', 'Este campo é obrigatório');
        } else if (!validarCampoCheckout(campo, valor)) {
            todosValidos = false;
            switch(campo) {
                case 'cep':
                    mostrarErroCheckout('cep-error', 'CEP inválido (00000-000)');
                    break;
                case 'estado':
                    mostrarErroCheckout('estado-error', 'Digite a sigla (ex: SP)');
                    break;
                default:
                    mostrarErroCheckout(campo + '-error', 'Valor inválido');
            }
        } else {
            limparErroCheckout(campo + '-error');
        }
    });
    
    // Verificar método de pagamento
    if (!metodoPagamentoSelecionado) {
        todosValidos = false;
        mostrarErroCheckout('pagamento-error', 'Selecione um método de pagamento');
    } else {
        limparErroCheckout('pagamento-error');
    }
    
    // Verificar se há itens no carrinho
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        todosValidos = false;
    }
    
    // Atualizar estado do botão
    const btnFinalizar = document.getElementById('btn-finalizar');
    const mensagemValidacao = document.getElementById('mensagem-validacao');
    
    if (btnFinalizar) {
        if (todosValidos) {
            btnFinalizar.disabled = false;
            btnFinalizar.style.opacity = '1';
            btnFinalizar.style.cursor = 'pointer';
            
            if (mensagemValidacao) {
                mensagemValidacao.style.display = 'none';
            }
        } else {
            btnFinalizar.disabled = true;
            btnFinalizar.style.opacity = '0.5';
            btnFinalizar.style.cursor = 'not-allowed';
            
            if (mensagemValidacao && carrinho.length > 0) {
                mensagemValidacao.style.display = 'block';
            }
        }
    }
    
    formularioCheckoutValido = todosValidos;
    return todosValidos;
}

function validarCheckout() {
    // Verificar se o formulário está válido
    if (!validarFormularioCheckout()) {
        // Scroll para o primeiro erro
        const primeiroErro = document.querySelector('.error-message:not(:empty)');
        if (primeiroErro) {
            primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        mostrarNotificacao('❌ Preencha todos os campos corretamente!', 'error');
        return false;
    }
    
    // Verificar carrinho
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        mostrarNotificacao('🛒 Seu carrinho está vazio!', 'error');
        return false;
    }
    
    // Tudo válido, prosseguir com a compra
    return finalizarCompraCheckout();
}

function finalizarCompraCheckout() {
    try {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        
        // Coletar dados do endereço
        const endereco = {
            cep: document.getElementById('cep').value,
            rua: document.getElementById('rua').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value || '',
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value.toUpperCase()
        };
        
        // Determinar método de pagamento
        let metodoPagamentoTexto = '';
        switch(metodoPagamentoSelecionado) {
            case 'pix':
                metodoPagamentoTexto = 'PIX (5% OFF)';
                break;
            case 'credito':
                metodoPagamentoTexto = 'Cartão de Crédito';
                break;
            case 'boleto':
                metodoPagamentoTexto = 'Boleto Bancário';
                break;
            default:
                metodoPagamentoTexto = 'PIX';
        }
        
        // Confirmar compra
        if (confirm(`🎉 Confirmar compra?\n\n--- ENDEREÇO DE ENTREGA ---\n${endereco.rua}, ${endereco.numero}\n${endereco.complemento ? 'Complemento: ' + endereco.complemento + '\n' : ''}${endereco.bairro}, ${endereco.cidade}-${endereco.estado}\nCEP: ${endereco.cep}\n\n--- PAGAMENTO ---\nMétodo: ${metodoPagamentoTexto}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\nItens: ${totalItens}\n\nObrigado por comprar na NewGen!`)) {
            
            // Mostrar loading
            const btn = document.getElementById('btn-finalizar');
            if (btn) {
                btn.innerHTML = 'Processando... ✦';
                btn.disabled = true;
            }
            
            // Salvar dados da compra
            const compra = {
                id: 'NG-' + Date.now(),
                data: new Date().toISOString(),
                itens: carrinho,
                total: total,
                endereco: endereco,
                pagamento: metodoPagamentoSelecionado,
                status: 'confirmada'
            };
            
            // Salvar no histórico de compras
            let historico = JSON.parse(localStorage.getItem('historicoCompras')) || [];
            historico.push(compra);
            localStorage.setItem('historicoCompras', JSON.stringify(historico));
            
            // Limpar carrinho
            localStorage.setItem('carrinho', JSON.stringify([]));
            
            // Atualizar contador
            atualizarContador();
            
            // Mostrar mensagem de sucesso
            mostrarNotificacao('✅ Compra finalizada com sucesso! Redirecionando...');
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                window.location.href = 'compra-confirmada.html';
            }, 2000);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        mostrarNotificacao('❌ Erro ao finalizar compra!', 'error');
        
        // Reativar botão
        const btn = document.getElementById('btn-finalizar');
        if (btn) {
            btn.innerHTML = 'Pagar Agora ✦';
            btn.disabled = false;
        }
        
        return false;
    }
}

// ===================== FUNÇÕES DE NOTIFICAÇÃO =====================
function mostrarNotificacao(mensagem, tipo = 'success') {
    // Remover notificações antigas
    const notificacoesAntigas = document.querySelectorAll('.notificacao');
    notificacoesAntigas.forEach(notif => notif.remove());
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <span class="notificacao-mensagem">${mensagem}</span>
            <button class="notificacao-fechar" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Estilos da notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${tipo === 'error' ? 'rgba(255, 85, 85, 0.95)' : 'rgba(0, 255, 136, 0.95)'};
        color: ${tipo === 'error' ? '#fff' : '#000'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Estilos internos
    notificacao.querySelector('.notificacao-conteudo').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notificacao.querySelector('.notificacao-mensagem').style.cssText = `
        font-size: 16px;
        font-weight: 600;
    `;
    
    notificacao.querySelector('.notificacao-fechar').style.cssText = `
        background: none;
        border: none;
        color: ${tipo === 'error' ? '#fff' : '#000'};
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.style.animation = 'slideOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                if (notificacao.parentElement) {
                    notificacao.remove();
                }
                style.remove();
            }, 300);
        } else {
            style.remove();
        }
    }, 5000);
}

// ===================== FUNÇÕES DE UTILIDADE =====================
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function calcularTotalCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
}

function verificarLogin() {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    usuarioLogado = loggedIn;
    
    // Atualizar interface se houver elementos de login/logout
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink && usuarioLogado) {
        loginLink.textContent = 'Minha Conta';
        loginLink.href = '#';
        loginLink.onclick = function(e) {
            e.preventDefault();
            if (confirm('Deseja sair da sua conta?')) {
                fazerLogout();
            }
        };
    }
}

function inicializarValidacaoCheckout() {
    // Adicionar eventos de validação em tempo real
    const campos = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.addEventListener('input', function() {
                limparErroCheckout(campo + '-error');
                validarFormularioCheckout();
            });
            input.addEventListener('blur', function() {
                const valor = this.value.trim();
                if (valor && !validarCampoCheckout(campo, valor)) {
                    switch(campo) {
                        case 'cep':
                            mostrarErroCheckout('cep-error', 'CEP inválido (00000-000)');
                            break;
                        case 'estado':
                            mostrarErroCheckout('estado-error', 'Digite a sigla (ex: SP)');
                            break;
                        default:
                            mostrarErroCheckout(campo + '-error', 'Valor inválido');
                    }
                }
                validarFormularioCheckout();
            });
        }
    });
    
    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value.substring(0, 9);
        });
    }
    
    // Configurar evento do botão finalizar
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar && !btnFinalizar.onclick) {
        btnFinalizar.onclick = function(e) {
            e.preventDefault();
            validarCheckout();
        };
    }
}

// ===================== RENDERIZAÇÃO DO CARRINHO =====================
function renderizarCarrinho() {
    try {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const container = document.getElementById('itens-carrinho');
        const totalElement = document.getElementById('total');
        let total = 0;

        if (carrinho.length === 0) {
            container.innerHTML = '<p style="font-size:20px; color:#aaa; text-align:center; padding:40px;">Seu carrinho está vazio... <br> Volte e escolha algo futurista! 🌌</p>';
            totalElement.textContent = 'Total: R$ 0,00';
        } else {
            container.innerHTML = '';
            carrinho.forEach(item => {
                const subtotal = item.preco * item.quantidade;
                total += subtotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.imagem || 'https://via.placeholder.com/100?text=Produto'}" alt="${item.nome}">
                    <div>
                        <h3>${item.nome}</h3>
                        <p style="color:#aaa; font-size:14px; margin-top:5px;">${item.descricao || ''}</p>
                        <p style="margin-top:10px;">R$ ${item.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})} unid.</p>
                    </div>
                    <div>
                        <button class="quantity-btn" onclick="alterarQuantidade('${item.nome.replace(/'/g, "\\'")}', -1)">−</button>
                        <strong style="margin:0 10px">${item.quantidade}</strong>
                        <button class="quantity-btn" onclick="alterarQuantidade('${item.nome.replace(/'/g, "\\'")}', 1)">+</button>
                    </div>
                    <div>
                        <p style="color:#00ffff; font-size:20px">R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <button class="remove-btn" onclick="removerDoCarrinho('${item.nome.replace(/'/g, "\\'")}')">Remover</button>
                    </div>
                `;
                container.appendChild(itemElement);
            });
        }

        totalElement.textContent = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        
        // Atualizar contador global
        atualizarContador();
        
    } catch (error) {
        console.error('Erro ao renderizar carrinho:', error);
        document.getElementById('itens-carrinho').innerHTML = 
            '<p style="color:#ff5555; text-align:center; padding:40px;">Erro ao carregar carrinho. Por favor, recarregue a página.</p>';
    }
}

// ===================== RENDERIZAÇÃO DO CHECKOUT =====================
function renderizarCheckout() {
    try {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const container = document.getElementById('resumo-itens');
        const totalElement = document.getElementById('total-checkout');
        const btnFinalizar = document.getElementById('btn-finalizar');
        let total = 0;
        
        container.innerHTML = '';
        
        if (carrinho.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center; padding:20px;">Seu carrinho está vazio</p>';
            totalElement.textContent = 'Total: R$ 0,00';
            
            if (btnFinalizar) {
                btnFinalizar.disabled = true;
                btnFinalizar.innerHTML = 'Carrinho Vazio ✦';
                btnFinalizar.style.opacity = '0.5';
                btnFinalizar.style.cursor = 'not-allowed';
            }
        } else {
            carrinho.forEach(item => {
                const subtotal = item.preco * item.quantidade;
                total += subtotal;
                container.innerHTML += `
                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #333;">
                        <p><strong>${item.quantidade}x ${item.nome}</strong></p>
                        <p style="color:#aaa; font-size:14px; margin:5px 0;">${item.descricao || ''}</p>
                        <p style="color:#00ffff; font-weight:bold;">R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                `;
            });
            
            totalElement.textContent = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            
            if (btnFinalizar) {
                btnFinalizar.disabled = false;
                btnFinalizar.innerHTML = 'Pagar Agora ✦';
                btnFinalizar.style.opacity = '1';
                btnFinalizar.style.cursor = 'pointer';
            }
        }
        
        // Atualizar contador
        atualizarContador();
        
        // Inicializar validação do checkout
        inicializarValidacaoCheckout();
        
        // Validar formulário inicialmente
        validarFormularioCheckout();
        
    } catch (error) {
        console.error('Erro ao renderizar checkout:', error);
        document.getElementById('resumo-itens').innerHTML = 
            '<p style="color:#ff5555; text-align:center;">Erro ao carregar checkout</p>';
    }
}

// ===================== INICIALIZAÇÃO =====================
function inicializar() {
    console.log('🚀 Inicializando NewGen Store...');
    
    // 1. Verificar status de login
    verificarLogin();
    
    // 2. Atualizar contador do carrinho
    atualizarContador();
    
    // 3. Configurar botão hamburguer
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.style.display = 'flex';
        menuToggle.onclick = toggleMenu;
    }
    
    // 4. Centralizar botões "Comprar Agora"
    setTimeout(() => {
        const botoesCards = document.querySelectorAll('.card .btn-comprar, .card-promo .btn-comprar');
        botoesCards.forEach(botao => {
            if (botao.closest('.card') || botao.closest('.card-promo')) {
                botao.style.cssText = `
                    display: block !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                    margin-top: 20px !important;
                    margin-bottom: 10px !important;
                    width: 85% !important;
                    max-width: 250px !important;
                    text-align: center !important;
                `;
            }
        });
    }, 100);
    
    // 5. Renderizar carrinho se estiver na página do carrinho
    if (window.location.pathname.includes('carrinho.html') || 
        window.location.href.includes('carrinho.html')) {
        renderizarCarrinho();
    }
    
    // 6. Renderizar checkout se estiver na página do checkout
    if (window.location.pathname.includes('checkout.html') || 
        window.location.href.includes('checkout.html')) {
        renderizarCheckout();
    }
    
    console.log('✅ NewGen Store inicializada com sucesso!');
    console.log('Usuário logado:', usuarioLogado);
    console.log('Itens no carrinho:', carrinho.length);
}

// ===================== EVENT LISTENERS =====================
document.addEventListener('DOMContentLoaded', inicializar);

// Atualizar contador também quando a página carrega completamente
window.addEventListener('load', function() {
    atualizarContador();
    verificarLogin();
});

// ===================== EXPORTAÇÃO DE FUNÇÕES GLOBAIS =====================
window.toggleMenu = toggleMenu;
window.fecharMenu = fecharMenu;
window.adicionarCarrinho = adicionarCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.alterarQuantidade = alterarQuantidade;
window.esvaziarCarrinho = esvaziarCarrinho;
window.finalizarCompra = finalizarCompraCheckout;
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.cadastrar = cadastrar;
window.atualizarContador = atualizarContador;
window.validarCheckout = validarCheckout;
window.mostrarNotificacao = mostrarNotificacao;
window.selecionarPagamento = selecionarPagamento;
window.validarFormularioCheckout = validarFormularioCheckout;
window.finalizarCompraCheckout = finalizarCompraCheckout;
window.renderizarCarrinho = renderizarCarrinho;
window.renderizarCheckout = renderizarCheckout;

// Inicializar imediatamente se já estiver carregado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(inicializar, 1);
}