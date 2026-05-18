import { ReconcileLearnerFromGenericImportError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { GenericOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/GenericOrganizationLearner.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | GenericOrganizationLearner', function () {
  describe('#constructor', function () {
    it('should create a GenericOrganizationLearner from parameters', function () {
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
      const learner = new GenericOrganizationLearner(input);

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

    it('should create a GenericOrganizationLearner without id and userId', function () {
      // given
      const input = {
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
        email: 'test@example.net',
        'date de naissance': '2000-01-01',
      };

      // when
      const learner = new GenericOrganizationLearner(input);

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
      const learner = new GenericOrganizationLearner({
        id: 1,
        userId: 2,
        firstName: 'Kimberley',
        lastName: 'Tartine',
        organizationId: 3,
      });

      // then
      expect(() => learner.reconcileUser(1)).to.throw(ReconcileLearnerFromGenericImportError);
    });

    it('should update the userId', function () {
      const userId = Symbol('user-id');
      // given
      const learner = new GenericOrganizationLearner({
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
