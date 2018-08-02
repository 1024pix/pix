import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  score : faker.random.number(),

  creationDate : faker.date.recent(),

  testsFinished : () => {
    return faker.list.random(2, 3, 4, 8, 10, 12)();
  }

});
