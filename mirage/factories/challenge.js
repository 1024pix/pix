import { Factory, faker } from 'ember-cli-mirage';
import _ from 'lodash/lodash';

export default Factory.extend({
  instruction: faker.lorem.sentences(3),
  number: faker.list.cycle.apply(this, _.range(1, 10)),

  afterCreate(challenge, server) {
    const db = server.db;
    let assessment;

    if (db.assessments.length === 0) {
      assessment = server.create('assessment');
    } else {
      assessment = db.assessments[0];
    }

    db.challenges.update(challenge.id, {
      assessmentId: assessment.id
    });
  }
});
