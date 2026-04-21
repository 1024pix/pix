import sinon from 'sinon';

import { hasBeenLearner } from '../../../../../../src/prescription/learner-management/domain/usecases/has-been-learner.js';

describe('Unit | Prescription | Learner Management | UseCase | has-been-learner', function () {
  let organizationLearnerRepository, userId;

  beforeEach(function () {
    organizationLearnerRepository = {
      countByUserId: sinon.stub(),
    };
    userId = 1;
  });

  context('when user has been linked to at least one organization learner', function () {
    beforeEach(function () {
      organizationLearnerRepository.countByUserId.resolves(1);
    });

    it('should return true', async function () {
      // when
      const result = await hasBeenLearner({ userId, organizationLearnerRepository });

      // then
      expect(result).to.be.true;
      expect(organizationLearnerRepository.countByUserId).to.have.been.calledOnceWith(userId);
    });
  });

  context('when user has not been linked to an organization learner', function () {
    beforeEach(function () {
      organizationLearnerRepository.countByUserId.resolves(0);
    });

    it('should return false', async function () {
      // when
      const result = await hasBeenLearner({ userId, organizationLearnerRepository });

      // then
      expect(result).to.be.false;
      expect(organizationLearnerRepository.countByUserId).to.have.been.calledOnceWith(userId);
    });
  });
});
