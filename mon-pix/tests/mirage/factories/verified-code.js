import { Factory } from 'miragejs';

export default Factory.extend({
  id(i) {
    return `${i}`;
  },

  type() {
    return 'campaign';
  },
});
