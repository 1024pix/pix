import { Factory } from 'miragejs';

export default Factory.extend({
  isManagingStudents() {
    return false;
  },
  showSkills() {
    return false;
  },
});
