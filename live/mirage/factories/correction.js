import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  solution() {
    return '2';
  },
  hint(i) {
    return `Hint number ${i}`;
  }
});
