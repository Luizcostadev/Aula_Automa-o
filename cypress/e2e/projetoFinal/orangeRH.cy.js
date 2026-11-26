/// <reference types="cypress"/>

// ==========================================================
// OrangeHRM (demo) - https://opensource-demo.orangehrmlive.com/
// Cobre: login (positivo e negativo), campos obrigatórios,
// filtro de usuários (com e sem resultado), busca no menu,
// navegação para o PIM e logout.
// Obs.: o site demo é lento, por isso os timeouts maiores.
// ==========================================================

const URL_LOGIN = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const TIMEOUT = { timeout: 20000 };

function login(usuario, senha) {
    cy.visit(URL_LOGIN);
    cy.get('input[name="username"]', TIMEOUT).type(usuario);
    cy.get('input[name="password"]').type(senha, { log: false });
    cy.get('button[type="submit"]').click();
}

function campoDoFormulario(label) {
    return cy.contains('.oxd-input-group', label, TIMEOUT).find('input');
}

describe('OrangeHRM - Login', () => {
    it('Deve logar como Admin e exibir o Dashboard', () => {
        login('Admin', 'admin123');

        cy.url(TIMEOUT).should('include', '/dashboard/index');
        cy.get('.oxd-topbar-header-breadcrumb', TIMEOUT).should('contain.text', 'Dashboard');
        cy.get('.oxd-userdropdown-name').should('be.visible');
    });

    it('Não deve logar com credenciais inválidas', () => {
        login('Admin', 'senhaErrada123');

        cy.get('.oxd-alert-content-text', TIMEOUT).should('have.text', 'Invalid credentials');
        cy.url().should('include', '/auth/login');
    });

    it('Deve exibir "Required" quando usuário e senha estão vazios', () => {
        cy.visit(URL_LOGIN);
        cy.get('button[type="submit"]', TIMEOUT).click();

        cy.get('.oxd-input-field-error-message')
            .should('have.length', 2)
            .each(($msg) => expect($msg.text()).to.eq('Required'));
    });
});

describe('OrangeHRM - Usuário logado', () => {
    beforeEach(() => {
        login('Admin', 'admin123');
        cy.get('.oxd-topbar-header-breadcrumb', TIMEOUT).should('contain.text', 'Dashboard');
    });

    it('Deve navegar até Admin e filtrar um usuário existente', () => {
        cy.contains('.oxd-main-menu-item', 'Admin').click();
        cy.url().should('include', '/admin/viewSystemUsers');

        campoDoFormulario('Username').type('Admin');
        cy.get('button[type="submit"]').click();

        cy.contains('.oxd-text', 'Record Found', TIMEOUT).should('be.visible');
        cy.get('.oxd-table-body .oxd-table-card').should('have.length.at.least', 1);
        cy.get('.oxd-table-body').should('contain.text', 'Admin');
    });

    it('Deve informar "No Records Found" ao filtrar um usuário inexistente', () => {
        cy.contains('.oxd-main-menu-item', 'Admin').click();

        campoDoFormulario('Username').type('usuario_que_nao_existe_123');
        cy.get('button[type="submit"]').click();

        cy.get('.oxd-toast', TIMEOUT).should('contain.text', 'No Records Found');
        cy.get('.oxd-table-body .oxd-table-card').should('not.exist');
    });

    it('Deve filtrar o menu lateral pela busca', () => {
        cy.get('.oxd-main-menu-search input').type('PIM');

        cy.get('.oxd-main-menu-item').should('have.length', 1).and('contain.text', 'PIM');

        cy.get('.oxd-main-menu-search input').clear();
        cy.get('.oxd-main-menu-item').should('have.length.greaterThan', 1);
    });

    it('Deve acessar o PIM e exibir a lista de funcionários', () => {
        cy.contains('.oxd-main-menu-item', 'PIM').click();

        cy.url().should('include', '/pim/viewEmployeeList');
        cy.get('.oxd-topbar-header-breadcrumb').should('contain.text', 'PIM');
        cy.contains('h5', 'Employee Information').should('be.visible');
        cy.get('.oxd-table-body .oxd-table-card', TIMEOUT).should('have.length.at.least', 1);
    });

    it('Deve fazer logout pelo menu do usuário', () => {
        // O próprio OrangeHRM dispara um erro de JS (requisição cancelada) ao sair.
        // Ignoramos só esse erro conhecido, neste teste.
        cy.on('uncaught:exception', (err) => !err.message.includes("reading 'response'"));

        cy.get('.oxd-userdropdown-tab').click();
        cy.contains('.oxd-userdropdown-link', 'Logout').click();

        cy.url(TIMEOUT).should('include', '/auth/login');
        cy.get('input[name="username"]').should('be.visible');
    });
});
