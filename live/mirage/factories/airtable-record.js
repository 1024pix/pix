import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  id() { return faker.random.uuid() },
  createdTime() { return faker.date.past() }
});
