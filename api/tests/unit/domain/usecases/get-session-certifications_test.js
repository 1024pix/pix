const { expect, sinon } = require('../../../test-helper');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const certificationService = require('../../../../lib/domain/services/certification-service');
const getSessionCertifications = require('../../../../lib/domain/usecases/get-session-certifications');

describe('Unit | Domain | Use Cases | get-session-certifications', () => {

  const sessionId = 'sessionId';
  const certificationCourseIds = ['certifCourseId1', 'certifCourseId2'];
  const certifications = ['resultId1', 'resultId2'];

  beforeEach(() => {
    // given
    sinon.stub(certificationCourseRepository, 'findIdsBySessionId').withArgs(sessionId).resolves(certificationCourseIds);
    const certificationServiceStub = sinon.stub(certificationService, 'getCertificationResult');
    certificationServiceStub.withArgs(certificationCourseIds[0]).resolves(certifications[0]);
    certificationServiceStub.withArgs(certificationCourseIds[1]).resolves(certifications[1]);
  });

  it('should return the product of the certification service calls in an array', async () => {
    // when
    const result = await getSessionCertifications({ sessionId, certificationCourseRepository });

    // then
    expect(result).to.have.members(certifications);
  });

});
