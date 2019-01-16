const { sinon, expect, hFake, domainBuilder } = require('../../../test-helper');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const tokenService = require('../../../../lib/domain/services/token-service');
const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');

const { ObjectValidationError, AssessmentStartError } = require('../../../../lib/domain/errors');

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

    context('when the assessment saved is a certification test', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            attributes: {
              'type': 'CERTIFICATION',
            },
            relationships: {
              course: {
                data: {
                  id: 'courseId',
                },
              },
            },
          },
        },
      };

      beforeEach(() => {
        sinon.stub(tokenService, 'extractUserId').returns('userId');
        sinon.stub(usecases, 'createAssessmentForCertification').resolves({});
      });

      it('should call createAssessmentForCertification usecase', async function() {
        // given
        const expected = Assessment.fromAttributes({
          type: Assessment.types.CERTIFICATION,
          courseId: 'courseId',
          userId: 'userId',
        });

        // when
        await controller.save(request, hFake);

        // then
        expect(usecases.createAssessmentForCertification).to.have.been.calledWith({ assessment: expected });
      });

      context('when usecase fails with a validation error', () => {
        it('should convert exception to HTTP error', () => {
          const validationError = new ObjectValidationError();
          usecases.createAssessmentForCertification.rejects(validationError);

          // when
          const promise = controller.save(request, hFake);

          // then
          return promise.then(
            () => expect.fail('should have been rejected'),
            (error) => {
              expect(error.output.statusCode).to.equal(422);
            });
        });
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
          expect(usecases.startPlacementAssessment).to.have.been.calledWith({ assessment: assessmentToStart, assessmentRepository });
        });
      });

      it('should return a 409 error if an AssessmentStartError arises', () => {
        // given
        const assessmentToStart = domainBuilder.buildAssessment({
          type: 'PLACEMENT',
        });

        const expectedError = { errors: [{ code: '409', detail: 'Error', title: 'Conflict' }] };

        sinon.stub(assessmentSerializer, 'deserialize').returns(assessmentToStart);
        sinon.stub(usecases, 'startPlacementAssessment').throws(new AssessmentStartError('Error'));

        // when
        const promise = controller.save(request, hFake);

        // then
        return promise.catch((error) => {
          expect(error.output.statusCode).to.deep.equal(expectedError);
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

      const deserializedAssessment = Assessment.fromAttributes({ id: 42, courseId: 'recCourseId', type: 'PLACEMENT' });
      const assessment = Assessment.fromAttributes({
        id: 42,
        courseId: 'recCourseId',
        createdAt: undefined,
        userId: 'userId',
        state: 'started',
        type: 'PLACEMENT',
        answers: [],
        assessmentResults: [],
        course: undefined,
        targetProfile: undefined,
        campaignParticipation: undefined,
      });
      const serializedAssessment = {
        id: 42,
        attributes: {
          'estimated-level': 4,
        },
      };

      beforeEach(() => {
        sinon.stub(assessmentSerializer, 'deserialize').returns(deserializedAssessment);
        sinon.stub(tokenService, 'extractUserId').returns('userId');
        sinon.stub(assessmentRepository, 'save').resolves(deserializedAssessment);
        sinon.stub(assessmentSerializer, 'serialize').returns(serializedAssessment);
      });

      it('should de-serialize the payload', () => {
        // when
        controller.save(request, hFake);

        // then
        sinon.assert.calledWith(assessmentSerializer.deserialize, request.payload);
      });

      it('should call a service that extract the id of user', () => {
        //When
        controller.save(request, hFake);

        //Then
        expect(tokenService.extractUserId).to.have.been.calledWith('my-token');
      });

      it('should persist the deserializedAssessment', async () => {
        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith(assessment);
      });

      it('should serialize the deserializedAssessment after its creation', async () => {
        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentSerializer.serialize).to.have.been.calledWith(deserializedAssessment);
      });

      it('should reply the serialized deserializedAssessment with code 201', async () => {
        // when
        const response = await controller.save(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedAssessment);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when the deserializedAssessment can not be saved', () => {

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
            },
            relationships: {
              course: {
                data: {
                  id: 'recCourseId',
                },
              },
            },
          },
        },
      };

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'save');
      });

      it('should throw a badImplementationError', () => {
        // given
        assessmentRepository.save.rejects(new Error());

        // when
        const promise = controller.save(request, hFake);

        // then
        return promise.catch((error) => {
          expect(error.output.statusCode).to.equal(500);
        });
      });
    });
  });
});
