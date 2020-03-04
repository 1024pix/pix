const { sinon, expect, domainBuilder, hFake, catchErr } = require('../../../test-helper');

const competenceEvaluationController = require('../../../../lib/application/competence-evaluations/competence-evaluation-controller');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/competence-evaluation-serializer');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const { BadRequestError } = require('../../../../lib/application/errors');

describe('Unit | Application | Controller | Competence-Evaluation', () => {

  describe('#start', () => {
    let request;
    const competenceId = 'recABCD1234';
    const userId = 6;

    beforeEach(() => {
      sinon.stub(usecases, 'startOrResumeCompetenceEvaluation');
      sinon.stub(serializer, 'serialize');
      request = {
        headers: { authorization: 'token' },
        auth: { credentials: { userId } },
        payload: { competenceId },
      };
    });

    it('should call the usecases to start the competence evaluation', async () => {
      // given
      usecases.startOrResumeCompetenceEvaluation.resolves({});

      // when
      await competenceEvaluationController.startOrResume(request, hFake);

      // then
      expect(usecases.startOrResumeCompetenceEvaluation).to.have.been.calledOnce;

      const { userId, competenceId } = usecases.startOrResumeCompetenceEvaluation.firstCall.args[0];

      expect(userId).to.equal(userId);
      expect(competenceId).to.equal(competenceId);
    });

    it('should return the serialized competence evaluation when it has been successfully created', async () => {
      // given
      const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({ competenceId });
      usecases.startOrResumeCompetenceEvaluation.resolves({ competenceEvaluation, created: true });

      const serializedCompetenceEvaluation = {
        id: 1,
        assessmentId: competenceEvaluation.assessmentId,
        userId: competenceEvaluation.userId,
        competenceId
      };
      serializer.serialize.returns(serializedCompetenceEvaluation);

      // when
      const response = await competenceEvaluationController.startOrResume(request, hFake);

      // then
      expect(serializer.serialize).to.have.been.calledWith(competenceEvaluation);
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCompetenceEvaluation);
    });
  });

  describe('#find ', () => {
    const userId = 1;
    const assessmentId = 2;
    let query, request, result, options, serialized;

    beforeEach(() => {
      query = {
        'filter[assessmentId]': assessmentId,
      };
      request = {
        query,
        auth: { credentials: { userId } }
      };
      options = { filter: { assessmentId } };
      result = {
        models: [{ id: 1 }, { id: 2 }],
      };
      serialized = {
        competenceEvaluations: [{ id: 1 }, { id: 2 }],
      };

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findCompetenceEvaluations');
      sinon.stub(serializer, 'serialize');
    });

    it('should return the competenceEvaluations', async () => {
      // given
      queryParamsUtils.extractParameters.withArgs(query).returns(options);
      usecases.findCompetenceEvaluations.withArgs({ userId, options }).resolves(result);
      serializer.serialize.withArgs(result.models).returns(serialized);

      // when
      const response = await competenceEvaluationController.find(request);

      // then
      expect(response).to.deep.equal(serialized);
    });

    it('should throw a BadRequestError', async () => {
      // given
      queryParamsUtils.extractParameters.withArgs(query).returns({ filter: {} });

      // when
      const error = await catchErr(competenceEvaluationController.find)(request);

      // then
      expect(error).to.be.instanceof(BadRequestError);
    });

  });

});
