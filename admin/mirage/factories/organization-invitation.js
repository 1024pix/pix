import { association, Factory } from 'miragejs';

export default Factory.extend({
  email() {
    return 'a-fake-address@example.net';
  },

  organization: association(),
});
