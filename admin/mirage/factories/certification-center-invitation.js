import { Factory, association } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  email() {
    return faker.internet.exampleEmail();
  },

  certificationCenter: association(),
});
