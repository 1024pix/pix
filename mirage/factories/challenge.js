import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  instruction: faker.lorem.sentences(3)
});
