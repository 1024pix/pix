import { Factory } from 'miragejs';

export default Factory.extend({
  solution() {
    return 'a word';
  },

  hint() {
    return 'an other word';
  },
});
