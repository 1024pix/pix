const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const certificationController = require('../../../../lib/application/certifications/certification-controller');

const usecases = require('../../../../lib/domain/usecases');
const Assessment = require('../../../../lib/domain/models/Assessment');

const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');

describe('Unit | Controller | certifications-controller', () => {

  describe('#findUserCertifications', () => {

    const retrievedCertifications = [];
    const serializedCertifications = [];
    const userId = 1;

    const request = { auth: { credentials: { userId } } };

    beforeEach(() => {
      sinon.stub(usecases, 'findCompletedUserCertifications');
      sinon.stub(certificationSerializer, 'serialize').returns(serializedCertifications);
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
      sinon.stub(usecases, 'getUserCertificationWithResultTree');
      sinon.stub(certificationSerializer, 'serialize').returns(serializedCertification);
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

    beforeEach(() => {
      sinon.stub(usecases, 'updateCertification');
      sinon.stub(certificationSerializer, 'serialize');
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
  });
});
