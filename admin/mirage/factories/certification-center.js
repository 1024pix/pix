import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return `Centre des certifs ${Math.random().toString(36).slice(2, 8)}`;
  },

  type() {
    return 'SUP';
  },
});
