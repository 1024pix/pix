import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },
  lastName() {
    return faker.name.lastName();
  },
  email() {
    return faker.internet.email();
  },
  password() {
    return faker.internet.password();
  },
  cgu() {
    return faker.random.boolean();
  },
  totalPixScore() {
    return faker.random.number();
  },
  recaptchaToken() {
    return faker.random.uuid();
  }
});
