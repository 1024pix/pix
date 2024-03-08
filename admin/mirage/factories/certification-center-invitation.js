import { association, Factory } from 'miragejs';

export default Factory.extend({
  email() {
    return 'standard-invitation-mail@example.net';
  },

  certificationCenter: association(),
});
