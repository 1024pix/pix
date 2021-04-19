import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  newPassword: 'newPassword123',
  oneTimePassword: 'oneTimePassword',

  username() {
    return faker.internet.userName();
  },
});
