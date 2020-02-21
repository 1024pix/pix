import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  type() {
    return 'QROC';
  },

  instruction() {
    return 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?';
  },

  proposals() {
    return 'Rue de : ${Rue#}';
  },

  timed: trait({
    timer: faker.random.number(),
  }),

  withAttachment: trait({
    attachments: [faker.internet.url()],
  }),

});
