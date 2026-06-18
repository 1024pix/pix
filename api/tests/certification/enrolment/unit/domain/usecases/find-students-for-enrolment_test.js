import _ from 'lodash';
import sinon from 'sinon';

import { StudentForEnrolment } from '../../../../../../src/certification/enrolment/domain/read-models/StudentForEnrolment.js';
import { findStudentsForEnrolment } from '../../../../../../src/certification/enrolment/domain/usecases/find-students-for-enrolment.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | find-students-for-enrolment', function () {
  const certificationCenterId = 1;
  const userId = 'userId';
  let organization;
  let centerRepository, organizationLearnerRepository, candidateRepository;

  beforeEach(async function () {
    centerRepository = {
      findActiveScoOrganizationId: sinon.stub(),
    };
    organizationLearnerRepository = {
      findByOrganizationIdAndUpdatedAtOrderByDivision: sinon.stub(),
    };
    candidateRepository = {
      findBySessionId: sinon.stub(),
    };
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    centerRepository.findActiveScoOrganizationId
      .withArgs({ certificationCenterId: certificationCenter.id })
      .resolves(organization.id);
  });

  describe('when user has access to certification center', function () {
    describe('when there is no active sco organization for the certification center', function () {
      it('should return an empty list of student', async function () {
        // given
        centerRepository.findActiveScoOrganizationId.withArgs({ certificationCenterId }).resolves(null);

        // when
        const studentsFounds = await findStudentsForEnrolment({
          userId,
          certificationCenterId,
          page: { size: 10, number: 1 },
          centerRepository,
          organizationLearnerRepository,
          candidateRepository,
        });

        // then
        expect(studentsFounds).to.deep.equal({
          data: [],
          pagination: { page: 1, pageSize: 10, rowCount: 0, pageCount: 0 },
        });
      });
    });

    it('should return all students, enrolled or enrollable, regarding a session', async function () {
      // given
      const sessionId = 3;
      const enrolledStudent = domainBuilder.buildOrganizationLearner({ id: 10, organization, division: '3A' });
      const enrolableStudents = _.times(5, (iteration) =>
        domainBuilder.buildOrganizationLearner({ id: iteration, organization }),
      );
      const candidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          sessionId,
          organizationLearnerId: enrolledStudent.id,
        }),
      ];
      organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision
        .withArgs({ page: { number: 1, size: 10 }, filter: { divisions: ['3A'] }, organizationId: organization.id })
        .resolves({
          data: [enrolledStudent, ...enrolableStudents],
          pagination: { page: 1, pageSize: 10, rowCount: 5, pageCount: 1 },
        });
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves(candidates);

      // when
      const studentsFounds = await findStudentsForEnrolment({
        userId,
        certificationCenterId,
        sessionId,
        page: { number: 1, size: 10 },
        filter: { divisions: ['3A'] },
        centerRepository,
        organizationLearnerRepository,
        candidateRepository,
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
          centerRepository,
          organizationLearnerRepository,
          candidateRepository,
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
