import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  isManagingStudents() {
    return false;
  },
  showSkills() {
    return false;
  },
});
