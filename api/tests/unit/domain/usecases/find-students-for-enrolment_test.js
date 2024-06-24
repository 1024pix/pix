import _ from 'lodash';

import { NotFoundError } from '../../../../lib/domain/errors.js';
import { StudentForEnrolment } from '../../../../lib/domain/read-models/StudentForEnrolment.js';
import { findStudentsForEnrolment } from '../../../../lib/domain/usecases/find-students-for-enrolment.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | find-students-for-enrolment', function () {
  const certificationCenterId = 1;
  const userId = 'userId';
  let organization;
  let organizationRepository, organizationLearnerRepository, certificationCandidateRepository;

  beforeEach(async function () {
    organizationRepository = {
      getIdByCertificationCenterId: sinon.stub(),
    };
    organizationLearnerRepository = {
      findByOrganizationIdAndUpdatedAtOrderByDivision: sinon.stub(),
    };
    certificationCandidateRepository = {
      findBySessionId: sinon.stub(),
    };
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    organizationRepository.getIdByCertificationCenterId.withArgs(certificationCenter.id).resolves(organization.id);
  });

  describe('when user has access to certification center', function () {
    describe('when there is no certification center for the organization ', function () {
      it('should return an empty list of student', async function () {
        // given
        organizationRepository.getIdByCertificationCenterId
          .withArgs(certificationCenterId)
          .rejects(new NotFoundError());

        // when
        const studentsFounds = await findStudentsForEnrolment({
          userId,
          certificationCenterId,
          page: { size: 10, number: 1 },
          organizationRepository,
          organizationLearnerRepository,
          certificationCandidateRepository,
        });

        // then
        expect(studentsFounds).to.deep.equal({
          data: [],
          pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
        });
      });
    });

    it('should return all students, enrolled or enrolable, regarding a session', async function () {
      // given
      const sessionId = 3;
      const enrolledStudent = domainBuilder.buildOrganizationLearner({ id: 10, organization, division: '3A' });
      const enrolableStudents = _.times(5, (iteration) =>
        domainBuilder.buildOrganizationLearner({ id: iteration, organization }),
      );
      const certificationCandidates = [
        domainBuilder.buildCertificationCandidate({
          sessionId,
          organizationLearnerId: enrolledStudent.id,
          subscriptions: [domainBuilder.buildCoreSubscription()],
        }),
      ];
      organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision
        .withArgs({ page: { number: 1, size: 10 }, filter: { divisions: ['3A'] }, organizationId: organization.id })
        .resolves({
          data: [enrolledStudent, ...enrolableStudents],
          pagination: { page: 1, pageSize: 10, rowCount: 5, pageCount: 1 },
        });
      certificationCandidateRepository.findBySessionId.withArgs(sessionId).resolves(certificationCandidates);

      // when
      const studentsFounds = await findStudentsForEnrolment({
        userId,
        certificationCenterId,
        sessionId,
        page: { number: 1, size: 10 },
        filter: { divisions: ['3A'] },
        organizationRepository,
        organizationLearnerRepository,
        certificationCandidateRepository,
      });

      // then
      const expectedEnrolledStudent = new StudentForEnrolment({ ...enrolledStudent, isEnrolled: true });
      const exepectedEnrollableStudents = enrolableStudents.map(
        (student) => new StudentForEnrolment({ ...student, isEnrolled: false }),
      );
      const expectedStudents = [expectedEnrolledStudent, ...exepectedEnrollableStudents];
      expect(studentsFounds).to.be.deep.equal({
        data: expectedStudents,
        pagination: { page: 1, pageSize: 10, rowCount: 5, pageCount: 1 },
      });
    });

    context('when the linked organization has no student', function () {
      it('should return empty array', async function () {
        // given
        organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision
          .withArgs({ page: { number: 1, size: 10 }, filter: {}, organizationId: organization.id })
          .resolves({
            data: [],
            pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
          });

        // when
        const studentsFounds = await findStudentsForEnrolment({
          userId,
          certificationCenterId,
          page: { number: 1, size: 10 },
          filter: {},
          organizationRepository,
          organizationLearnerRepository,
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
