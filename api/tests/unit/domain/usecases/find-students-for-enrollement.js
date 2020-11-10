const _ = require('lodash');
const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { ForbiddenAccess, NotFoundError } = require('../../../../lib/domain/errors');
const StudentForEnrollement = require('../../../../lib/domain/read-models/StudentForEnrollement');

const findStudentsForEnrollement = require('../../../../lib/domain/usecases/find-students-for-enrollement');

describe('Unit | UseCase | find-students-for-enrollement', () => {

  const certificationCenterId = 1;
  const userId = 'userId';
  let organization;

  const organizationRepository = {
    getIdByCertificationCenterId: sinon.stub(),
  };
  const schoolingRegistrationRepository = {
    findByOrganizationIdOrderByDivision: sinon.stub(),
  };

  const certificationCenterMembershipRepository = {
    doesUserHaveMembershipToCertificationCenter: sinon.stub(),
  };

  const certificationCandidateRepository = {
    findBySessionId: sinon.stub(),
  };

  beforeEach(async () => {
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    organizationRepository.getIdByCertificationCenterId
      .withArgs(certificationCenter.id).resolves(organization.id);

    certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter
      .withArgs(userId, certificationCenter.id).resolves(true);
  });

  describe('when user has access to certification center', () => {
    describe('when there is no certification center for the organization ', () => {
      it('should return an empty list of student', async () => {
        // given
        organizationRepository.getIdByCertificationCenterId.withArgs(certificationCenterId).rejects(new NotFoundError());

        // when
        const studentsFounds = await findStudentsForEnrollement({
          userId,
          certificationCenterId,
          organizationRepository,
          schoolingRegistrationRepository,
          certificationCenterMembershipRepository,
          certificationCandidateRepository,
        });

        // then
        expect(studentsFounds).to.deep.equal([]);
      });
    });

    it('should return all students, enrolled or enrollable, regarding a session', async () => {
      // given
      const sessionId = 3;
      const enrolledStudent = domainBuilder.buildSchoolingRegistration({ organization });
      const enrollableStudents = _.times(5, () => domainBuilder.buildSchoolingRegistration({ organization }));
      const certificationCandidates = [ domainBuilder.buildCertificationCandidate({ sessionId, schoolingRegistrationId: enrolledStudent.id }) ];
      schoolingRegistrationRepository.findByOrganizationIdOrderByDivision.withArgs({ organizationId: organization.id }).resolves([ enrolledStudent, ...enrollableStudents ]);
      certificationCandidateRepository.findBySessionId.withArgs(sessionId).resolves(certificationCandidates);

      // when
      const studentsFounds = await findStudentsForEnrollement({
        userId,
        certificationCenterId,
        sessionId,
        certificationCenterMembershipRepository,
        organizationRepository,
        schoolingRegistrationRepository,
        certificationCandidateRepository,
      });

      // then
      const expectedEnrolledStudent = new StudentForEnrollement({ ...enrolledStudent, isEnrolled: true });
      const exepectedEnrollableStudents = enrollableStudents.map((student) => new StudentForEnrollement({ ...student, isEnrolled: false }));
      const expectedStudents = [ expectedEnrolledStudent, ...exepectedEnrollableStudents ];
      expect(studentsFounds).to.be.deep.equal(expectedStudents);
    });

    context('when the linked organization has no student', () => {

      it('should return empty array', async () => {
        // given
        schoolingRegistrationRepository.findByOrganizationIdOrderByDivision
          .withArgs({ organizationId: organization.id }).resolves([]);

        // when
        const studentsFounds = await findStudentsForEnrollement({
          userId,
          certificationCenterId,
          organizationRepository,
          schoolingRegistrationRepository,
          certificationCenterMembershipRepository,
          certificationCandidateRepository,
        });

        // then
        expect(studentsFounds).to.be.deep.equal([]);
      });
    });
  });

  describe('when user does not have access to certification center', () => {
    it('should throw an access error', async () => {
      // given
      const wrongCertificationCenterId = 666;
      certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter
        .withArgs(userId, wrongCertificationCenterId).resolves(false);

      // when
      const error = await catchErr(usecases.findStudentsForEnrollement)({
        userId,
        certificationCenterId: wrongCertificationCenterId,
        organizationRepository,
        schoolingRegistrationRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });

});
