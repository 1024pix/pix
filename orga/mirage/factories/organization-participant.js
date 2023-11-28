import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return 'Jean-prénom';
  },

  lastName() {
    return 'Lenomdefamille';
  },
});
