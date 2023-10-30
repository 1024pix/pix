import { Factory } from 'miragejs';

export default Factory.extend({
  firstName: 'Link',
  lastName: '563',
  organizationId: 563,
  division: 'CM2',
  completedMissionIds() {
    return ['testest'];
  },
});
