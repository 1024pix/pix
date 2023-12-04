import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Models | TargetProfileSummaryForAdmin', function () {
  describe('#canDetach', function () {
    describe('should returns true', function () {
      it('when target profile is not public and organizationOwnerId is different from sharedOrganizationId', function () {
        // given
        const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
          isPublic: false,
          ownerOrganisationId: 1,
          sharedOrganizationId: 2,
        });

        // then
        expect(targetProfileSummary.canDetach).to.be.true;
      });
    });
    describe('should returns false', function () {
      it('when target profile is public', function () {
        // given
        const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
          isPublic: false,
        });

        // then
        expect(targetProfileSummary.canDetach).to.be.false;
      });
      it('when target profile is not public and is ownerOrganizationId equals sharedOrgnizationId ', function () {
        // given
        const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
          isPublic: false,
          sharedOrganizationId: 1,
          ownerOrganizationId: 1,
        });

        // then
        expect(targetProfileSummary.canDetach).to.be.false;
      });
    });
  });
});
