import sinon from 'sinon';

import * as organizationLearnerRepository from '../../../../../src/quest/infrastructure/repositories/organization-learner-repository.js';

describe('Quest | Unit | Infrastructure | Repositories | organization-learner', function () {
  describe('#findByUserId', function () {
    it('should return organization learners for a given user id', async function () {
      const userId = Symbol('userId');
      const result = Symbol('result');

      const organizationLearnerApiStub = { findByUserId: sinon.stub().withArgs({ userId }).resolves(result) };

      const queryResult = await organizationLearnerRepository.findByUserId({
        userId,
        dependencies: { organizationLearnerApi: organizationLearnerApiStub },
      });

      expect(queryResult).equal(result);
    });
  });
});
