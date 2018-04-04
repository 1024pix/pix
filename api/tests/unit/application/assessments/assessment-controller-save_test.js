const { sinon, expect } = require('../../../test-helper');
const Boom = require('boom');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const tokenService = require('../../../../lib/domain/services/token-service');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Controller | assessment-controller-save', () => {

  describe('#save', () => {

    let sandbox;

    let codeStub;
    let replyStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when the assessment saved is a certification test', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token'
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              'type' : 'CERTIFICATION'
            },
            relationships: {
              course: {
                data: {
                  id: '1'
                }
              }
            }
          }
        }
      };

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'save').resolves();
      });

      it('should save an assessment with the type CERTIFICATION', function() {
        // given
        const expected = new Assessment({ id: 42, courseId: '1', type: 'CERTIFICATION', state: 'started', userId: null });

        // when
        controller.save(request, replyStub);

        // then
        sinon.assert.calledOnce(assessmentRepository.save);
        return expect(assessmentRepository.save).to.have.been.calledWith(expected);
      });
    });

    context('when the assessment saved is a preview test', () => {
      const request = {
        headers: {
          authorization: 'Bearer my-token'
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              'type' : 'PREVIEW'
            },
            relationships: {
              course: {
                data: {
                  id: 'null-preview-id'
                }
              }
            }
          }
        }
      };

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'save').resolves();
      });

      it('should save an assessment with type PREVIEW', function() {
        // given
        const expected = new Assessment({ id: 42, courseId: 'null-preview-id', type: 'PREVIEW', userId: null, state: 'started' });

        // when
        controller.save(request, replyStub);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith(expected);
      });
    });

    context('when the assessment saved is not a certification test', () => {

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
                  id: 'recCourseId'
                }
              }
            }
          }
        }
      };

      const deserializedAssessment = { id: 42, courseId: 'recCourseId' };
      const assessment = { id: 42, courseId: 'recCourseId', userId: 'userId', state: 'started' };
      const serializedAssessment = {
        id: 42,
        attributes: {
          'estimated-level': 4
        }
      };

      beforeEach(() => {
        sandbox.stub(assessmentSerializer, 'deserialize').returns(deserializedAssessment);
        sandbox.stub(tokenService, 'extractUserId').returns('userId');
        sandbox.stub(assessmentRepository, 'save').resolves(deserializedAssessment);
        sandbox.stub(assessmentSerializer, 'serialize').returns(serializedAssessment);
      });

      it('should de-serialize the payload', () => {
        // when
        controller.save(request, replyStub);

        // then
        sinon.assert.calledWith(assessmentSerializer.deserialize, request.payload);
      });

      it('should call a service that extract the id of user', () => {
        //When
        controller.save(request, replyStub);

        //Then
        expect(tokenService.extractUserId).to.have.been.calledWith('my-token');
      });

      it('should persist the deserializedAssessment', () => {
        // when
        controller.save(request, replyStub);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith(assessment);
      });

      it('should serialize the deserializedAssessment after its creation', () => {
        // when
        const promise = controller.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(assessmentSerializer.serialize).to.have.been.calledWith(deserializedAssessment);
        });
      });

      it('should reply the serialized deserializedAssessment with code 201', () => {
        // when
        const promise = controller.save(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedAssessment);
          sinon.assert.calledWith(codeStub, 201);
        });
      });

    });

    describe('when the deserializedAssessment can not be saved', () => {

      let badImplementationStub;

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
              course: {
                data: {
                  id: 'recCourseId'
                }
              }
            }
          }
        }
      };

      beforeEach(() => {
        badImplementationStub = sinon.stub(Boom, 'badImplementation');
        sandbox.stub(assessmentRepository, 'save');
      });

      afterEach(() => {
        badImplementationStub.restore();
      });

      it('should return a badImplementationError', () => {
        // given
        const badImplementationMessage = { message: 'Boom: Bad Implementation' };
        badImplementationStub.returns(badImplementationMessage);
        const rejectedError = new Error();
        assessmentRepository.save.rejects(rejectedError);

        // when
        const promise = controller.save(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(badImplementationStub, rejectedError);
          sinon.assert.calledWith(replyStub, badImplementationMessage);
        });
      });
    });

  });

});
