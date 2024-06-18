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
});
