import _ from 'lodash';

import { NotFoundError } from '../../../../lib/domain/errors.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from '../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import * as competenceEvaluationRepository from '../../../../lib/infrastructure/repositories/competence-evaluation-repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | Competence Evaluation', function () {
  const STARTED = 'started';
  describe('#save', function () {
    let assessment;
    beforeEach(async function () {
      assessment = databaseBuilder.factory.buildAssessment({});
      await databaseBuilder.commit();
    });

    afterEach(function () {
      return knex('competence-evaluations').delete();
    });

    it('should return the given competence evaluation', async function () {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: assessment.id,
        competenceId: 'recABCD1234',
        status: STARTED,
        userId: assessment.userId,
      });

      // when
      const savedCompetenceEvaluation = await DomainTransaction.execute(async (domainTransaction) =>
        competenceEvaluationRepository.save({ competenceEvaluation: competenceEvaluationToSave, domainTransaction }),
      );

      // then
      expect(savedCompetenceEvaluation).to.be.instanceof(CompetenceEvaluation);
      expect(savedCompetenceEvaluation.id).to.exist;
      expect(savedCompetenceEvaluation.createdAt).to.exist;
      expect(savedCompetenceEvaluation.status).to.equal(STARTED);
      expect(savedCompetenceEvaluation.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
      expect(savedCompetenceEvaluation.competenceId).to.equal(competenceEvaluationToSave.competenceId);
      expect(savedCompetenceEvaluation.userId).to.equal(competenceEvaluationToSave.userId);
    });

    it('should save the given competence evaluation', async function () {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: assessment.id,
        competenceId: 'recABCD1234',
        status: STARTED,
        userId: assessment.userId,
      });

      // when
      const savedCompetenceEvaluation = await DomainTransaction.execute(async (domainTransaction) =>
        competenceEvaluationRepository.save({ competenceEvaluation: competenceEvaluationToSave, domainTransaction }),
      );

      // then
      return knex
        .select('id', 'assessmentId', 'competenceId', 'userId', 'status')
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

    it('should not save the given competence evaluation if it already exists', async function () {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: assessment.id,
        competenceId: 'recABCD1234',
        status: STARTED,
        userId: assessment.userId,
      });
      await DomainTransaction.execute(async (domainTransaction) =>
        competenceEvaluationRepository.save({ competenceEvaluation: competenceEvaluationToSave, domainTransaction }),
      );

      // when
      const savedCompetenceEvaluation = await DomainTransaction.execute(async (domainTransaction) =>
        competenceEvaluationRepository.save({ competenceEvaluation: competenceEvaluationToSave, domainTransaction }),
      );

      // then
      return knex
        .select('id', 'assessmentId', 'competenceId', 'userId', 'status')
        .from('competence-evaluations')
        .where({ id: savedCompetenceEvaluation.id })
        .then((result) => {
          expect(result.length).to.equal(1);
          expect(result[0].id).to.equal(savedCompetenceEvaluation.id);
          expect(result[0].assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
          expect(result[0].competenceId).to.equal(competenceEvaluationToSave.competenceId);
          expect(result[0].userId).to.equal(competenceEvaluationToSave.userId);
          expect(result[0].status).to.equal('started');
        });
    });
  });

  describe('#getByAssessmentId', function () {
    let assessmentForExpectedCompetenceEvaluation, assessmentNotExpected;
    let competenceEvaluationExpected;

    beforeEach(async function () {
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

    it('should return the competence evaluation linked to the assessment', function () {
      // when
      const promise = competenceEvaluationRepository.getByAssessmentId(assessmentForExpectedCompetenceEvaluation.id);

      // then
      return promise.then((competenceEvaluation) => {
        expect(_.omit(competenceEvaluation, ['assessment', 'scorecard'])).to.deep.equal(
          _.omit(competenceEvaluationExpected, ['assessment']),
        );
        expect(competenceEvaluation.assessment.id).to.deep.equal(assessmentForExpectedCompetenceEvaluation.id);
      });
    });

    it('should return an error when there is no competence evaluation', function () {
      // when
      const promise = catchErr(competenceEvaluationRepository.getByAssessmentId)(assessmentNotExpected.id);

      // then
      return promise.then((error) => {
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });

  describe('#getByCompetenceIdAndUserId', function () {
    let user;
    let competenceEvaluationExpected, assessmentExpected;

    beforeEach(async function () {
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

    it('should return the competence evaluation linked to the competence id', function () {
      // when
      const promise = competenceEvaluationRepository.getByCompetenceIdAndUserId({ competenceId: 1, userId: user.id });

      // then
      return promise.then((competenceEvaluation) => {
        expect(_.omit(competenceEvaluation, ['assessment', 'scorecard'])).to.deep.equal(
          _.omit(competenceEvaluationExpected, ['assessment']),
        );
        expect(competenceEvaluation.assessment.id).to.deep.equal(assessmentExpected.id);
      });
    });

    it('should return an error when there is no competence evaluation', function () {
      // when
      const promise = catchErr(competenceEvaluationRepository.getByCompetenceIdAndUserId)({
        competenceId: 'fakeId',
        userId: user.id,
      });

      // then
      return promise.then((error) => {
        expect(error).to.be.instanceof(NotFoundError);
      });
    });

    it('should return only one competence evaluation linked to the competence id', async function () {
      // given
      const anotherAssessment = databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: user.id,
        competenceId: '1',
        assessmentId: anotherAssessment.id,
        status: STARTED,
      });

      // when
      const result = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
        competenceId: 1,
        userId: user.id,
      });

      // then
      expect(_.omit(result, ['assessment', 'scorecard'])).to.deep.equal(
        _.omit(competenceEvaluationExpected, ['assessment']),
      );
      expect(result.assessment.id).to.deep.equal(assessmentExpected.id);
    });
  });

  describe('#findByUserId', function () {
    let user;
    let competenceEvaluationExpected, assessmentExpected;

    beforeEach(async function () {
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
        competenceId: '1',
        createdAt: new Date('2018-01-02'),
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

    it('should return the competence evaluation linked to the competence id', function () {
      // when
      const promise = competenceEvaluationRepository.findByUserId(user.id);

      // then
      return promise.then((competenceEvaluation) => {
        expect(competenceEvaluation).to.have.length(2);
        expect(_.omit(competenceEvaluation[0], ['assessment', 'scorecard'])).to.deep.equal(
          _.omit(competenceEvaluationExpected, ['assessment']),
        );
        expect(competenceEvaluation[0].assessment.id).to.deep.equal(assessmentExpected.id);
      });
    });
  });

  describe('#findByAssessmentId', function () {
    let assessmentId;
    let competenceEvaluationExpected;

    beforeEach(function () {
      // given
      assessmentId = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.COMPETENCE_EVALUATION,
      }).id;

      competenceEvaluationExpected = databaseBuilder.factory.buildCompetenceEvaluation({
        competenceId: '1',
        assessmentId,
        createdAt: new Date('2018-01-01'),
        status: STARTED,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        competenceId: '2',
        createdAt: new Date('2017-01-01'),
        status: STARTED,
      });

      return databaseBuilder.commit();
    });

    it('should return the competence evaluation linked to the assessmentId', async function () {
      // when
      const competenceEvaluations = await competenceEvaluationRepository.findByAssessmentId(assessmentId);

      // then
      expect(competenceEvaluations).to.have.length(1);
      expect(_.omit(competenceEvaluations[0], ['assessment', 'scorecard'])).to.deep.equal(
        _.omit(competenceEvaluationExpected, ['assessment']),
      );
    });
  });

  describe('#existsByCompetenceIdAndUserId', function () {
    let userId;

    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;

      databaseBuilder.factory.buildCompetenceEvaluation({
        userId,
        competenceId: '1',
        status: STARTED,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId,
        competenceId: '2',
        status: STARTED,
      });

      await databaseBuilder.commit();
    });

    it('should return true where there is a a competence evaluation', async function () {
      // when
      const result = await competenceEvaluationRepository.existsByCompetenceIdAndUserId({
        competenceId: 1,
        userId,
      });

      // then
      expect(result).to.equal(true);
    });

    it('should return false when there is no competence evaluation', async function () {
      // when
      const result = await competenceEvaluationRepository.existsByCompetenceIdAndUserId({
        competenceId: 'fakeId',
        userId,
      });

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#updateAssessmentId', function () {
    let currentAssessmentId, newAssessmentId;

    beforeEach(async function () {
      // given
      currentAssessmentId = databaseBuilder.factory.buildAssessment({}).id;
      newAssessmentId = databaseBuilder.factory.buildAssessment({}).id;
      databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId: currentAssessmentId });
      await databaseBuilder.commit();
    });

    it('should update the assessment id', async function () {
      // when
      const updatedCompetenceEvaluation = await competenceEvaluationRepository.updateAssessmentId({
        currentAssessmentId,
        newAssessmentId,
      });

      // then
      expect(updatedCompetenceEvaluation).to.be.instanceOf(CompetenceEvaluation);
      expect(updatedCompetenceEvaluation.assessmentId).to.equal(newAssessmentId);
    });
  });

  describe('#updateStatusByUserIdAndCompetenceId', function () {
    const competenceId = 'recABCD1234';
    let userId, otherUserId;

    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;
      otherUserId = databaseBuilder.factory.buildUser({}).id;
      databaseBuilder.factory.buildCompetenceEvaluation({ userId, competenceId, status: 'current_status' });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId: otherUserId,
        competenceId,
        status: 'current_status',
      });
      await databaseBuilder.commit();
    });

    it('should update the competence status', async function () {
      // when
      const updatedCompetenceEvaluation = await competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
        userId,
        competenceId,
        status: 'new_status',
      });
      const unchangedCompetenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
        competenceId,
        userId: otherUserId,
      });

      // then
      expect(updatedCompetenceEvaluation).to.be.instanceOf(CompetenceEvaluation);
      expect(updatedCompetenceEvaluation.status).to.equal('new_status');
      expect(unchangedCompetenceEvaluation.status).to.equal('current_status');
    });
  });
});
