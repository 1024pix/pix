const { sinon, expect, hFake, domainBuilder } = require('../../../test-helper');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const tokenService = require('../../../../lib/domain/services/token-service');
const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | assessment-controller-save', () => {

  describe('#save', () => {

    context('when the assessment saved is a smart placement', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'type': 'SMART_PLACEMENT',
              'code-campaign': 'CODECAMPAIGN',
              'participant-external-id': 'matricule123',
            },
          },
        },
      };

      beforeEach(() => {
        sinon.stub(usecases, 'createAssessmentForCampaign').resolves({});
      });

      it('should save an assessment with the type SMART_PLACEMENT and with a fake courseId', async function() {
        // given
        const expectedAssessment = Assessment.fromAttributes({
          id: 42,
          courseId: null,
          type: 'SMART_PLACEMENT',
          state: undefined,
          userId: null,
        });

        const expectedCallArguments = {
          assessment: expectedAssessment,
          codeCampaign: 'CODECAMPAIGN',
          participantExternalId: 'matricule123',
        };
        // when
        await controller.save(request, hFake);

        // then
        sinon.assert.calledOnce(usecases.createAssessmentForCampaign);
        sinon.assert.calledWith(usecases.createAssessmentForCampaign, expectedCallArguments);
      });
    });

    context('when the assessment saved is a preview test', () => {
      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              'type': 'PREVIEW',
            },
            relationships: {
              course: {
                data: {
                  id: 'null-preview-id',
                },
              },
            },
          },
        },
      };

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'save').resolves({});
      });

      it('should save an assessment with type PREVIEW', async function() {
        // given
        const expected = Assessment.fromAttributes({
          id: 42,
          courseId: null,
          type: 'PREVIEW',
          userId: null,
          state: 'started',
        });

        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith(expected);
      });
    });

    context('when the assessment is a placement', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'type': 'PLACEMENT',
            },
            relationships: {
              course: {
                data: {
                  id: 'rec23IJEjfeo98',
                },
              },
            },
          },
        },
      };

      it('should start the placement assessment', function() {
        // given
        const startedAssessment = domainBuilder.buildAssessment({
          id: 42,
          courseId: null,
          type: 'PLACEMENT',
          userId: null,
          state: 'started',
        });

        const assessmentToStart = domainBuilder.buildAssessment({
          id: 42,
          courseId: 'rec23IJEjfeo98',
          type: 'PLACEMENT',
          userId: null,
          state: null,
        });

        sinon.stub(assessmentSerializer, 'deserialize').returns(assessmentToStart);
        sinon.stub(usecases, 'startPlacementAssessment').resolves(startedAssessment);

        // when
        const promise = controller.save(request, hFake);

        // then
        return promise.then(() => {
          expect(usecases.startPlacementAssessment).to.have.been.calledWith({ assessment: assessmentToStart });
        });
      });
    });

    context('when the assessment saved is not a certification test', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 256,
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              type: 'PLACEMENT'
            },
            relationships: {
              user: {
                data: {
                  id: 42657,
                },
              },
              course: {
                data: {
                  id: 'recCourseId',
                },
              },
            },
          },
        },
      };

      const aStartedPlacement = Symbol('a started placement');
      const aSerializedAssessment = Symbol('a serialized assessment');

      beforeEach(() => {
        sinon.stub(tokenService, 'extractUserId').returns('userId');
        sinon.stub(usecases, 'startPlacementAssessment').returns(aStartedPlacement);
        sinon.stub(assessmentSerializer, 'serialize').returns(aSerializedAssessment);
      });

      it('should call a service that extract the id of user', async () => {
        //When
        await controller.save(request, hFake);

        //Then
        expect(tokenService.extractUserId).to.have.been.calledWith('my-token');
      });

      it('should serialize the deserializedAssessment after its creation', async () => {
        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentSerializer.serialize).to.have.been.calledWith(aStartedPlacement);
      });

      it('should reply the serialized deserializedAssessment with code 201', async () => {
        // when
        const response = await controller.save(request, hFake);

        // then
        expect(response.source).to.deep.equal(aSerializedAssessment);
        expect(response.statusCode).to.equal(201);
      });
    });
  });
});
