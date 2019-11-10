const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const Assessment = require('../../../../lib/domain/models/Assessment');
const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | Competence Evaluation', () => {

  const STARTED = 'started';
  describe('#save', () => {
    let assessment;
    beforeEach(async () => {
      assessment = databaseBuilder.factory.buildAssessment({});
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('competence-evaluations').delete();
    });

    it('should return the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: assessment.id,
        competenceId: 'recABCD1234',
        status: STARTED,
        userId: assessment.userId,
      });

      // when
      const promise = competenceEvaluationRepository.save(competenceEvaluationToSave);

      // then
      return promise.then((savedCompetenceEvaluation) => {
        expect(savedCompetenceEvaluation).to.be.instanceof(CompetenceEvaluation);
        expect(savedCompetenceEvaluation.id).to.exist;
        expect(savedCompetenceEvaluation.createdAt).to.exist;
        expect(savedCompetenceEvaluation.status).to.equal(STARTED);
        expect(savedCompetenceEvaluation.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
        expect(savedCompetenceEvaluation.competenceId).to.equal(competenceEvaluationToSave.competenceId);
        expect(savedCompetenceEvaluation.userId).to.equal(competenceEvaluationToSave.userId);
      });
    });

    it('should save the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: assessment.id,
        competenceId: 'recABCD1234',
        status: STARTED,
        userId: assessment.userId,
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
            expect(competenceEvaluationInDb.status).to.equal('started');
          });
      });
    });

  });

  describe('#getByAssessmentId', () => {
    let assessmentForExpectedCompetenceEvaluation, assessmentNotExpected;
    let competenceEvaluationExpected;

    beforeEach(async () => {
      // given
      assessmentForExpectedCompetenceEvaluation = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
      });
      assessmentNotExpected = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
      });
      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        userId: assessmentForExpectedCompetenceEvaluation.userId,
        assessmentId: assessmentForExpectedCompetenceEvaluation.id,
        status: STARTED,
      });

      await databaseBuilder.commit();
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
      const promise = catchErr(competenceEvaluationRepository.getByAssessmentId)(assessmentNotExpected.id);

      // then
      return promise.then((error) => {
        expect(error).to.be.instanceof(NotFoundError);
      });
    });

  });

  describe('#getByCompetenceIdAndUserId', () => {
    let user;
    let competenceEvaluationExpected, assessmentExpected;

    beforeEach(async () => {
      // given
      user = databaseBuilder.factory.buildUser({});

      assessmentExpected = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '1',
        assessmentId: assessmentExpected.id,
        status: STARTED,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '2',
        status: STARTED,
      });

      await databaseBuilder.commit();
    });

    it('should return the competence evaluation linked to the competence id', () => {
      // when
      const promise = competenceEvaluationRepository.getByCompetenceIdAndUserId({ competenceId: 1, userId: user.id });

      // then
      return promise.then((competenceEvaluation) => {
        expect(_.omit(competenceEvaluation, ['assessment', 'scorecard'])).to.deep.equal(_.omit(competenceEvaluationExpected, ['assessment']));
        expect(competenceEvaluation.assessment.id).to.deep.equal(assessmentExpected.id);

      });
    });

    it('should return an error when there is no competence evaluation', () => {
      // when
      const promise = catchErr(competenceEvaluationRepository.getByCompetenceIdAndUserId)({ competenceId: 'fakeId', userId: user.id });

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
      // given
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
        status: STARTED,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '2',
        createdAt: new Date('2017-01-01'),
        status: STARTED,
      });

      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: otherUser.id,
        competenceId: '2',
        status: STARTED,
      });

      await databaseBuilder.commit();
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

  describe('#updateStatusByAssessmentId', () => {
    let assessment;

    beforeEach(async () => {
      // given
      assessment = databaseBuilder.factory.buildAssessment({});
      databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId: assessment.id, status: 'current_status' });
      await databaseBuilder.commit();
    });

    it('should update the competence status', async () => {
      // when
      const updatedCompetenceEvaluation = await competenceEvaluationRepository.updateStatusByAssessmentId({ assessmentId: assessment.id, status: 'new_status' });

      // then
      expect(updatedCompetenceEvaluation).to.be.instanceOf(CompetenceEvaluation);
      expect(updatedCompetenceEvaluation.status).to.equal('new_status');
    });
  });

  describe('#updateAssessmentId', () => {
    let currentAssessmentId, newAssessmentId;

    beforeEach(async () => {
      // given
      currentAssessmentId = databaseBuilder.factory.buildAssessment({}).id;
      newAssessmentId = databaseBuilder.factory.buildAssessment({}).id;
      databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId: currentAssessmentId });
      await databaseBuilder.commit();
    });

    it('should update the assessment id', async () => {
      // when
      const updatedCompetenceEvaluation = await competenceEvaluationRepository.updateAssessmentId({ currentAssessmentId, newAssessmentId });

      // then
      expect(updatedCompetenceEvaluation).to.be.instanceOf(CompetenceEvaluation);
      expect(updatedCompetenceEvaluation.assessmentId).to.equal(newAssessmentId);
    });
  });

  describe('#updateStatusByUserIdAndCompetenceId', () => {
    const competenceId = 'recABCD1234';
    let userId, otherUserId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;
      otherUserId = databaseBuilder.factory.buildUser({}).id;
      databaseBuilder.factory.buildCompetenceEvaluation({ userId, competenceId, status: 'current_status' });
      databaseBuilder.factory.buildCompetenceEvaluation({ userId: otherUserId, competenceId, status: 'current_status' });
      await databaseBuilder.commit();
    });

    it('should update the competence status', async () => {
      // when
      const updatedCompetenceEvaluation = await competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({ userId, competenceId, status: 'new_status' });
      const unchangedCompetenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({ competenceId, userId: otherUserId });

      // then
      expect(updatedCompetenceEvaluation).to.be.instanceOf(CompetenceEvaluation);
      expect(updatedCompetenceEvaluation.status).to.equal('new_status');
      expect(unchangedCompetenceEvaluation.status).to.equal('current_status');
    });
  });

});
