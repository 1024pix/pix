import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { ScoOrganizationLearnerSet } from '../../../../../../src/prescription/learner-management/domain/models/ScoOrganizationLearnerSet.js';
import { Student } from '../../../../../../src/shared/domain/models/Student.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | ScoOrganizationLearnerSet', function () {
  describe('#reconcile', function () {
    it('returns learners unchanged when there are no reconciled students', function () {
      const learner = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId: 1 });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.undefined;
    });

    it('assigns userId when reconciled student is from the same organization', function () {
      const organizationId = 1;
      const learner = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE1',
        account: { userId: 42, organizationId, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.equal(42);
    });

    it('assigns userId when reconciled student is from a different organization but has the same birthdate', function () {
      const learner = new OrganizationLearner({
        nationalStudentId: 'INE1',
        organizationId: 1,
        birthdate: '2000-01-01',
      });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE1',
        account: { userId: 42, organizationId: 99, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.equal(42);
    });

    it('does not assign userId when reconciled student is from a different organization with a different birthdate', function () {
      const learner = new OrganizationLearner({
        nationalStudentId: 'INE1',
        organizationId: 1,
        birthdate: '2000-01-01',
      });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE1',
        account: { userId: 42, organizationId: 99, birthdate: '1995-06-15' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.undefined;
    });

    it('sets userId to null on a learner already reconciled with the same userId in the import batch', function () {
      const learner1 = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId: 1, userId: 42 });
      const learner2 = new OrganizationLearner({ nationalStudentId: 'INE2', organizationId: 1 });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE2',
        account: { userId: 42, organizationId: 1, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner1, learner2]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.null;
    });

    it('ignores reconciled students absent from the current chunk without throwing', function () {
      // reconciledStudents is computed over the whole file while a set only holds one chunk,
      // so a reconciled student may not have any matching learner in this chunk.
      const learner = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId: 1 });
      const reconciledStudentInOtherChunk = new Student({
        nationalStudentId: 'INE_FROM_OTHER_CHUNK',
        account: { userId: 42, organizationId: 1, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      expect(() => scoOrganizationLearnerSet.reconcile([reconciledStudentInOtherChunk], [])).to.not.throw();
      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.undefined;
    });

    it('does not assign userId when the user has multiple national student IDs in reconciled students', function () {
      const learner1 = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId: 1 });
      const learner2 = new OrganizationLearner({ nationalStudentId: 'INE2', organizationId: 1 });
      const reconciledStudent1 = new Student({
        nationalStudentId: 'INE1',
        account: { userId: 42, organizationId: 1, birthdate: '2000-01-01' },
      });
      const reconciledStudent2 = new Student({
        nationalStudentId: 'INE2',
        account: { userId: 42, organizationId: 1, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner1, learner2]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent1, reconciledStudent2], []);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.undefined;
      expect(scoOrganizationLearnerSet.learners[1].userId).to.be.undefined;
    });

    it('does not assign userId when the user is already reconciled in the organization with a different national student ID', function () {
      const organizationId = 1;
      const learner = new OrganizationLearner({ nationalStudentId: 'INE2', organizationId });
      const existingLearnerInOrg = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId, userId: 42 });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE2',
        account: { userId: 42, organizationId, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], [existingLearnerInOrg]);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.be.undefined;
    });

    it('assigns userId when the user is already reconciled in the organization with the same national student ID', function () {
      const organizationId = 1;
      const learner = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId });
      const existingLearnerInOrg = new OrganizationLearner({ nationalStudentId: 'INE1', organizationId, userId: 42 });
      const reconciledStudent = new Student({
        nationalStudentId: 'INE1',
        account: { userId: 42, organizationId, birthdate: '2000-01-01' },
      });
      const scoOrganizationLearnerSet = new ScoOrganizationLearnerSet([learner]);

      scoOrganizationLearnerSet.reconcile([reconciledStudent], [existingLearnerInOrg]);

      expect(scoOrganizationLearnerSet.learners[0].userId).to.equal(42);
    });
  });
});
