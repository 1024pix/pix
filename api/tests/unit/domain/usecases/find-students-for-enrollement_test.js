const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
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

  const certificationCandidateRepository = {
    findBySessionId: sinon.stub(),
  };

  beforeEach(async () => {
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    organizationRepository.getIdByCertificationCenterId
      .withArgs(certificationCenter.id).resolves(organization.id);
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
          page: { size: 10, number: 1 },
          organizationRepository,
          schoolingRegistrationRepository,
          certificationCandidateRepository,
        });

        // then
        expect(studentsFounds).to.deep.equal({
          data: [],
          pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
        });
      });
    });

    it('should return all students, enrolled or enrollable, regarding a session', async () => {
      // given
      const sessionId = 3;
      const enrolledStudent = domainBuilder.buildSchoolingRegistration({ organization, division: '3A' });
      const enrollableStudents = _.times(5, () => domainBuilder.buildSchoolingRegistration({ organization }));
      const certificationCandidates = [ domainBuilder.buildCertificationCandidate({ sessionId, schoolingRegistrationId: enrolledStudent.id }) ];
      schoolingRegistrationRepository.findByOrganizationIdOrderByDivision
        .withArgs({ page: { number: 1, size: 10 }, filter: { divisions: ['3A'] }, organizationId: organization.id })
        .resolves({
          data: [ enrolledStudent, ...enrollableStudents ],
          pagination: { page: 1, pageSize: 10, rowCount: 5, pageCount: 1 },
        });
      certificationCandidateRepository.findBySessionId.withArgs(sessionId).resolves(certificationCandidates);

      // when
      const studentsFounds = await findStudentsForEnrollement({
        userId,
        certificationCenterId,
        sessionId,
        page: { number: 1, size: 10 },
        filter: { divisions: ['3A'] },
        organizationRepository,
        schoolingRegistrationRepository,
        certificationCandidateRepository,
      });

      // then
      const expectedEnrolledStudent = new StudentForEnrollement({ ...enrolledStudent, isEnrolled: true });
      const exepectedEnrollableStudents = enrollableStudents.map((student) => new StudentForEnrollement({ ...student, isEnrolled: false }));
      const expectedStudents = [ expectedEnrolledStudent, ...exepectedEnrollableStudents ];
      expect(studentsFounds).to.be.deep.equal({
        data: expectedStudents,
        pagination: { page: 1, pageSize: 10, rowCount: 5, pageCount: 1 },
      });
    });

    context('when the linked organization has no student', () => {

      it('should return empty array', async () => {
        // given
        schoolingRegistrationRepository.findByOrganizationIdOrderByDivision
          .withArgs({ page: { number: 1, size: 10 }, filter: {}, organizationId: organization.id }).resolves({
            data: [],
            pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
          });

        // when
        const studentsFounds = await findStudentsForEnrollement({
          userId,
          certificationCenterId,
          page: { number: 1, size: 10 },
          filter: {},
          organizationRepository,
          schoolingRegistrationRepository,
          certificationCandidateRepository,
        });

        // then
        expect(studentsFounds).to.be.deep.equal({
          data: [],
          pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
        });
      });
    });
  });

});
