const { expect, sinon } = require('../../../test-helper');
const certificationController = require('../../../../lib/application/certifications/certification-controller');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const usecases = require('../../../../lib/domain/usecases');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const Boom = require('boom');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | certifications-controller', () => {

  describe('#findUserCertifications', function() {

    let sandbox;

    const retrievedCertifications = [];
    const serializedCertifications = [];
    const userId = 1;

    const request = { auth: { credentials: { userId } } };
    const codeStub = sinon.stub();
    const replyStub = sinon.stub().returns({
      code: codeStub
    });

    const infraError = new Error();
    const jsonAPI500error = { message: 'Internal Error' };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(usecases, 'findCompletedUserCertifications');
      sandbox.stub(certificationSerializer, 'serializeCertification').returns(serializedCertifications);
      sandbox.stub(certificationRepository, 'findByUserId').resolves();
      sandbox.stub(Boom, 'badImplementation').returns(jsonAPI500error);
      sandbox.stub(logger, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a serialized certifications array when use case return a array of Certifications', function() {
      // given
      usecases.findCompletedUserCertifications.resolves(retrievedCertifications);

      // when
      const promise = certificationController.findUserCertifications(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findCompletedUserCertifications).to.have.been.calledWith({ userId, certificationRepository });
        expect(certificationSerializer.serializeCertification).to.have.been.calledWith(retrievedCertifications);
        expect(replyStub).to.have.been.calledWith(serializedCertifications);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });

    it('should reply a 500 error when something went wrong', function() {
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
});
