import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  canCollectProfiles() {
    return false;
  },
  isManagingStudents() {
    return false;
  },
});
