const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const certificationController = require('../../../../lib/application/certifications/certification-controller');

const errors = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');
const Assessment = require('../../../../lib/domain/models/Assessment');

const logger = require('../../../../lib/infrastructure/logger');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');

describe('Unit | Controller | certifications-controller', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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

    beforeEach(() => {
      sandbox.stub(usecases, 'findCompletedUserCertifications');
      sandbox.stub(certificationSerializer, 'serialize').returns(serializedCertifications);
      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certifications array when use case return a array of Certifications', async () => {
      // given
      usecases.findCompletedUserCertifications.resolves(retrievedCertifications);

      // when
      const response = await certificationController.findUserCertifications(request, hFake);

      // then
      expect(usecases.findCompletedUserCertifications).to.have.been.calledWith({ userId });
      expect(certificationSerializer.serialize).to.have.been.calledWith(retrievedCertifications);
      expect(response).to.deep.equal(serializedCertifications);
    });

    it('should reply a 500 error when something went wrong', async () => {
      // given
      usecases.findCompletedUserCertifications.rejects(infraError);

      // when
      const promise = certificationController.findUserCertifications(request, hFake);

      // then
      await expect(promise).to.be.rejectedWith('Internal Server Error');
      expect(logger.error).to.have.been.calledWith(infraError);
    });
  });

  describe('#getCertification', () => {

    const certification = domainBuilder.buildCertificationWithCompetenceTree();
    const serializedCertification = '{JSON}';
    const userId = 1;

    const request = {
      auth: { credentials: { userId } },
      params: { id: certification.id },
    };

    beforeEach(() => {
      sandbox.stub(usecases, 'getUserCertificationWithResultTree');
      sandbox.stub(certificationSerializer, 'serialize').returns(serializedCertification);
      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certification when use case returns a certification', async () => {
      // given
      usecases.getUserCertificationWithResultTree.resolves(certification);

      // when
      const response = await certificationController.getCertification(request, hFake);

      // then
      expect(usecases.getUserCertificationWithResultTree).to.have.been.calledWith({
        userId,
        certificationId: certification.id,
      });
      expect(certificationSerializer.serialize).to.have.been.calledWith(certification);
      expect(response).to.deep.equal(serializedCertification);
    });

    it('should return a 403 unauthorized when use case returns a user not authorized to access ressource error', async () => {
      // given
      const jsonAPIError = {
        errors: [
          {
            detail: 'Vous n’avez pas accès à cette certification',
            code: '403',
            title: 'Unauthorized Access',
          },
        ],
      };
      usecases.getUserCertificationWithResultTree.rejects(new errors.UserNotAuthorizedToAccessEntity());

      // when
      const response = await certificationController.getCertification(request, hFake);

      // then
      expect(response.source).to.deep.equal(jsonAPIError);
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 404 not found when use case returns a not found error', async () => {
      // given
      const certificationID = '666';
      const request = {
        auth: { credentials: { userId } },
        params: { id: certificationID },
      };
      const jsonAPIError = {
        errors: [
          {
            detail: `Not found certification for ID ${certificationID}`,
            code: '404',
            title: 'Not Found',
          },
        ],
      };
      usecases.getUserCertificationWithResultTree.rejects(new errors.NotFoundError(`Not found certification for ID ${certificationID}`));

      // when
      const response = await certificationController.getCertification(request, hFake);

      // then
      expect(response.source).to.deep.equal(jsonAPIError);
      expect(response.statusCode).to.equal(404);
    });

    it('should reply a 500 error when something went wrong', async () => {
      // given
      const error = new Error('Oh no...');
      usecases.getUserCertificationWithResultTree.rejects(error);

      // when
      const promise = certificationController.getCertification(request, hFake);

      // then
      await expect(promise).to.be.rejectedWith('Oh no...');
      expect(logger.error).to.have.been.calledWith(error);
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

    beforeEach(() => {
      sandbox.stub(usecases, 'updateCertification');
      sandbox.stub(certificationSerializer, 'serialize');

      sandbox.stub(logger, 'error');
    });

    it('should return a serialized certification when update was successful', async () => {
      // given
      usecases.updateCertification.resolves(updatedCertification);
      certificationSerializer.serialize.returns(serializedCertification);

      // when
      const response = await certificationController.updateCertification(request, hFake);

      // then
      expect(usecases.updateCertification).to.have.been.calledWith({
        certificationId, attributesToUpdate,
      });
      expect(certificationSerializer.serialize).to.have.been.calledWith(updatedCertification);
      expect(response).to.deep.equal(serializedCertification);
    });

    it('should reply a 500 error when usecase updateCertification returns an error', async () => {
      // given
      usecases.updateCertification.rejects(usecaseError);

      // when
      const promise = certificationController.updateCertification(request, hFake);

      // then
      await expect(promise).to.be.rejectedWith('This is a critical error.');
      expect(logger.error).to.have.been.calledWith(usecaseError);
    });
  });
});
