import { withDefaults } from '@warp-drive/legacy/model/migration-support';

export default withDefaults({
  type: 'activity',
  fields: [{ name: 'level', kind: 'attribute' }],
});
