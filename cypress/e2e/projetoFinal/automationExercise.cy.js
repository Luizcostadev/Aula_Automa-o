/// <reference types="cypress"/>

describe('Busca e Carrinho - Automation Exercise', () => {
    beforeEach(() => {
        cy.visit('https://automationexercise.com/');
    });

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
        cy.contains('u', 'View Cart').click();

        // 5. Validar produto e quantidade na tabela do carrinho
        cy.get('#cart_info_table').should('contain.text', 'Blue Top');
        cy.get('.cart_quantity button').should('have.text', '1');
    });
});