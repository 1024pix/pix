// eslint-disable-next-line no-undef
window.deprecationWorkflow = self.deprecationWorkflow || {};
// eslint-disable-next-line no-undef
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-data:deprecate-early-static' },
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-assign' },
  ],
};
