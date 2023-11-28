import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return 'Michel';
  },
  lastName() {
    return 'Chefchef';
  },
  email() {
    return 'chef-michou@example.net';
  },
  lang() {
    return 'FR';
  },
});
