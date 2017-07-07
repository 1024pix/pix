const {describe, it, expect, sinon, beforeEach, afterEach} = require('../../../test-helper');
const Boom = require('boom');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const tokenService = require('../../../../lib/domain/services/token-service');

const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Unit | Controller | assessment-controller', () => {

  describe('#save', () => {

    const request = {
      headers: {
        authorization: 'Bearer my-token'
      },
      payload: {
        data: {
          id: 256,
          attributes: {
            'estimated-level': 4,

            'pix-score': 4
          },
          relationships: {
            user: {
              data: {
                id: 42657
              }
            },
            course: {
              data: {
                id: 42657
              }
            }
          }
        }
      }
    };

    const persistedAssessment = {id: 42};
    const serializedAssessment = {
      id: 42,
      attributes: {
        'estimated-level': 4
      }
    };

    let sandbox;

    let assessment;
    let codeStub;
    let replyStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      assessment = new Assessment({});

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({code: codeStub});

      sandbox.stub(assessment, 'save').resolves(persistedAssessment);
      sandbox.stub(tokenService, 'extractUserId');
      sandbox.stub(assessmentSerializer, 'serialize').returns(serializedAssessment);
      sandbox.stub(assessmentSerializer, 'deserialize')
        .returns(assessment);
    });

    afterEach(() => {
      sandbox.restore();

    });

    it('should exists', () => {
      expect(controller.save).to.exist.and.to.be.a('function');
    });

    it('should de-serialize the payload', () => {
      // When
      controller.save(request, replyStub);

      // Then
      sinon.assert.calledWith(assessmentSerializer.deserialize, request.payload);
    });

    it('should call a service that extract the id of user', () => {
      //When
      controller.save(request, replyStub);

      //Then
      sinon.assert.calledOnce(tokenService.extractUserId);
      sinon.assert.calledWith(tokenService.extractUserId, 'my-token');
    });

    it('should persist the assessment', () => {
      // When
      controller.save(request, replyStub);

      // Then
      sinon.assert.calledOnce(assessment.save);
    });

    describe('when the assessment is successfully saved', () => {
      it('should serialize the assessment after its creation', () => {
        // When
        const promise = controller.save(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(assessmentSerializer.serialize, persistedAssessment);
        });
      });

      it('should reply the serialized assessment with code 201', () => {
        // When
        const promise = controller.save(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedAssessment);
          sinon.assert.calledWith(codeStub, 201);
        });
      });
    });

    describe('when the assessment can not be saved', () => {

      let badImplementationStub;

      beforeEach(() => {
        badImplementationStub = sinon.stub(Boom, 'badImplementation');
      });

      afterEach(() => {
        badImplementationStub.restore();
      });

      it('should return a badImplementationError', () => {
        // Given
        const badImplementationMessage = {message: 'Boom: Bad Implementation'};
        badImplementationStub.returns(badImplementationMessage);
        const rejectedError = new Error();
        assessment.save.rejects(rejectedError);

        // When
        const promise = controller.save(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(badImplementationStub, rejectedError);
          sinon.assert.calledWith(replyStub, badImplementationMessage);
        });
      });
    });

  });

});
