import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title(i) { return `Assessments #${i}`; },
  description: 'Lorem ipsum dolor sit amet.'
});
