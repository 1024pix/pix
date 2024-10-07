import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | TargetProfileSummaryForAdmin', function () {
  describe('#canDetach', function () {
    describe('should returns true', function () {
      it('when target profile is not public and organizationOwnerId is different from sharedOrganizationId', function () {
        // given
        const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
          ownerOrganisationId: 1,
          sharedOrganizationId: 2,
        });

        // then
        expect(targetProfileSummary.canDetach).to.be.true;
      });
    });

    describe('should returns false', function () {
      it('when target profile ownerOrganizationId equals sharedOrgnizationId ', function () {
        // given
        const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
          sharedOrganizationId: 1,
          ownerOrganizationId: 1,
        });

        // then
        expect(targetProfileSummary.canDetach).to.be.false;
      });
    });
  });
});
