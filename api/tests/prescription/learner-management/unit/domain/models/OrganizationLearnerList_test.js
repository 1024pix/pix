import { CouldNotDeleteLearnersError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationLearnerList } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerList.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErrSync, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Models | OrganizationLearnerListFormat', function () {
  describe('#constructor', function () {
    it('should initialize valid object', function () {
      //when
      const payload = {
        organizationId: Symbol('organizationId'),
        organizationLearnerIds: Symbol('organizationLearnerList'),
      };
      const organizationLearnerList = new OrganizationLearnerList(payload);
      // then
      expect(organizationLearnerList).to.deep.equal(payload);
    });
  });

  describe('#can delete organization learners ', function () {
    it('should throw when lists are different', function () {
      sinon.stub(logger, 'error');
      //when
      const payload = {
        organizationId: 777,
        organizationLearnerIds: [123, 345],
      };

      const organizationLearnerList = new OrganizationLearnerList(payload);

      const result = catchErrSync(organizationLearnerList.canDeleteOrganizationLearners, organizationLearnerList)(
        [456, 123],
        'userIdSample',
      );

      expect(result).to.be.instanceof(CouldNotDeleteLearnersError);
      expect(
        logger.error.calledWithExactly(
          `User id userIdSample could not delete organization learners because learner id 345 don't belong to organization id 777`,
        ),
      );
    });

    it('should not throw when lists are identical', function () {
      const userId = Symbol('123');

      const payload = {
        organizationId: Symbol('organizationId'),
        organizationLearnerIds: [123, 345],
      };

      expect(() => {
        const organizationLearnerList = new OrganizationLearnerList(payload);
        organizationLearnerList.canDeleteOrganizationLearners([123, 345], userId);
      }).to.not.throw();
    });
  });
});
