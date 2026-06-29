import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return 'Parcours';
  },
  description() {
    return faker.lorem.sentence();
  },
});
