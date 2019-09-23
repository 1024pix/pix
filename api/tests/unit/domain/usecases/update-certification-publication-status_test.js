const { expect, sinon } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../../lib/domain/models/Certification');
const updateCertificationPublicationStatus = require('../../../../lib/domain/usecases/update-certification-publication-status');

describe('Unit | UseCase | update-certification-publication-status', () => {

  const certificationId = '23';
  const certificationRepository = {};
  const isPublished = true;

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
    certificationRepository.updatePublicationStatus = sinon.stub();
  });

  it('should call the repository to update the certification', () => {
    // given
    certificationRepository.updatePublicationStatus.resolves(certification);

    // when
    const promise = updateCertificationPublicationStatus({
      certificationId,
      isPublished,
      certificationRepository
    });

    // then
    return promise.then((result) => {
      expect(certificationRepository.updatePublicationStatus).to.have.been.calledWith({
        id: '23',
        isPublished: true,
      });
      expect(result).to.equal(certification);
    });
  });
});

