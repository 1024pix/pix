import { ReconcileCommonOrganizationLearnerError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearner.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | CommonOrganizationLearner', function () {
  describe('#constructor', function () {
    it('should create a CommonOrganizationLearner from parameters', function () {
      // given
      const input = {
        id: 1,
        userId: 2,
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
        email: 'test@example.net',
        'date de naissance': '2000-01-01',
      };

      // when
      const learner = new CommonOrganizationLearner(input);

      // then
      expect(learner).to.deep.equal({
        id: input.id,
        userId: input.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        organizationId: input.organizationId,
        attributes: {
          email: 'test@example.net',
          'date de naissance': '2000-01-01',
        },
      });
    });

    it('should create a CommonOrganizationLearner without id and userId', function () {
      // given
      const input = {
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
        email: 'test@example.net',
        'date de naissance': '2000-01-01',
      };

      // when
      const learner = new CommonOrganizationLearner(input);

      // then
      expect(learner).to.deep.equal({
        firstName: input.firstName,
        lastName: input.lastName,
        organizationId: input.organizationId,
        attributes: {
          email: 'test@example.net',
          'date de naissance': '2000-01-01',
        },
      });
    });
  });

  describe('#reconcileUser', function () {
    it('should throw if user is already reconcile', function () {
      // given
      const learner = new CommonOrganizationLearner({
        id: 1,
        userId: 2,
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
      });

      // then
      expect(() => learner.reconcileUser(1)).to.throw(ReconcileCommonOrganizationLearnerError);
    });

    it('should update the userId', function () {
      const userId = Symbol('user-id');
      // given
      const learner = new CommonOrganizationLearner({
        id: 1,
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
      });

      // when
      learner.reconcileUser(userId);

      // then
      expect(learner.userId).to.be.equal(userId);
    });
  });

  describe('#isEqual', function () {
    const learnerAttributes = {
      firstName: 'Kimberley',
      lastName: 'Tartine',
      organizationId: 3,
      email: 'test@example.net',
    };
    context('same learner', function () {
      it('returns true if learners are equals', function () {
        const learnerA = new CommonOrganizationLearner(learnerAttributes);
        const learnerB = new CommonOrganizationLearner({ ...learnerAttributes });
        expect(learnerA.isEqual(learnerB)).true;
      });
    });
    context('different learners', function () {
      it('returns false if firstName is different', function () {
        const learnerA = new CommonOrganizationLearner(learnerAttributes);
        const learnerB = new CommonOrganizationLearner({ ...learnerAttributes, firstName: 'firstName' });
        expect(learnerA.isEqual(learnerB)).false;
      });
      it('returns false if lastName is different', function () {
        const learnerA = new CommonOrganizationLearner(learnerAttributes);
        const learnerB = new CommonOrganizationLearner({ ...learnerAttributes, lastName: 'lastName' });
        expect(learnerA.isEqual(learnerB)).false;
      });
      it('returns false if organizationId is different', function () {
        const learnerA = new CommonOrganizationLearner(learnerAttributes);
        const learnerB = new CommonOrganizationLearner({ ...learnerAttributes, organizationId: 1 });
        expect(learnerA.isEqual(learnerB)).false;
      });
      it('returns false if attributes are different', function () {
        const learnerA = new CommonOrganizationLearner(learnerAttributes);
        const learnerB = new CommonOrganizationLearner({ ...learnerAttributes, email: 'email@example.net' });
        expect(learnerA.isEqual(learnerB)).false;
      });
    });
  });
});
