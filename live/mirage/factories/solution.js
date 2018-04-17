import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  value(i) {
    return `Solution number ${i}`;
  }
});
