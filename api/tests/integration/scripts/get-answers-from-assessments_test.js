import { expect } from 'chai';

import { knex } from '../../../db/knex-database-connection.js';
import { GetAnswersFromAssessments } from '../../../scripts/prod/get-answers-from-assessments.js';
import { databaseBuilder } from '../../tooling/databases.js';

describe('GetAnswersFromAssessments', function () {
  it('gets answers from a list of assessments', async function () {
    const todayDate = new Date();
    const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

    const validAssessment = databaseBuilder.factory.buildAssessment({
      updatedAt: oneYearAgo,
      state: 'completed',
      type: 'CAMPAIGN',
    });
    databaseBuilder.factory.buildAnswer({ assessmentId: validAssessment.id });

    const olderAssessment = databaseBuilder.factory.buildAssessment({
      updatedAt: new Date('2020-01-01'),
      state: 'completed',
      type: 'CAMPAIGN',
    });
    databaseBuilder.factory.buildAnswer({
      assessmentId: olderAssessment.id,
    });

    const certificationAssessment = databaseBuilder.factory.buildAssessment({
      updatedAt: oneYearAgo,
      state: 'completed',
      type: 'CERTIFICATION',
    });
    databaseBuilder.factory.buildAnswer({
      assessmentId: certificationAssessment.id,
    });

    await databaseBuilder.commit();

    const script = new GetAnswersFromAssessments();
    await script.handle();

    const remainingAnswers = await knex('answers');
    expect(remainingAnswers.length).to.equal(2);
  });
});
