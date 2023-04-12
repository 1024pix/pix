const { sinon, expect, hFake } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns-administration/campaign-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | Application | Controller | Campaign Administration', function () {
  describe('#archiveCampaigns', function () {
    let csvCampaignsIdsParserStub;
    beforeEach(function () {
      sinon.stub(usecases, 'campaignAdministrationArchiveCampaign');
      csvCampaignsIdsParserStub = { extractCampaignsIds: sinon.stub() };
    });

    it('should return a 204', async function () {
      // given
      const userId = 12;
      const path = Symbol('path');
      const ids = [1, 2];
      const request = { auth: { credentials: { userId } }, payload: path };

      csvCampaignsIdsParserStub.extractCampaignsIds.withArgs(path).returns(ids);
      usecases.campaignAdministrationArchiveCampaign.withArgs({ userId, ids });

      // when
      const response = await campaignController.archiveCampaigns(request, hFake, {
        csvCampaignsIdsParser: csvCampaignsIdsParserStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);
    });
  });
});
