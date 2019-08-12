import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  score : faker.random.number(),

  creationDate : faker.date.recent(),

  testsFinished : () => {
    return faker.random.arrayElement([2, 3, 4, 8, 10, 12]);
  }

});
