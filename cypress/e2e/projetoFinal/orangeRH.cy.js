/// <reference types="cypress"/>

describe('Gestão de Usuários - OrangeHRM', () => {
    beforeEach(() => {
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        cy.get('input[name="username"]').type('Admin');
        cy.get('input[name="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
    });

    it('Deve navegar até Admin e filtrar um usuário existente', () => {
        // 1. Validar que entrou no Dashboard
        cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'Dashboard');

        // 2. Acessar o menu lateral "Admin"
        cy.contains('.oxd-main-menu-item', 'Admin').click();
        cy.url().should('include', '/admin/viewSystemUsers');

        // 3. Pesquisar pelo "Admin" no filtro
        cy.get('.oxd-form .oxd-input').type('Admin');
        cy.get('button[type="submit"]').click();

        // 4. Validar que a tabela
        cy.get('.oxd-table-body').should('contain.text', 'Admin');
    });
});