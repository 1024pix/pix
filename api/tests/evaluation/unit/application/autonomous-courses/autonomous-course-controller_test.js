import sinon from 'sinon';

import { autonomousCourseController } from '../../../../../src/evaluation/application/autonomous-courses/autonomous-course-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Controller | autonomous-course-controller', function () {
  describe('#save', function () {
    it('should return autonomous course created Id', async function () {
      // given
      const userId = '123';
      const autonomousCourseAttributes = {
        'internal-title': 'Titre pour usage interne',
        'public-title': 'Titre pour usage public',
        'target-profile-id': '3',
        'custom-landing-page-text': 'customLandingPageText',
      };
      const payload = {
        data: {
          type: 'autonomous-courses',
          attributes: autonomousCourseAttributes,
        },
      };
      const request = {
        headers: {
          ...generateAuthenticatedUserRequestHeaders({ userId }),
          'user-agent': 'Mozilla',
        },
        payload: payload,
      };
      const h = {
        ...hFake,
      };

      const expectedAutonomousCourseId = 123;

      const usecases = {
        saveAutonomousCourse: sinon.stub().resolves(expectedAutonomousCourseId),
      };

      const serializedAutonomousCourseId = Symbol('serializedAutonomousCourseId');

      const expectedDeserializedPayloadAttributes = {
        internalTitle: 'Titre pour usage interne',
        publicTitle: 'Titre pour usage public',
        targetProfileId: 3,
        customLandingPageText: 'customLandingPageText',
      };

      const autonomousCourseSerializer = {
        serializeId: sinon.stub().returns(serializedAutonomousCourseId),
        deserialize: sinon.stub().returns(expectedDeserializedPayloadAttributes),
      };
      const dependencies = { usecases, autonomousCourseSerializer };

      // when
      await autonomousCourseController.save(request, h, dependencies);

      // then
      expect(usecases.saveAutonomousCourse).to.have.been.calledWithExactly({
        autonomousCourse: { ...expectedDeserializedPayloadAttributes, ownerId: userId },
      });
      expect(autonomousCourseSerializer.serializeId).to.have.been.calledWithExactly(expectedAutonomousCourseId);
    });
  });

  describe('#getById', function () {
    it('should get autonomous course by id', async function () {
      // given
      const expectedResult = Symbol('serialized-autonomous-course');
      const autonomousCourse = Symbol('autonomousCourse');
      const autonomousCourseId = 1;

      sinon.stub(evaluationUsecases, 'getAutonomousCourse').resolves(autonomousCourse);
      const autonomousCourseSerializer = { serialize: sinon.stub().returns(expectedResult) };

      // when
      const response = await autonomousCourseController.getById(
        {
          params: {
            autonomousCourseId,
          },
        },
        hFake,
        { autonomousCourseSerializer },
      );

      // then
      expect(evaluationUsecases.getAutonomousCourse).to.have.been.calledOnceWithExactly({ autonomousCourseId });
      expect(autonomousCourseSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#findPaginatedList', function () {
    it('should find all paginated autonomous courses for given pagination', async function () {
      // given
      const expectedResult = Symbol('serialized-result');
      const autonomousCourses = Symbol('trainingSummary');
      const meta = Symbol('meta');
      const queryParameters = {
        page: { size: 2, number: 1 },
      };

      const evaluationUsecases = {
        findAllPaginatedAutonomousCourses: sinon.stub().resolves({ autonomousCourses, meta }),
      };

      const autonomousCoursePaginatedListSerializer = { serialize: sinon.stub().returns(expectedResult) };

      // when
      const response = await autonomousCourseController.findPaginatedList(
        {
          query: {
            page: { size: 2, number: 1 },
          },
        },
        hFake,
        { autonomousCoursePaginatedListSerializer, usecases: evaluationUsecases },
      );

      // then
      expect(evaluationUsecases.findAllPaginatedAutonomousCourses).to.have.been.calledWithExactly(queryParameters);
      expect(autonomousCoursePaginatedListSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#update', function () {
    it('should call the appropriate usecase', async function () {
      // given
      const deserializedResult = { id: 12 };
      const autonomousCourse = Symbol('autonomousCourse');
      const autonomousCourseId = 1;

      sinon.stub(evaluationUsecases, 'updateAutonomousCourse').resolves(autonomousCourse);
      const autonomousCourseSerializer = { deserialize: sinon.stub().returns(deserializedResult) };

      const dependencies = { usecases: evaluationUsecases, autonomousCourseSerializer };

      // when
      const response = await autonomousCourseController.update(
        {
          params: {
            autonomousCourseId,
          },
        },
        hFake,
        dependencies,
      );

      // then
      expect(evaluationUsecases.updateAutonomousCourse).to.have.been.calledOnceWithExactly({
        autonomousCourse: {
          campaignId: autonomousCourseId,
          ...deserializedResult,
        },
      });
      expect(autonomousCourseSerializer.deserialize).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(204);
    });
  });
});
