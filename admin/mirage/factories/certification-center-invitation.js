import { Factory, association } from 'miragejs';

export default Factory.extend({
  email() {
    return 'standard-invitation-mail@example.net';
  },

  certificationCenter: association(),
});
