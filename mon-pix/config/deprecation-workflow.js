// eslint-disable-next-line no-undef
self.deprecationWorkflow = self.deprecationWorkflow || {};
// eslint-disable-next-line no-undef
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-assign' },
    { handler: 'silence', matchId: 'deprecate-ember-error' },
    { handler: 'silence', matchId: 'ember-data:deprecate-promise-many-array-behaviors' },
    { handler: 'silence', matchId: 'ember-data:deprecate-store-find' },
    { handler: 'silence', matchId: 'ember-data:deprecate-array-like' },
  ],
};
