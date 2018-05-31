const { expect, sinon } = require('../../../test-helper');
const certificationController = require('../../../../lib/application/certifications/certification-controller');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const usecases = require('../../../../lib/domain/usecases');
const errors = require('../../../../lib/domain/errors');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const Boom = require('boom');
const logger = require('../../../../lib/infrastructure/logger');
const factory = require('../../../factory');

const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Controller | certifications-controller', () => {

  let replyStub;
  let codeStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub,
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

  describe('#getCertification', () => {

    const certification = factory.buildCertification();
    const certifiedProfile = [
      {
        competenceName: 'Sécuriser',
        competenceIndex: '4.1',
        level: -1,
        areaIndex: '4',
        areaName: 'Protection',
      },
      {
        competenceName: 'Interagir',
        competenceIndex: '2.1',
        level: 2,
        areaIndex: '2',
        areaName: 'Communiquer et collaborer',
      },
    ];
    const serializedCertification = '{JSON}';
    const userId = 1;

    const request = {
      auth: { credentials: { userId } },
      params: { id: certification.id },
    };

    beforeEach(() => {
      sandbox.stub(usecases, 'getUserCertification');
      sandbox.stub(usecases, 'getUserCertifiedProfile');
      sandbox.stub(certificationSerializer, 'serialize').returns(serializedCertification);
      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certification when use case returns a certification', () => {
      // given
      usecases.getUserCertification.resolves(certification);
      usecases.getUserCertifiedProfile.resolves(certifiedProfile);

      // when
      const promise = certificationController.getCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getUserCertification).to.have.been.calledWith({
          userId,
          certificationId: certification.id,
          certificationRepository
        });
        expect(certificationSerializer.serialize).to.have.been.calledWith(certification, certifiedProfile);
        expect(replyStub).to.have.been.calledWith(serializedCertification);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });

    it('should return a 403 unauthorized when use case returns a user not authorized to access ressource error', () => {
      // given
      const jsonAPIError = {
        errors: [{
          detail: 'Vous n’avez pas accès à cette certification',
          code: '403',
          title: 'Unauthorized Access',
        }],
      };
      usecases.getUserCertification.rejects(new errors.UserNotAuthorizedToAccessEntity());

      // when
      const promise = certificationController.getCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonAPIError);
        expect(codeStub).to.have.been.calledWith(403);
      });
    });

    it('should return a 404 not found when use case returns a not found error', () => {
      // given
      const certificationID = '666';
      const request = {
        auth: { credentials: { userId } },
        params: { id: certificationID },
      };
      const jsonAPIError = {
        errors: [{
          detail: `Not found certification for ID ${certificationID}`,
          code: '404',
          title: 'Not Found',
        }],
      };
      usecases.getUserCertification.rejects(new errors.NotFoundError(`Not found certification for ID ${certificationID}`));

      // when
      const promise = certificationController.getCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonAPIError);
        expect(codeStub).to.have.been.calledWith(404);
      });
    });

    it('should reply a 500 error when something went wrong', () => {
      // given
      const error = new Error('Oh no...');
      const jsonAPIError = {
        errors: [{
          code: '500',
          detail: 'Oh no...',
          title: 'Internal Server Error',
        }],
      };
      usecases.getUserCertification.rejects(error);

      // when
      const promise = certificationController.getCertification(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonAPIError);
        expect(logger.error).to.have.been.calledWith(error);
      });
    });
  });

  describe('#updateCertification', () => {

    const certificationId = '28';
    const attributesToUpdate = {
      id: certificationId,
      isPublished: true,
    };
    const updatedCertification = {};
    const serializedCertification = {};

    const request = {
      params: {
        id: certificationId,
      },
      payload: {
        data: {
          type: Assessment.types.CERTIFICATION,
          id: certificationId,
          attributes: {
            'is-published': true,
          },
        },
      },
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
          certificationId, attributesToUpdate, certificationRepository,
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
