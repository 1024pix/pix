const { expect, sinon } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../../lib/domain/models/Certification');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | update-certification', () => {

  const certificationId = '23';
  const certificationRepository = {};
  const attributesToUpdate = {
    isPublished: true
  };

  const assessmentResult = new AssessmentResult({
    pixScore: 23,
    status: 'rejected'
  });
  const certification = new Certification({
    id: 123,
    certificationCenter: 'Université des chocolats',
    date: '12/02/2000',
    isPublished: true,
    assessmentState: 'completed',
    assessmentResults: [assessmentResult]
  });

  beforeEach(() => {
    certificationRepository.updateCertification = sinon.stub();
  });

  it('should call the repository to update the certification', () => {
    // given
    certificationRepository.updateCertification.resolves(certification);

    // when
    const promise = usecases.updateCertification({
      certificationId,
      attributesToUpdate,
      certificationRepository
    });

    // then
    return promise.then((result) => {
      expect(certificationRepository.updateCertification).to.have.been.calledWith({
        id: '23',
        attributes: { isPublished: true }
      });
      expect(result).to.equal(certification);
    });
  });
});

