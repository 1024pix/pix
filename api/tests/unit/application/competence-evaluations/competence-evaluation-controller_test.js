const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

const competenceEvaluationController = require('../../../../lib/application/competence-evaluations/competence-evaluation-controller');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/competence-evaluation-serializer');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Application | Controller | Competence-Evaluation', () => {
  
  describe('#start', () => {
    let request;
    const competenceId = 'recABCD1234';
    const userId = 6;

    beforeEach(() => {
      sinon.stub(usecases, 'startCompetenceEvaluation');
      sinon.stub(serializer, 'serialize');
      request = {
        headers: { authorization: 'token' },
        auth: { credentials: { userId } },
        payload: {
          data: {
            type: 'competence-evaluations',
            attributes: {
              'competence-id': competenceId,
            }
          }
        }
      };
    });

    it('should call the usecases to start the competence evaluation', async () => {
      // given
      usecases.startCompetenceEvaluation.resolves();

      // when
      await competenceEvaluationController.start(request, hFake);

      // then
      expect(usecases.startCompetenceEvaluation).to.have.been.calledOnce;

      const args = usecases.startCompetenceEvaluation.firstCall.args[0];

      expect(args.userId).to.equal(userId);
      expect(args.competenceId).to.equal(competenceId);
    });

    it('should return the serialized competence evaluation when it has been successfully created', async () => {
      // given
      const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({ competenceId });
      usecases.startCompetenceEvaluation.resolves(competenceEvaluation);

      const serializedCompetenceEvaluation = {
        id: 1,
        assessmentId: competenceEvaluation.assessmentId,
        userId: competenceEvaluation.userId,
        competenceId
      };
      serializer.serialize.returns(serializedCompetenceEvaluation);

      // when
      const response = await competenceEvaluationController.start(request, hFake);

      // then
      expect(serializer.serialize).to.have.been.calledWith();
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCompetenceEvaluation);
    });
  });
  
});
