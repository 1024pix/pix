import * as assessmentRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/assessment-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Evaluation | Integration | Infrastructure | Repository | AssessmentRepository', function () {
  describe('#get', function () {
    let assessmentId;

    context('when the assessment exists', function () {
      beforeEach(async function () {
        assessmentId = databaseBuilder.factory.buildAssessment({ courseId: 'course_A' }).id;
        await databaseBuilder.commit();
      });

      it('should return the assessment', async function () {
        // when
        const assessment = await assessmentRepository.get(assessmentId);

        // then
        expect(assessment).to.be.an.instanceOf(Assessment);
        expect(assessment.id).to.equal(assessmentId);
        expect(assessment.courseId).to.equal('course_A');
      });
    });

    context('when the assessment does not exist', function () {
      it('should return null', async function () {
        // when
        const error = await catchErr(assessmentRepository.get)(245);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#updateLastQuestionDate', function () {
    it('should update lastQuestionDate', async function () {
      // given
      const lastQuestionDate = new Date('2020-01-02');
      const assessment = databaseBuilder.factory.buildAssessment({
        lastQuestionDate: new Date('2020-01-01'),
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-01'),
      });
      const updatedAssessment = domainBuilder.buildAssessment({
        ...assessment,
        lastQuestionDate,
      });
      await databaseBuilder.commit();

      // when
      await assessmentRepository.updateLastQuestionDate(updatedAssessment);

      // then
      const assessmentInDb = await knex('assessments')
        .where('id', assessment.id)
        .first('lastQuestionDate', 'updatedAt', 'createdAt');
      expect(assessmentInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
      expect(assessmentInDb.updatedAt).not.to.deep.equal(assessmentInDb.createdAt);
    });
  });

  describe('#updateWhenNewChallengeIsAsked', function () {
    it('should update lastChallengeId', async function () {
      // given
      const lastChallengeId = 'recLastChallenge';
      const assessment = databaseBuilder.factory.buildAssessment({
        lastChallengeId: 'recPreviousChallenge',
        lastQuestionState: 'focusedout',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-01'),
      });
      const updatedAssessment = domainBuilder.buildAssessment({
        ...assessment,
        lastChallengeId,
      });
      await databaseBuilder.commit();

      // when
      await assessmentRepository.updateWhenNewChallengeIsAsked(updatedAssessment);

      // then
      const assessmentInDb = await knex('assessments').where('id', assessment.id).first();
      expect(assessmentInDb.lastChallengeId).to.deep.equal(lastChallengeId);
      expect(assessmentInDb.lastQuestionState).to.deep.equal(Assessment.statesOfLastQuestion.ASKED);
      expect(assessmentInDb.updatedAt).not.to.deep.equal(assessmentInDb.createdAt);
    });
  });
});
