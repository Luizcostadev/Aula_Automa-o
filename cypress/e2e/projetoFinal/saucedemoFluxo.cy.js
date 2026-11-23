/// <reference types="cypress"/>

describe('Fluxo de Compra Completo - Sauce Demo', () => {
    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('[data-test="username"]').type('standard_user');
        cy.get('[data-test="password"]').type('secret_sauce');
        cy.get('[data-test="login-button"]').click();
    });

    it('Deve selecionar um produto e finalizar a compra com sucesso', () => {
        // 1. Adicionar produto ao carrinho
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('.shopping_cart_badge').should('have.text', '1');

        // 2. Carrinho e iniciar checkout
        cy.get('.shopping_cart_link').click();
        cy.get('[data-test="checkout"]').click();

        // 3. Preencher dados 
        cy.get('[data-test="firstName"]').type('João');
        cy.get('[data-test="lastName"]').type('Silva');
        cy.get('[data-test="postalCode"]').type('58000000');
        cy.get('[data-test="continue"]').click();

        // 4. Confirmar resumo finaliza pedido
        cy.get('.summary_total_label').should('be.visible');
        cy.get('[data-test="finish"]').click();

        // 5. Validar mensagem final
        cy.get('.complete-header').should('have.text', 'Thank you for your order!');
    });
});