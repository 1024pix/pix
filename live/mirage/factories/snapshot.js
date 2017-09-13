import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  score : faker.random.number(),

  creationDate : faker.date.recent(),

  completionPercentage : () => {
    return faker.list.random(12, 25, 37, 50, 62, 75)();
  }

});
