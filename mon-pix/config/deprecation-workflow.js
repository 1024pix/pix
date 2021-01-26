/* global self:readonly */

self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: '@fortawesome/ember-fontawesome.no-positional-params' },
    { handler: 'silence', matchId: 'ember-click-outside.action-prop' },
    { handler: 'silence', matchId: 'computed-property.override' },
  ],
  throwOnUnhandled: true,
};
