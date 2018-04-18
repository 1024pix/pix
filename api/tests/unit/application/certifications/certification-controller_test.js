const { expect, sinon } = require('../../../test-helper');
const certificationController = require('../../../../lib/application/certifications/certification-controller');
const usecases = require('../../../../lib/domain/usecases');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');

describe('Unit | Controller | certifications-controller', () => {

  describe('#findUserCertifications', function() {

    it('should return a serialized certifications array when use case return a array of Certifications', function() {
      // given
      const userId = 1;
      const request = {
        auth: {
          credentials : {
            userId
          }
        }
      };
      const retrievedCertifications = [];
      const serializedCertifications = [];
      const codeStub = sinon.stub();
      const replyStub = sinon.stub().returns({
        code : codeStub
      });
      sinon.stub(usecases, 'findCompletedUserCertifications').resolves(retrievedCertifications);
      sinon.stub(certificationSerializer, 'serializeCertification').returns(serializedCertifications);

      // when
      const promise = certificationController.findUserCertifications(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findCompletedUserCertifications).to.have.been.calledWith({userId});
        expect(certificationSerializer.serializeCertification).to.have.been.calledWith(retrievedCertifications);
        expect(replyStub).to.have.been.calledWith(serializedCertifications);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });
  });
});
