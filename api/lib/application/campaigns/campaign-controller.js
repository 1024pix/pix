const moment = require('moment');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const infraErrors = require('../../infrastructure/errors');

module.exports = {

  save(request, h) {
    const { userId } = request.auth.credentials;

    return campaignSerializer.deserialize(request.payload)
      .then((campaign) => {
        campaign.creatorId = userId;
        return campaign;
      })
      .then((campaign) => usecases.createCampaign({ campaign }))
      .then((createdCampaign) => {
        return h.response(campaignSerializer.serialize(createdCampaign)).created();
      });
  },

  async getByCode(request) {
    const filters = queryParamsUtils.extractParameters(request.query).filter;
    await _validateFilters(filters);

    const campaign = await usecases.getCampaignByCode({ code: filters.code });
    const campaignWithLogo = await usecases.addOrganizationLogoToCampaign({ campaign });

    return campaignSerializer.serialize([campaignWithLogo]);
  },

  getById(request) {
    const campaignId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);
    const tokenForCampaignResults = tokenService.createTokenForCampaignResults(request.auth.credentials.userId);
    return usecases.getCampaign({ campaignId, options })
      .then((campaign) => campaignSerializer.serialize(campaign, { tokenForCampaignResults }));
  },

  getCsvResults(request, h) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);

    const campaignId = parseInt(request.params.id);

    return usecases.getResultsCampaignInCSVFormat({ userId, campaignId })
      .then((resultCampaign) => {
        const fileName = `Resultats-${resultCampaign.campaignName}-${campaignId}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
        return h.response(resultCampaign.csvData)
          .header('Content-Type', 'text/csv;charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${fileName}"`);
      });
  },

  update(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;
    const { title, 'custom-landing-page-text': customLandingPageText } = request.payload.data.attributes;

    return usecases.updateCampaign({ userId, campaignId, title, customLandingPageText })
      .then(campaignSerializer.serialize);
  },

  async getReport(request) {
    const campaignId = parseInt(request.params.id);

    const report = await usecases.getCampaignReport({ campaignId });

    return campaignReportSerializer.serialize(report);
  },

  async getCollectiveResult(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId });
    return campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
  }
};

function _validateFilters(filters) {
  if (typeof filters.code === 'undefined') {
    throw new infraErrors.MissingQueryParamError('filter.code');
  }
}

