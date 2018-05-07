const { expect, sinon } = require('../../../test-helper');
const certificationController = require('../../../../lib/application/certifications/certification-controller');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const usecases = require('../../../../lib/domain/usecases');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const Boom = require('boom');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | certifications-controller', () => {

  let replyStub;
  let codeStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#findUserCertifications', () => {

    const retrievedCertifications = [];
    const serializedCertifications = [];
    const userId = 1;

    const request = { auth: { credentials: { userId } } };

    const infraError = new Error();
    const jsonAPI500error = { message: 'Internal Error' };

    beforeEach(() => {
      sandbox.stub(usecases, 'findCompletedUserCertifications');
      sandbox.stub(certificationSerializer, 'serialize').returns(serializedCertifications);
      sandbox.stub(Boom, 'badImplementation').returns(jsonAPI500error);
      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certifications array when use case return a array of Certifications', () => {
      // given
      usecases.findCompletedUserCertifications.resolves(retrievedCertifications);

      // when
      const promise = certificationController.findUserCertifications(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findCompletedUserCertifications).to.have.been.calledWith({ userId, certificationRepository });
        expect(certificationSerializer.serialize).to.have.been.calledWith(retrievedCertifications);
        expect(replyStub).to.have.been.calledWith(serializedCertifications);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });

    it('should reply a 500 error when something went wrong', () => {
      // given
      usecases.findCompletedUserCertifications.rejects(infraError);

      // when
      const promise = certificationController.findUserCertifications(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonAPI500error);
        expect(logger.error).to.have.been.calledWith(infraError);
      });
    });
  });

  describe('#updateCertification', () => {

    const certificationId = '28';
    const attributesToUpdate = {
      id: '28',
      isPublished: true
    };
    const updatedCertification = {};
    const serializedCertification = {};

    const request = {
      params: {
        id: certificationId
      },
      payload: {
        data: {
          type: 'certification',
          id: certificationId,
          attributes: {
            'is-published': true
          }
        }
      }
    };

    const usecaseError = new Error('This is a critical error.');
    const boomError = { message: 'Internal Error' };

    beforeEach(() => {
      sandbox.stub(usecases, 'updateCertification');
      sandbox.stub(certificationSerializer, 'serialize');
      sandbox.stub(Boom, 'badImplementation').returns(boomError);
      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certification when update was successful', () => {
      // given
      usecases.updateCertification.resolves(updatedCertification);
      certificationSerializer.serialize.returns(serializedCertification);

      // when
      const promise = certificationController.updateCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.updateCertification).to.have.been.calledWith({
          certificationId, attributesToUpdate, certificationRepository
        });
        expect(certificationSerializer.serialize).to.have.been.calledWith(updatedCertification);
        expect(replyStub).to.have.been.calledWith(serializedCertification);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });

    it('should reply a 500 error when usecase updateCertification returns an error', () => {
      // given
      usecases.updateCertification.rejects(usecaseError);

      // when
      const promise = certificationController.updateCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(boomError);
        expect(logger.error).to.have.been.calledWith(usecaseError);
      });
    });
  });
});
