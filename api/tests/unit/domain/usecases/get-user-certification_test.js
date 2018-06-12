const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-user-certification', () => {

  const userId = '2';
  const certificationId = '23';
  const certificationRepository = {
    getCertification: () => undefined,
  };

  beforeEach(() => {
    certificationRepository.getCertification = sinon.stub();
  });

  it('should get the certification from the repository', () => {
    // given
    const certification = factory.buildCertification({ userId: parseInt(userId, 10) });
    certificationRepository.getCertification.resolves(certification);

    // when
    const promise = usecases.getUserCertification({ certificationId, certificationRepository, userId });

    // then
    return promise.then(() => {
      expect(certificationRepository.getCertification).to.have.been.calledWith({ id: certificationId });
    });
  });

  context('when the user is owner of the certification', () => {

    it('should return the certification returned from the repository', () => {
      // given
      const certification = factory.buildCertification({ userId: parseInt(userId, 10) });
      certificationRepository.getCertification.resolves(certification);

      // when
      const promise = usecases.getUserCertification({ certificationId, certificationRepository, userId });

      // then
      return promise.then((retreivedCertification) => {
        expect(retreivedCertification).to.equal(certification);
      });
    });
  });

  context('when the user is not owner of the certification', () => {

    it('should throw an unauthorized error', () => {
      // given
      const certification = factory.buildCertification({ userId: '666' });
      certificationRepository.getCertification.resolves(certification);

      // when
      const promise = usecases.getUserCertification({ certificationId, certificationRepository, userId });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

});

