import { StatusesEnumValues } from '../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | OrganizationLearnerParticipation', function () {
  describe('#buildFromPassage', function () {
    it('should instantiate an OrganizationLearnerParticipation with passage data', function () {
      // given && when
      const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromPassage({
        id: 12,
        organizationLearnerId: 15,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        terminatedAt: new Date('2025-02-01'),
        deletedAt: new Date('2025-03-01'),
        deletedBy: 13,
        status: StatusesEnumValues.IN_PROGRESS,
        moduleId: 'abcdef-42',
      });

      // then
      expect(organizationLearnerParticipation).instanceOf(OrganizationLearnerParticipation);
      expect(organizationLearnerParticipation.id).to.equal(12);
      expect(organizationLearnerParticipation.organizationLearnerId).to.equal(15);
      expect(organizationLearnerParticipation.createdAt).deep.to.equal(new Date('2024-01-01'));
      expect(organizationLearnerParticipation.updatedAt).deep.to.equal(new Date('2025-01-01'));
      expect(organizationLearnerParticipation.completedAt).deep.to.equal(new Date('2025-02-01'));
      expect(organizationLearnerParticipation.deletedAt).deep.to.equal(new Date('2025-03-01'));
      expect(organizationLearnerParticipation.deletedBy).to.equal(13);
      expect(organizationLearnerParticipation.type).to.equal(OrganizationLearnerParticipationTypes.PASSAGE);
      expect(organizationLearnerParticipation.referenceId).deep.equal('abcdef-42');
    });

    describe('status', function () {
      it('should map IN_PROGRESS to STARTED status on OrganizationLearnerParticipation', function () {
        // given && when
        const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromPassage({
          status: StatusesEnumValues.IN_PROGRESS,
        });

        // then
        expect(organizationLearnerParticipation.status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
      });

      it('should map modules status COMPLETED to OrganizationLearnerParticipation COMPLETED status on OrganizationLearnerParticipation', function () {
        // given && when
        const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromPassage({
          status: StatusesEnumValues.COMPLETED,
        });

        // then
        expect(organizationLearnerParticipation.status).to.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      });

      it('should map modules status NOT_STARTED to OrganizationLearnerParticipation NOT_STARTED status on OrganizationLearnerParticipation', function () {
        // given && when
        const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromPassage({
          status: StatusesEnumValues.NOT_STARTED,
        });

        // then
        expect(organizationLearnerParticipation.status).to.equal(OrganizationLearnerParticipationStatuses.NOT_STARTED);
      });
    });
  });

  describe('#buildFromCombinedCourse', function () {
    it('should instantiate an OrganizationLearnerParticipation with combined course data', function () {
      // given && when
      const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromCombinedCourse({
        id: 12,
        organizationLearnerId: 15,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: new Date('2025-03-01'),
        deletedBy: 13,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId: 666,
      });

      // then
      expect(organizationLearnerParticipation).instanceOf(OrganizationLearnerParticipation);
      expect(organizationLearnerParticipation.id).to.equal(12);
      expect(organizationLearnerParticipation.organizationLearnerId).to.equal(15);
      expect(organizationLearnerParticipation.createdAt).deep.to.equal(new Date('2024-01-01'));
      expect(organizationLearnerParticipation.updatedAt).deep.to.equal(new Date('2025-01-01'));
      expect(organizationLearnerParticipation.completedAt).deep.to.equal(new Date('2025-01-01'));
      expect(organizationLearnerParticipation.deletedAt).deep.to.equal(new Date('2025-03-01'));
      expect(organizationLearnerParticipation.deletedBy).to.equal(13);
      expect(organizationLearnerParticipation.status).to.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
      expect(organizationLearnerParticipation.type).to.equal(OrganizationLearnerParticipationTypes.COMBINED_COURSE);
      expect(organizationLearnerParticipation.referenceId).deep.equal('666');
    });

    it('should instantiate completedAt to null when status is not COMPLETED', function () {
      // given && when
      const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromCombinedCourse({
        id: 12,
        organizationLearnerId: 15,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: new Date('2025-03-01'),
        deletedBy: 13,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: 666,
      });

      // then
      expect(organizationLearnerParticipation.completedAt).null;
    });
  });

  describe('fieldsForUpdate', function () {
    it('should return an object with the fields to update', function () {
      // given
      const organizationLearnerParticipation = new OrganizationLearnerParticipation({
        id: 12,
        organizationLearnerId: 15,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        referenceId: '666',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        completedAt: new Date('2025-01-01'),
      });

      //when
      const expectedFieldToUpdate = organizationLearnerParticipation.fieldsForUpdate;

      // then
      expect(expectedFieldToUpdate).to.deep.equal({
        id: 12,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        updatedAt: new Date('2025-01-01'),
        completedAt: new Date('2025-01-01'),
      });
    });
  });

  describe('isTerminated', function () {
    [
      { status: OrganizationLearnerParticipationStatuses.COMPLETED, expected: true },
      { status: OrganizationLearnerParticipationStatuses.NOT_STARTED, expected: false },
      { status: OrganizationLearnerParticipationStatuses.STARTED, expected: false },
    ].forEach(({ status, expected }) => {
      it(`should return ${expected} if status is ${status}`, function () {
        // given && when
        const organizationLearnerParticipation = new OrganizationLearnerParticipation({
          id: 12,
          organizationLearnerId: 15,
          status,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          referenceId: '666',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2025-01-01'),
          completedAt: new Date('2025-01-01'),
        });

        // then
        expect(organizationLearnerParticipation.isTerminated).equal(expected);
      });
    });
  });
});
