import { expect, sinon, catchErr } from '../../../test-helper';
import Assessment from '../../../../lib/domain/models/Assessment';
import CompetenceEvaluation from '../../../../lib/domain/models/CompetenceEvaluation';
import usecases from '../../../../lib/domain/usecases';
import { NotFoundError } from '../../../../lib/domain/errors';
import _ from 'lodash';

describe('Unit | UseCase | start-or-resume-competence-evaluation', function () {
  const userId = 123;
  const assessmentId = 456;
  const newAssessmentId = 789;
  const competenceId = 'recABC123';
  const competenceEvaluation = { userId, competenceId, assessmentId };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceRepository = { get: _.noop };
  const competenceEvaluationRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    save: _.noop,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    getByCompetenceIdAndUserId: _.noop,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    updateStatusByUserIdAndCompetenceId: _.noop,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    updateAssessmentId: _.noop,
  };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const assessmentRepository = { save: _.noop };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const updatedCompetenceEvaluation = Symbol('updated competence evaluation');

  beforeEach(function () {
    sinon.stub(competenceRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'save');
    sinon.stub(competenceEvaluationRepository, 'getByCompetenceIdAndUserId');
    sinon.stub(competenceEvaluationRepository, 'updateStatusByUserIdAndCompetenceId');
    sinon.stub(competenceEvaluationRepository, 'updateAssessmentId');
    sinon.stub(assessmentRepository, 'save');
  });

  context('When the competence does not exist', function () {
    it('should bubble the domain NotFoundError', async function () {
      // given
      const notFoundError = new NotFoundError('La compétence demandée n’existe pas');
      competenceRepository.get.withArgs({ id: competenceId }).rejects(notFoundError);

      // when
      const err = await catchErr(usecases.startOrResumeCompetenceEvaluation)({
        competenceId,
        userId,
        competenceEvaluationRepository,
        assessmentRepository,
        competenceRepository,
      });

      // then
      expect(err).to.deep.equal(notFoundError);
    });
  });

  context('When the competence could not be retrieved', function () {
    beforeEach(function () {
      competenceRepository.get.withArgs({ id: competenceId }).resolves();
      competenceEvaluationRepository.getByCompetenceIdAndUserId.rejects(new Error());
    });

    it('should forward the error', async function () {
      // when
      const err = await catchErr(usecases.startOrResumeCompetenceEvaluation)({
        competenceId,
        userId,
        competenceEvaluationRepository,
        assessmentRepository,
        competenceRepository,
      });
      // then
      expect(err).to.be.instanceOf(Error);
    });
  });
  context('When the competence exists', function () {
    beforeEach(function () {
      competenceRepository.get.withArgs({ id: competenceId }).resolves();
    });
    context('When the user starts a new competence evaluation', function () {
      beforeEach(function () {
        competenceEvaluationRepository.getByCompetenceIdAndUserId.rejects(new NotFoundError());
        const expectedAssessment = {
          userId,
          competenceId,
          state: Assessment.states.STARTED,
          courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
          type: Assessment.types.COMPETENCE_EVALUATION,
        };
        assessmentRepository.save
          .withArgs({ assessment: sinon.match(expectedAssessment) })
          .resolves({ id: assessmentId });
        const competenceEvaluationToSave = new CompetenceEvaluation({
          status: CompetenceEvaluation.statuses.STARTED,
          assessmentId,
          competenceId,
          userId,
        });
        competenceEvaluationRepository.save
          .withArgs({ competenceEvaluation: competenceEvaluationToSave })
          .resolves(competenceEvaluation);
      });
      it('should return the created competence evaluation', async function () {
        const res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId,
          userId,
          competenceEvaluationRepository,
          assessmentRepository,
          competenceRepository,
        });
        expect(res).to.deep.equal({ competenceEvaluation, created: true });
      });
    });

    context('When the user resumes a competence evaluation', function () {
      beforeEach(function () {
        competenceEvaluationRepository.getByCompetenceIdAndUserId.resolves(competenceEvaluation);
      });
      it('should return the existing competence evaluation', async function () {
        // given
        const res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId,
          userId,
          competenceEvaluationRepository,
          assessmentRepository,
          competenceRepository,
        });
        expect(res).to.deep.equal({ competenceEvaluation, created: false });
      });
    });

    context('When the user restarts a competence evaluation', function () {
      let resetCompetenceEvaluation, res;
      beforeEach(async function () {
        resetCompetenceEvaluation = { ...competenceEvaluation, status: CompetenceEvaluation.statuses.RESET };
        competenceEvaluationRepository.getByCompetenceIdAndUserId
          .onFirstCall()
          .resolves(resetCompetenceEvaluation)
          .onSecondCall()
          .resolves(updatedCompetenceEvaluation);

        const expectedAssessment = {
          userId,
          competenceId,
          state: Assessment.states.STARTED,
          courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
          type: Assessment.types.COMPETENCE_EVALUATION,
        };
        assessmentRepository.save
          .withArgs({ assessment: sinon.match(expectedAssessment) })
          .resolves({ id: newAssessmentId });
        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId.resolves();
        competenceEvaluationRepository.updateAssessmentId.resolves();

        res = await usecases.startOrResumeCompetenceEvaluation({
          competenceId,
          userId,
          competenceEvaluationRepository,
          assessmentRepository,
          competenceRepository,
        });
      });
      it('should return the updated competenceEvaluation', function () {
        expect(res).to.deep.equal({ competenceEvaluation: updatedCompetenceEvaluation, created: false });
      });
      it('should have updated the status', function () {
        expect(competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId).to.have.been.calledWithExactly({
          userId,
          competenceId: competenceEvaluation.competenceId,
          status: CompetenceEvaluation.statuses.STARTED,
        });
      });
      it('should have updated the assessment id to the newly created assessment id', function () {
        expect(competenceEvaluationRepository.updateAssessmentId).to.have.been.calledWithExactly({
          currentAssessmentId: competenceEvaluation.assessmentId,
          newAssessmentId: newAssessmentId,
        });
      });
    });
  });
});
