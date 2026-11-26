/// <reference types="cypress"/>

// ==========================================================
// Sauce Demo - https://www.saucedemo.com/
// Cobre: login (positivo e negativo), carrinho, ordenação,
// checkout completo, validação do checkout e logout.
// ==========================================================

const usuarios = {
    padrao: 'standard_user',
    bloqueado: 'locked_out_user',
    senha: 'secret_sauce',
};

function login(usuario, senha) {
    cy.visit('/');
    if (usuario) cy.get('[data-test="username"]').type(usuario);
    if (senha) cy.get('[data-test="password"]').type(senha, { log: false });
    cy.get('[data-test="login-button"]').click();
}

describe('Sauce Demo - Login', () => {
    it('Deve logar com usuário válido e exibir a lista de produtos', () => {
        login(usuarios.padrao, usuarios.senha);

        cy.url().should('include', '/inventory.html');
        cy.get('[data-test="title"]').should('have.text', 'Products');
        cy.get('[data-test="inventory-item"]').should('have.length', 6);
    });

    it('Não deve logar com senha incorreta', () => {
        login(usuarios.padrao, 'senha_errada');

        cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain.text', 'Username and password do not match any user in this service');
        cy.url().should('not.include', '/inventory.html');
    });

    it('Não deve logar com usuário bloqueado', () => {
        login(usuarios.bloqueado, usuarios.senha);

        cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain.text', 'Sorry, this user has been locked out.');
    });

    it('Deve exigir usuário quando os campos estão vazios', () => {
        login();

        cy.get('[data-test="error"]').should('contain.text', 'Username is required');
        cy.get('[data-test="username"]').should('have.class', 'input_error');
        cy.get('[data-test="password"]').should('have.class', 'input_error');
    });
});

describe('Sauce Demo - Usuário logado', () => {
    beforeEach(() => {
        login(usuarios.padrao, usuarios.senha);
        cy.url().should('include', '/inventory.html');
    });

    it('Deve selecionar um produto e finalizar a compra com sucesso', () => {
        // 1. Adicionar produto ao carrinho
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="shopping-cart-badge"]').should('have.text', '1');

        // 2. Ir ao carrinho, conferir o item e iniciar o checkout
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="inventory-item-name"]').should('have.text', 'Sauce Labs Backpack');
        cy.get('[data-test="checkout"]').click();

        // 3. Preencher dados
        cy.get('[data-test="firstName"]').type('João');
        cy.get('[data-test="lastName"]').type('Silva');
        cy.get('[data-test="postalCode"]').type('58000000');
        cy.get('[data-test="continue"]').click();

        // 4. Conferir resumo (item + total) e finalizar pedido
        cy.url().should('include', '/checkout-step-two.html');
        cy.get('[data-test="inventory-item-name"]').should('have.text', 'Sauce Labs Backpack');
        cy.get('[data-test="total-label"]').should('be.visible').and('contain.text', '$');
        cy.get('[data-test="finish"]').click();

        // 5. Validar mensagem final e carrinho vazio
        cy.get('[data-test="complete-header"]').should('have.text', 'Thank you for your order!');
        cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
    });

    it('Deve adicionar e remover produtos do carrinho atualizando o contador', () => {
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
        cy.get('[data-test="shopping-cart-badge"]').should('have.text', '2');

        // O botão troca para "Remove" depois de adicionar
        cy.get('[data-test="remove-sauce-labs-backpack"]').should('be.visible').click();
        cy.get('[data-test="shopping-cart-badge"]').should('have.text', '1');

        // Remove o último item direto pelo carrinho
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="inventory-item"]').should('have.length', 1);
        cy.get('[data-test="remove-sauce-labs-bike-light"]').click();
        cy.get('[data-test="inventory-item"]').should('not.exist');
        cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
    });

    it('Deve ordenar os produtos por preço do menor para o maior', () => {
        cy.get('[data-test="product-sort-container"]').select('lohi');

        cy.get('[data-test="inventory-item-price"]').then(($precos) => {
            const valores = [...$precos].map((el) => Number(el.innerText.replace('$', '')));
            const ordenados = [...valores].sort((a, b) => a - b);
            expect(valores).to.deep.equal(ordenados);
        });
    });

    it('Deve ordenar os produtos por nome de Z a A', () => {
        cy.get('[data-test="product-sort-container"]').select('za');

        cy.get('[data-test="inventory-item-name"]').then(($nomes) => {
            const nomes = [...$nomes].map((el) => el.innerText);
            const ordenados = [...nomes].sort().reverse();
            expect(nomes).to.deep.equal(ordenados);
        });
    });

    it('Não deve continuar o checkout sem preencher o primeiro nome', () => {
        cy.get('[data-test="add-to-cart-sauce-labs-onesie"]').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="checkout"]').click();

        cy.get('[data-test="lastName"]').type('Silva');
        cy.get('[data-test="postalCode"]').type('58000000');
        cy.get('[data-test="continue"]').click();

        cy.get('[data-test="error"]').should('contain.text', 'Error: First Name is required');
        cy.url().should('include', '/checkout-step-one.html');
    });

    it('Deve fazer logout e bloquear o acesso direto ao inventário', () => {
        cy.get('#react-burger-menu-btn').click();
        cy.get('[data-test="logout-sidebar-link"]').should('be.visible').click();

        cy.get('[data-test="login-button"]').should('be.visible');

        // Tentando acessar a página interna sem sessão
        cy.visit('/inventory.html', { failOnStatusCode: false });
        cy.get('[data-test="error"]').should('contain.text', "You can only access '/inventory.html' when you are logged in.");
    });
});
