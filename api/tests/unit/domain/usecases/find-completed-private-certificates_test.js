const { expect, sinon, domainBuilder } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const PrivateCertificate = require('../../../../lib/domain/models/PrivateCertificate');
const findCompletedPrivateCertificates = require('../../../../lib/domain/usecases/find-completed-private-certificates');

describe('Unit | UseCase | find-completed-private-certificates', () => {

  const certificationRepository = {};
  const cleaCertificationResultRepository = {};
  const cleaCertificationResult = domainBuilder.buildCleaCertificationResult();

  beforeEach(() => {
    certificationRepository.findByUserId = sinon.stub();
    cleaCertificationResultRepository.get = sinon.stub().resolves(cleaCertificationResult);
  });

  it('should return all the needed informations about certifications', function() {
    // given
    const userId = 1;
    const assessmentResult = new AssessmentResult({
      pixScore: 23,
      status: 'rejected',
    });
    const completedCertificates = new PrivateCertificate({
      id: 1000,
      certificationCenter: 'Université des chocolats',
      date: '2000-02-12',
      isPublished: true,
      assessmentState: 'completed',
      assessmentResults: [assessmentResult],
    });
    certificationRepository.findByUserId.resolves([completedCertificates]);

    // when
    const promise = findCompletedPrivateCertificates({ userId, certificationRepository, cleaCertificationResultRepository });

    // then
    return promise.then((certifications) => {
      expect(certificationRepository.findByUserId).to.have.been.calledWith(userId);
      expect(certifications).to.have.lengthOf(1);
      expect(certifications[0].id).to.equal(1000);
      expect(certifications[0].cleaCertificationResult).to.deep.equal(cleaCertificationResult);
    });
  });
});
