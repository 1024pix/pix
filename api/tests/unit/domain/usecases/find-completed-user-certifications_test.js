const { expect, sinon } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../../lib/domain/models/Certification');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | find-completed-user-certifications', () => {

  const certificationRepository = {};

  beforeEach(() => {
    certificationRepository.findCertificationsByUserId = sinon.stub();
  });

  it('should return all the needed informations about certifications', function() {
    // given
    const userId = 1;
    const assessmentResult = new AssessmentResult({
      pixScore: 23,
      status: 'rejected'
    });
    const toFilterCertifications = new Certification({
      id: 123,
      certificationCenter: 'Université des chocolats',
      date: '12/02/2000',
      isPublished: true,
      assessmentState: 'started',
      assessmentResults: [assessmentResult]
    });
    const completedCertifications = new Certification({
      id: 1000,
      certificationCenter: 'Université des chocolats',
      date: '12/02/2000',
      isPublished: true,
      assessmentState: 'completed',
      assessmentResults: [assessmentResult]
    });
    certificationRepository.findCertificationsByUserId.resolves([toFilterCertifications, completedCertifications]);

    // when
    const promise = usecases.findCompletedUserCertifications({ userId, certificationRepository });

    // then
    return promise.then((certifications) => {
      expect(certificationRepository.findCertificationsByUserId).to.have.been.calledWith(userId);
      expect(certifications).to.have.lengthOf(1);
      expect(certifications[0].id).to.equal(1000);
    });
  });
});
