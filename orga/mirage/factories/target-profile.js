import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  name() {
    return faker.lorem.sentence();
  },
});
