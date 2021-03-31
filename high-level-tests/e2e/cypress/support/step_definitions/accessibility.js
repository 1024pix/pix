function callback(violations) {
  violations.forEach(violation => {
    const nodes = Cypress.$(violation.nodes.map(node=> node.target).join(','));
    Cypress.log({
      name: `Erreur ${violation.impact} : `,
      consoleProps: () => violation,
      $el: nodes,
      message: `[${violation.help}](${violation.helpUrl})`
    });
    violation.nodes.forEach(({target})=> {
      Cypress.log({
        name: 'Noeuds bloquants : ',
        consoleProps: () => violation,
        $el: Cypress.$(target.join(',')),
        message: target
      });
    });
  });
}

Then('l\'accessibilité de la page est correcte', () => {
  cy.injectAxe();
  cy.checkA11y(
    {
      exclude: ['.challenge-response__proposal']
    },
    {
      rules: {
        'html-lang-valid': { enabled: false },
      },
    },
    callback
  )
});
