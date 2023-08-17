import { campaignController } from '../../../../lib/application/campaigns-administration/campaign-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Application | Controller | Campaign Administration', function () {
  describe('#archiveCampaigns', function () {
    let csvCampaignsIdsParserStub;
    beforeEach(function () {
      sinon.stub(usecases, 'archiveCampaigns');
      csvCampaignsIdsParserStub = { extractCampaignsIds: sinon.stub() };
    });

    it('should return a 204', async function () {
      // given
      const userId = 12;
      const path = Symbol('path');
      const ids = [1, 2];
      const request = { auth: { credentials: { userId } }, payload: path };

      csvCampaignsIdsParserStub.extractCampaignsIds.withArgs(path).returns(ids);
      usecases.archiveCampaigns.withArgs({ userId, ids });

      // when
      const response = await campaignController.archiveCampaigns(request, hFake, {
        csvCampaignsIdsParser: csvCampaignsIdsParserStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);
    });
  });
  describe('#createCampaigns', function () {
    it('should return a 204', async function () {
      // given
      const userId = Symbol('userId');
      const path = Symbol('path');
      const csvSerializerStub = { deserializeForCampaignsImport: sinon.stub() };
      const request = { auth: { credentials: { userId } }, payload: { path } };
      sinon.stub(usecases, 'createCampaigns');
      const deserializedCampaignsToCreate = Symbol('deserializedCampaignsToCreate');
      csvSerializerStub.deserializeForCampaignsImport.withArgs(path).resolves(deserializedCampaignsToCreate);

      // when
      const response = await campaignController.createCampaigns(request, hFake, {
        csvSerializer: csvSerializerStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(usecases.createCampaigns).to.have.been.calledWithExactly({
        campaignsToCreate: deserializedCampaignsToCreate,
      });
      expect(csvSerializerStub.deserializeForCampaignsImport).to.have.been.called;
    });
  });
});
