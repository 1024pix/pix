const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const Boom = require('boom');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const tokenService = require('../../../../lib/domain/services/token-service');

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

    const persistedAssessment = { id: 42 };
    const serializedAssessment = {
      id: 42, attributes: {
        'estimated-level': 4
      }
    };

    let assessmentSerializerStub;
    let assessmentDeserializeStub;
    let saveAssessmentStub;
    let extractUserIdStub;
    let replyStub;
    let codeStub;

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });
      saveAssessmentStub = sinon.stub().resolves(persistedAssessment);
      extractUserIdStub = sinon.stub(tokenService, 'extractUserId');
      assessmentSerializerStub = sinon.stub(assessmentSerializer, 'serialize').returns(serializedAssessment);
      assessmentDeserializeStub = sinon.stub(assessmentSerializer, 'deserialize')
        .returns({
          set: () => {
          },
          save: saveAssessmentStub
        });
    });

    afterEach(() => {
      assessmentDeserializeStub.restore();
      assessmentSerializerStub.restore();
      extractUserIdStub.restore();
    });

    it('should exists', () => {
      expect(controller.save).to.exist.and.to.be.a('function');
    });

    it('should de-serialize the payload', () => {
      // When
      controller.save(request, replyStub);

      // Then
      sinon.assert.calledWith(assessmentDeserializeStub, request.payload);
    });

    it('should call a service that extract the id of user', () => {

      //When
      controller.save(request, replyStub);

      //Then
      sinon.assert.calledOnce(extractUserIdStub);
      sinon.assert.calledWith(extractUserIdStub, 'my-token');
    });

    it('should persist the assessment', () => {
      // When
      controller.save(request, replyStub);

      // Then
      sinon.assert.calledOnce(saveAssessmentStub);
    });

    describe('when the assessment is successfully saved', () => {
      it('should serialize the assessment after its creation', () => {
        // When
        const promise = controller.save(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(assessmentSerializerStub, persistedAssessment);
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
        const badImplementationMessage = { message: 'Boom: Bad Implementation' };
        badImplementationStub.returns(badImplementationMessage);
        const rejectedError = new Error();
        saveAssessmentStub.rejects(rejectedError);

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
