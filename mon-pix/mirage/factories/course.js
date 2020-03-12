import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';
import demoData from '../data/demo';

export default Factory.extend({

  id(i) {
    return `rec_${i}`;
  },

  name() {
    return faker.lorem.word();
  },

  description() {
    return faker.lorem.paragraph();
  },

  withChallenges: trait({
    afterCreate(course, server) {
      demoData.demoChallengeIds.forEach((challengeId) => {
        server.create('challenge', {
          id: challengeId,
          type: 'QROC',
          instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
          proposals: 'Ecris ce que tu veux !',
        });
      });
      course.update({ nbChallenges: demoData.demoChallengeIds.length });
    }
  }),

});
