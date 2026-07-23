import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      handler: 'silence',
      matchId: 'warp-drive:deprecate-legacy-request-methods',
    },
  ],
});
