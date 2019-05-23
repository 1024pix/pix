const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const Assessment = require('../../../../lib/domain/models/Assessment');
const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | Competence Evaluation', () => {

  const status = 'initialized';
  describe('#save', () => {

    afterEach(() => {
      return knex('competence-evaluations').delete();
    });

    it('should return the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: 12,
        competenceId: 'recABCD1234',
        status,
        userId: 1,
      });

      // when
      const promise = competenceEvaluationRepository.save(competenceEvaluationToSave);

      // then
      return promise.then((savedCompetenceEvaluation) => {
        expect(savedCompetenceEvaluation).to.be.instanceof(CompetenceEvaluation);
        expect(savedCompetenceEvaluation.id).to.exist;
        expect(savedCompetenceEvaluation.createdAt).to.exist;
        expect(savedCompetenceEvaluation.status).to.equal(status);
        expect(savedCompetenceEvaluation.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
        expect(savedCompetenceEvaluation.competenceId).to.equal(competenceEvaluationToSave.competenceId);
        expect(savedCompetenceEvaluation.userId).to.equal(competenceEvaluationToSave.userId);
      });
    });

    it('should save the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: 12,
        competenceId: 'recABCD1234',
        status,
        userId: 1,
      });

      // when
      const promise = competenceEvaluationRepository.save(competenceEvaluationToSave);

      // then
      return promise.then((savedCompetenceEvaluation) => {
        return knex.select('id', 'assessmentId', 'competenceId', 'userId', 'status')
          .from('competence-evaluations')
          .where({ id: savedCompetenceEvaluation.id })
          .then(([competenceEvaluationInDb]) => {
            expect(competenceEvaluationInDb.id).to.equal(savedCompetenceEvaluation.id);
            expect(competenceEvaluationInDb.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
            expect(competenceEvaluationInDb.competenceId).to.equal(competenceEvaluationToSave.competenceId);
            expect(competenceEvaluationInDb.userId).to.equal(competenceEvaluationToSave.userId);
            expect(competenceEvaluationInDb.status).to.equal('initialized');
          });
      });
    });

  });

  describe('#getByAssessmentId', () => {
    let user;
    let assessmentForExpectedCompetenceEvaluation;
    let assessmentNotExpected;
    let competenceEvaluationExpected;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});

      assessmentForExpectedCompetenceEvaluation = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });
      assessmentNotExpected = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });
      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        assessmentId: assessmentForExpectedCompetenceEvaluation.id,
        status,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        assessmentId: assessmentNotExpected.id,
        status,
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the competence evaluation linked to the assessment', () => {
      // when
      const promise = competenceEvaluationRepository.getByAssessmentId(assessmentForExpectedCompetenceEvaluation.id);

      // then
      return promise.then((competenceEvaluation) => {
        expect(_.omit(competenceEvaluation, ['assessment', 'scorecard'])).to.deep.equal(_.omit(competenceEvaluationExpected, ['assessment']));
        expect(competenceEvaluation.assessment.id).to.deep.equal(assessmentForExpectedCompetenceEvaluation.id);
      });
    });

    it('should return an error when there is no competence evaluation', () => {
      // when
      const promise = catchErr(competenceEvaluationRepository.getByAssessmentId)('fakeId');

      // then
      return promise.then((error) => {
        expect(error).to.be.instanceof(NotFoundError);
      });
    });

  });

  describe('#getLastByCompetenceIdAndUserId', () => {
    let user;
    let competenceEvaluationExpected, assessmentExpected;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});

      assessmentExpected = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '1',
        assessmentId: assessmentExpected.id,
        status,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '2',
        status,
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the competence evaluation linked to the competence id', () => {
      // when
      const promise = competenceEvaluationRepository.getLastByCompetenceIdAndUserId(1, user.id);

      // then
      return promise.then((competenceEvaluation) => {
        expect(_.omit(competenceEvaluation, ['assessment', 'scorecard'])).to.deep.equal(_.omit(competenceEvaluationExpected, ['assessment']));
        expect(competenceEvaluation.assessment.id).to.deep.equal(assessmentExpected.id);

      });
    });

    it('should return an error when there is no competence evaluation', () => {
      // when
      const promise = catchErr(competenceEvaluationRepository.getLastByCompetenceIdAndUserId)('fakeId', user.id);

      // then
      return promise.then((error) => {
        expect(error).to.be.instanceof(NotFoundError);
      });
    });

  });

  describe('#findByUserId', () => {
    let user;
    let competenceEvaluationExpected, assessmentExpected;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});
      const otherUser = databaseBuilder.factory.buildUser({});

      assessmentExpected = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '1',
        assessmentId: assessmentExpected.id,
        createdAt: new Date('2018-01-01'),
        status,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '2',
        createdAt: new Date('2017-01-01'),
        status,
      });

      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: otherUser.id,
        competenceId: '2',
        status,
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the competence evaluation linked to the competence id', () => {
      // when
      const promise = competenceEvaluationRepository.findByUserId(user.id);

      // then
      return promise.then((competenceEvaluation) => {
        expect(competenceEvaluation).to.have.length(2);
        expect(_.omit(competenceEvaluation[0], ['assessment', 'scorecard'])).to.deep.equal(_.omit(competenceEvaluationExpected, ['assessment']));
        expect(competenceEvaluation[0].assessment.id).to.deep.equal(assessmentExpected.id);
      });
    });
  });

});
