import { expect } from '../../../../test-helper.js';
import { CampaignAuthorization } from '../../../../../lib/application/preHandlers/models/CampaignAuthorization.js';

describe('Unit | Domain | models | CampaignAuthorization', function () {
  describe('#isAllowedToManage', function () {
    it('should be false if user is member of organization and not owner of the campaign', function () {
      // given
      const prescriberRole = 'MEMBER';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToManage({ prescriberRole });

      //then
      expect(hasAccess).to.be.false;
    });

    it('should be true if user is admin of organization', function () {
      // given
      const prescriberRole = 'ADMIN';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToManage({ prescriberRole });

      //then
      expect(hasAccess).to.be.true;
    });

    it('should be true if user is owner of the campaign', function () {
      // given
      const prescriberRole = 'OWNER';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToManage({ prescriberRole });

      //then
      expect(hasAccess).to.be.true;
    });
  });

  describe('#isAllowedToAccess', function () {
    it('should be true if user is member of organization', function () {
      // given
      const prescriberRole = 'MEMBER';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToAccess({ prescriberRole });

      //then
      expect(hasAccess).to.be.true;
    });

    it('should be true if user is admin of organization', function () {
      // given
      const prescriberRole = 'ADMIN';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToAccess({ prescriberRole });

      //then
      expect(hasAccess).to.be.true;
    });

    it('should be true if user is owner of the campaign', function () {
      // given
      const prescriberRole = 'OWNER';

      // when
      const hasAccess = CampaignAuthorization.isAllowedToAccess({ prescriberRole });

      //then
      expect(hasAccess).to.be.true;
    });

    it('should be false if user has no role of the campaign', function () {
      // given
      const prescriberRole = null;

      // when
      const hasAccess = CampaignAuthorization.isAllowedToAccess({ prescriberRole });

      //then
      expect(hasAccess).to.be.false;
    });
  });
});
