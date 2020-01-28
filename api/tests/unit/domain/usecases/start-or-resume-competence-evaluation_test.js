const { expect, sinon, catchErr } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Unit | UseCase | start-or-resume-competence-evaluation', () => {

  const userId = 123;
  const assessmentId = 456;
  const newAssessmentId = 789;
  const competenceId = 'recABC123';
  const competenceEvaluation = { userId, competenceId, assessmentId };
  const competenceRepository = { get: _.noop };
  const competenceEvaluationRepository = {
    save: _.noop,
    getByCompetenceIdAndUserId: _.noop,
    updateStatusByUserIdAndCompetenceId: _.noop,
    updateAssessmentId: _.noop,
  };
  const assessmentRepository = { save: _.noop };
  const updatedCompetenceEvaluation = Symbol('updated competence evaluation');

  beforeEach(() => {
    sinon.stub(competenceRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'save');
    sinon.stub(competenceEvaluationRepository, 'getByCompetenceIdAndUserId');
    sinon.stub(competenceEvaluationRepository, 'updateStatusByUserIdAndCompetenceId');
    sinon.stub(competenceEvaluationRepository, 'updateAssessmentId');
    sinon.stub(assessmentRepository, 'save');
  });

  context('When the competence does not exist', () => {

    it('should bubble the domain NotFoundError', async () => {
      // given
      const notFoundError = new NotFoundError('La compétence demandée n’existe pas');
      competenceRepository.get.withArgs(competenceId).rejects(notFoundError);

      // when
      const err = await catchErr(usecases.startOrResumeCompetenceEvaluation)({
        competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
      });

      // then
      expect(err).to.deep.equal(notFoundError);
    });
  });

  context('When the competence could not be retrieved', () => {

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
          competenceId,
        })).resolves({ id: assessmentId });

        competenceEvaluationRepository.save.withArgs(new CompetenceEvaluation({
          status: CompetenceEvaluation.statuses.STARTED,
          assessmentId,
          competenceId,
          userId,
        })).resolves(competenceEvaluation);
      });
      it('should return the created competence evaluation', async () => {
        const res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
        });
        expect(res).to.deep.equal({ competenceEvaluation, created: true });
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
        expect(res).to.deep.equal({ competenceEvaluation, created: false });
      });
    });

    context('When the user restarts a competence evaluation', () => {
      let resetCompetenceEvaluation, res;
      beforeEach(async () => {
        resetCompetenceEvaluation = { ...competenceEvaluation, status: CompetenceEvaluation.statuses.RESET };
        competenceEvaluationRepository.getByCompetenceIdAndUserId
          .onFirstCall().resolves(resetCompetenceEvaluation)
          .onSecondCall().resolves(updatedCompetenceEvaluation);

        assessmentRepository.save.withArgs(new Assessment({
          courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
          type: Assessment.types.COMPETENCE_EVALUATION,
          userId, state: Assessment.states.STARTED,
          competenceId,
        })).resolves({ id: newAssessmentId });

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId.resolves();
        competenceEvaluationRepository.updateAssessmentId.resolves();

        res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository
        });
      });
      it('should return the updated competenceEvaluation', () => {
        expect(res).to.deep.equal({ competenceEvaluation: updatedCompetenceEvaluation, created: false });
      });
      it('should have updated the status', () => {
        expect(competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId).to.have.been
          .calledWithExactly({
            userId,
            competenceId: competenceEvaluation.competenceId,
            status: CompetenceEvaluation.statuses.STARTED,
          });
      });
      it('should have updated the assessment id to the newly created assessment id', () => {
        expect(competenceEvaluationRepository.updateAssessmentId).to.have.been
          .calledWithExactly({
            currentAssessmentId: competenceEvaluation.assessmentId,
            newAssessmentId: newAssessmentId,
          });
      });
    });
  });
});
