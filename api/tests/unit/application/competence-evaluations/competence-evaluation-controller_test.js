const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');
const competenceEvaluationController = require('../../../../lib/application/competence-evaluations/competence-evaluation-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | Application | Controller | Competence-Evaluation', function () {
  describe('#startOrResume', function () {
    const competenceId = 'recABCD1234';
    const userId = 6;
    let request;
    let competenceEvaluationSerializer;

    beforeEach(function () {
      sinon.stub(usecases, 'startOrResumeCompetenceEvaluation');
      competenceEvaluationSerializer = { serialize: sinon.stub() };
      request = {
        headers: { authorization: 'token' },
        auth: { credentials: { userId } },
        payload: { competenceId },
      };
    });

    it('should call the usecases to start the competence evaluation', async function () {
      // given
      usecases.startOrResumeCompetenceEvaluation.resolves({});

      // when
      await competenceEvaluationController.startOrResume(request, hFake, { competenceEvaluationSerializer });

      // then
      expect(usecases.startOrResumeCompetenceEvaluation).to.have.been.calledOnce;

      const { userId, competenceId } = usecases.startOrResumeCompetenceEvaluation.firstCall.args[0];

      expect(userId).to.equal(userId);
      expect(competenceId).to.equal(competenceId);
    });

    it('should return the serialized competence evaluation when it has been successfully created', async function () {
      // given
      const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({ competenceId });
      usecases.startOrResumeCompetenceEvaluation.resolves({ competenceEvaluation, created: true });

      const serializedCompetenceEvaluation = {
        id: 1,
        assessmentId: competenceEvaluation.assessmentId,
        userId: competenceEvaluation.userId,
        competenceId,
      };
      competenceEvaluationSerializer.serialize.returns(serializedCompetenceEvaluation);

      // when
      const response = await competenceEvaluationController.startOrResume(request, hFake, {
        competenceEvaluationSerializer,
      });

      // then
      expect(competenceEvaluationSerializer.serialize).to.have.been.calledWith(competenceEvaluation);
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCompetenceEvaluation);
    });
  });
});
