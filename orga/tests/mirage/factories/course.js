import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return faker.lorem.word();
  },
  description() {
    return faker.lorem.sentence();
  },
  id() {
    return `${this.type}-${this.sourceId}`;
  },
  sourceId() {
    return faker.string.numeric({ length: 5, allowLeadingZeros: false });
  },
  type() {
    return 'targetProfile';
  },
});
