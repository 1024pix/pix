import { withDefaults } from '@warp-drive/legacy/model/migration-support';

export default withDefaults({
  type: 'challenge',
  fields: [
    { name: 'embedUrl', kind: 'attribute' },
    { name: 'autoReply', type: 'boolean', kind: 'attribute' },
    { name: 'embedTitle', kind: 'attribute' },
    { name: 'embedHeight', kind: 'attribute' },
    { name: 'format', kind: 'attribute' },
    { name: 'illustrationAlt', kind: 'attribute', options: { defaultValue: '' } },
    { name: 'illustrationUrl', kind: 'attribute' },
    { name: 'proposals', kind: 'attribute' },
    { name: 'type', kind: 'attribute' },
    { name: 'timer ', type: 'number', kind: 'attribute' },
    { name: 'focused', type: 'boolean', kind: 'attribute' },
    { name: 'shuffled', type: 'boolean', kind: 'attribute' },
    { name: 'webComponentProps', kind: 'attribute' },
    { name: 'webComponentTagName', kind: 'attribute' },
    { name: 'hasEmbedInternalValidation ', type: 'boolean', kind: 'attribute' },
    { name: 'noValidationNeeded', type: 'boolean', kind: 'attribute' },
    {
      name: 'instructions',
      kind: 'attribute',
      type: 'array',
      options: {
        defaultValue: () => [],
      },
    },
    {
      name: 'activityAnswer',
      type: 'activity-answer',
      kind: 'hasMany',
      options: { inverse: 'challenge', async: true },
    },
    // derivations for every get
    {
      name: 'hasEmbed',
      kind: 'derived',
      type: 'hasEmbed',
    },
    {
      name: 'isEmbedGDevelop',
      kind: 'derived',
      type: 'isEmbedGDevelop',
    },
    {
      name: 'hasWebComponent',
      kind: 'derived',
      type: 'hasWebComponent',
    },
    {
      name: 'isQROC',
      kind: 'derived',
      type: 'isQROC',
    },
    {
      name: 'isQROCM',
      kind: 'derived',
      type: 'isQROCM',
    },
    {
      name: 'isQCU',
      kind: 'derived',
      type: 'isQCU',
    },
    {
      name: 'isQCM',
      kind: 'derived',
      type: 'isQCM',
    },
    {
      name: 'hasForm',
      kind: 'derived',
      type: 'hasForm',
    },
    { name: 'hasType', kind: 'derived', type: 'hasType' },
    { name: 'hasMedia', kind: 'derived', type: 'hasMedia' },
  ],
});
