const { expect, sinon } = require('../../../test-helper');
const Certification = require('../../../../lib/domain/models/Certification');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-certification', () => {

  const certificationId = '23';
  const certificationRepository = {};
  const attributesToUpdate = {
    isPublished: true
  };

  beforeEach(() => {
    certificationRepository.updateCertification = sinon.stub();
  });

  it('should call the repository to update the certification', () => {
    // given
    certificationRepository.updateCertification.resolves();

    // when
    const promise = usecases.updateCertification({
      certificationId,
      attributesToUpdate,
      certificationRepository
    });

    // then
    return promise.then(() => {
      expect(certificationRepository.updateCertification).to.have.been.calledWith({ id: '23', isPublished: true });
    });
  });
});

