import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  name(i) {
    return `course ${i}`;
  }

});
