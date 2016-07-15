import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name(i) { return `Test #${i +1}`; },
  description: faker.lorem.paragraph(),
  duration: faker.random.number()
});
