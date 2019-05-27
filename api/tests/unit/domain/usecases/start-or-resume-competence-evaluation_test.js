const { expect, sinon, catchErr } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Unit | UseCase | start-or-resume-competence-evaluation', () => {

  const userId = 123;
  const assessmentId = 456;
  const competenceId = 'recABC123';
  const competenceEvaluation = { userId, competenceId, assessmentId };
  const competenceRepository = { get: _.noop };
  const competenceEvaluationRepository = { save: _.noop, getByCompetenceIdAndUserId: _.noop, };
  const assessmentRepository = { save: _.noop };

  beforeEach(() => {
    sinon.stub(competenceRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'save');
    sinon.stub(competenceEvaluationRepository, 'getByCompetenceIdAndUserId');
    sinon.stub(assessmentRepository, 'save');
  });

  context('When the competence does not exist', () => {
    beforeEach(() => {
      competenceRepository.get.withArgs(competenceId).rejects();
    });
    it('should throw a Not Found Error', async () => {
      // when
      const err = await catchErr(usecases.startOrResumeCompetenceEvaluation)({
        competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
      });
      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });
  context('When the competence could not be retrieved not exist', () => {
    beforeEach(() => {
      competenceRepository.get.withArgs(competenceId).resolves();
      competenceEvaluationRepository.getByCompetenceIdAndUserId.rejects(new Error);
    });
    it('should forward the error', async () => {
      // when
      const err = await catchErr(usecases.startOrResumeCompetenceEvaluation)({
        competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
      });
      // then
      expect(err).to.be.instanceOf(Error);
    });
  });
  context('When the competence exists', () => {
    beforeEach(() => {
      competenceRepository.get.withArgs(competenceId).resolves();
    });
    context('When the user starts a new competence evaluation', () => {
      beforeEach(() => {
        competenceEvaluationRepository.getByCompetenceIdAndUserId.rejects(new NotFoundError);

        assessmentRepository.save.withArgs(new Assessment({
          courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
          type: Assessment.types.COMPETENCE_EVALUATION,
          userId, state: Assessment.states.STARTED,
        })).resolves({ id: assessmentId });

        competenceEvaluationRepository.save.withArgs(new CompetenceEvaluation({
          status: CompetenceEvaluation.statuses.STARTED,
          assessmentId,
          competenceId,
          userId,
        })).resolves(competenceEvaluation);
      });
      it('should return the created competence evaluation with created flag set to true', async () => {
        const res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
        });
        expect(res).to.deep.equal({ created: true, competenceEvaluation });
      });
    });

    context('When the user resumes a competence evaluation', () => {
      beforeEach(() => {
        competenceEvaluationRepository.getByCompetenceIdAndUserId.resolves(competenceEvaluation);
      });
      it('should return the existing competence evaluation', async () => {
      // given
        const res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
        });
        expect(res).to.deep.equal({ created: false, competenceEvaluation });
      });
    });
  });
});
