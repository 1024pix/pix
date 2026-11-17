import { Factory } from 'miragejs';

export default Factory.extend({
  id(i) {
    return `rec_${i}`;
  },

  name() {
    return 'Long cours';
  },

  description() {
    return 'Une description de cours assez longue';
  },
});
