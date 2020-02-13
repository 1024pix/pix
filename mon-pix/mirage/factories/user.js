import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },
  lastName() {
    return faker.name.lastName();
  },
  cgu() {
    return false;
  },
  withEmail: trait({
    email: faker.internet.email(),
    password: faker.internet.password(),
  }),
  withUsername: trait({
    username: faker.internet.email(),
    password: faker.internet.password(),
  }),
  external: trait({
    email: null,
    username: null,
    password: faker.internet.password(),
  }),
  hasNotValidatedCgu: trait({
    cgu: false,
  }),
  withRecaptchaToken: trait({
    recaptchaToken: faker.random.uuid(),
  }),
});
