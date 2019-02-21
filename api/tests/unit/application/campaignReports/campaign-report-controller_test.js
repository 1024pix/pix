const { sinon, expect } = require('../../../test-helper');
const campaignReportController = require('../../../../lib/application/campaignReports/campaign-report-controller');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | campaign-report-controller', () => {
  describe('#get ', () => {

    const campaignId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'getCampaignReport');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should returns ok', async () => {
      // given
      usecases.getCampaignReport.withArgs({ campaignId }).resolves({});
      campaignReportSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignReportController.get({ params: { id: campaignId } });

      // then
      expect(response).to.be.equal('ok');
    });

  });
});
