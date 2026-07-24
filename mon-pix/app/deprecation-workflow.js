import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      handler: 'silence',
      matchId: 'ember-data:deprecate-store-extends-ember-object',
    },
    {
      handler: 'silence',
      matchId: 'warp-drive:deprecate-legacy-request-methods',
    },
    {
      handler: 'silence',
      matchId: 'deprecate-import--is-destroying-from-ember',
    },
    {
      handler: 'silence',
      matchId: 'deprecate-import--is-destroyed-from-ember',
    },
    {
      handler: 'silence',
      matchId: 'deprecate-import-destroy-from-ember',
    },
    {
      handler: 'silence',
      matchId: 'deprecate-import--register-destructor-from-ember',
    },
    {
      handler: 'silence',
      matchId: 'importing-inject-from-ember-service',
    },
    {
      handler: 'silence',
      matchId: 'deprecate-import-testing-from-ember',
    },
  ],
});
