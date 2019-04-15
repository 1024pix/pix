import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  daysBeforeNewAttempt() {
    return 7;
  },
});
