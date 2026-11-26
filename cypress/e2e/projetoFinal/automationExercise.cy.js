/// <reference types="cypress"/>

// ==========================================================
// Automation Exercise - https://automationexercise.com/
// Cobre: busca (com e sem resultado), detalhes do produto,
// carrinho (adicionar, quantidade, remover), login inválido,
// newsletter e filtro por categoria.
// ==========================================================

// O site carrega muitos anúncios do Google que geram erros de JS
// e pop-ups (#google_vignette). Bloqueamos para o teste não quebrar.
function bloquearAnuncios() {
    const dominios = [
        '**/pagead2.googlesyndication.com/**',
        '**/googleads.g.doubleclick.net/**',
        '**/*.doubleclick.net/**',
        '**/fundingchoicesmessages.google.com/**',
        '**/adservice.google.com/**',
    ];
    dominios.forEach((url) => cy.intercept(url, { statusCode: 204, body: '' }));
}

Cypress.on('uncaught:exception', () => false);

describe('Automation Exercise', () => {
    beforeEach(() => {
        bloquearAnuncios();
        cy.visit('https://automationexercise.com/');
        cy.get('.logo img').should('be.visible');
    });

    context('Busca e Produtos', () => {
        it('Deve buscar um produto, adicionar ao carrinho e validar no resumo', () => {
            // 1. Acessar a aba de produtos
            cy.contains('a', 'Products').click();
            cy.url().should('include', '/products');

            // 2. Pesquisar um item específico
            cy.get('#search_product').type('Blue Top');
            cy.get('#submit_search').click();
            cy.contains('Searched Products').should('be.visible');

            // 3. Adicionar o primeiro resultado ao carrinho
            cy.get('.productinfo a.add-to-cart').first().click();

            // 4. Clicar em "View Cart" dentro do modal de confirmação
            cy.get('#cartModal').should('be.visible');
            cy.contains('u', 'View Cart').click();

            // 5. Validar produto e quantidade na tabela do carrinho
            cy.get('#cart_info_table').should('contain.text', 'Blue Top');
            cy.get('.cart_quantity button').should('have.text', '1');
        });

        it('Não deve retornar produtos ao buscar um item inexistente', () => {
            cy.visit('https://automationexercise.com/products?search=produtoInexistente123');

            cy.contains('Searched Products').should('be.visible');
            cy.get('.features_items .product-image-wrapper').should('not.exist');
        });

        it('Deve exibir os detalhes completos do produto', () => {
            cy.contains('a', 'Products').click();
            cy.get('.choose a[href="/product_details/1"]').click();

            cy.url().should('include', '/product_details/1');
            cy.get('.product-information h2').should('have.text', 'Blue Top');
            cy.get('.product-information').within(() => {
                cy.contains('Category:').should('be.visible');
                cy.contains('Rs.').should('be.visible');
                cy.contains('Availability:').should('be.visible');
                cy.contains('Condition:').should('be.visible');
                cy.contains('Brand:').should('be.visible');
            });
        });

        it('Deve filtrar produtos pela categoria Women > Dress', () => {
            cy.get('a[href="#Women"]').click();
            cy.get('#Women').should('be.visible').contains('a', 'Dress').click();

            cy.url().should('include', '/category_products/1');
            cy.get('.features_items .title').should('contain.text', 'Women - Dress Products');
            cy.get('.features_items .product-image-wrapper').should('have.length.at.least', 1);
        });
    });

    context('Carrinho', () => {
        it('Deve adicionar um produto com quantidade 4 pela página de detalhes', () => {
            cy.visit('https://automationexercise.com/product_details/2');

            cy.get('#quantity').clear().type('4');
            cy.contains('button', 'Add to cart').click();
            cy.get('#cartModal').should('be.visible');
            cy.contains('u', 'View Cart').click();

            cy.get('#cart_info_table tbody tr').should('have.length', 1);
            cy.get('.cart_quantity button').should('have.text', '4');
        });

        it('Deve remover o produto do carrinho e exibir carrinho vazio', () => {
            // O mesmo produto aparece em "Features Items" e "Recommended", por isso o .first()
            cy.get('.features_items .productinfo a.add-to-cart[data-product-id="1"]').first().click();
            cy.get('#cartModal').should('be.visible');
            cy.contains('u', 'View Cart').click();
            cy.get('#cart_info_table tbody tr').should('have.length', 1);

            cy.get('.cart_quantity_delete').click();

            cy.get('#empty_cart').should('be.visible').and('contain.text', 'Cart is empty!');
        });
    });

    context('Conta e Newsletter', () => {
        it('Não deve logar com e-mail e senha incorretos', () => {
            cy.contains('a', 'Signup / Login').click();
            cy.contains('h2', 'Login to your account').should('be.visible');

            cy.get('[data-qa="login-email"]').type('naoexiste_qa_teste@exemplo.com');
            cy.get('[data-qa="login-password"]').type('senhaErrada123', { log: false });
            cy.get('[data-qa="login-button"]').click();

            cy.contains('p', 'Your email or password is incorrect!').should('be.visible');
        });

        it('Deve assinar a newsletter pelo rodapé', () => {
            cy.get('#footer').scrollIntoView();
            cy.contains('h2', 'Subscription').should('be.visible');

            cy.get('#susbscribe_email').type(`qa_${Date.now()}@exemplo.com`);
            cy.get('#subscribe').click();

            cy.get('#success-subscribe')
                .should('be.visible')
                .and('contain.text', 'You have been successfully subscribed!');
        });
    });
});
