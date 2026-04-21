import sinon from 'sinon';

import { CouldNotDeleteLearnersError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationLearnerList } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerList.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Models | OrganizationLearnerListFormat', function () {
  describe('#constructor', function () {
    it('should initialize valid object', function () {
      //when
      const payload = {
        organizationId: Symbol('organizationId'),
        organizationLearners: Symbol('organizationLearnerList'),
      };
      const organizationLearnerList = new OrganizationLearnerList(payload);
      // then
      expect(organizationLearnerList).to.deep.equal(payload);
    });
  });

  describe('#getDeletableOrganizationLearners', function () {
    context('when all given organizationLearnerIds are from organization', function () {
      it('should return organization learners', function () {
        // given
        const payload = {
          organizationId: 777,
          organizationLearners: [{ id: 123 }, { id: 345 }],
        };

        const organizationLearnerList = new OrganizationLearnerList(payload);

        // when
        const result = organizationLearnerList.getDeletableOrganizationLearners([123, 345]);

        // then
        expect(result).to.be.deep.equal([{ id: 123 }, { id: 345 }]);
      });
    });

    context('when some organizationLearnerIds belong to organization', function () {
      it('should throw', function () {
        sinon.stub(logger, 'error');

        //when
        const organizationLearnerList = new OrganizationLearnerList({
          organizationId: 777,
          organizationLearners: [{ id: 123 }],
        });

        const result = catchErrSync(organizationLearnerList.getDeletableOrganizationLearners, organizationLearnerList)(
          [123, 453],
          'userIdSample',
        );

        expect(result).to.be.instanceof(CouldNotDeleteLearnersError);
        expect(logger.error).to.have.calledWithExactly(
          "User id userIdSample could not delete organization learners because some learner id in (123,453) don't belong to organization id 777",
        );
      });
    });
  });
});
