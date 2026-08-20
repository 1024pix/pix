import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return 'Parcours apprenant';
  },
  description() {
    return faker.lorem.sentence();
  },
});
