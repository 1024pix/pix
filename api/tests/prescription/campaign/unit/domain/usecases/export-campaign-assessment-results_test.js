import { text } from 'node:stream/consumers';

import { expect } from 'chai';
import sinon from 'sinon';

import { exportCampaignAssessmentResults } from '../../../../../../src/prescription/campaign/domain/usecases/export-campaign-assessment-results.js';
import { CampaignAssessmentExport } from '../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-assessment-export.js';
import { CampaignTypeError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | export-campaign-assessment-results', function () {
  let campaignRepository;
  let i18n;

  beforeEach(function () {
    campaignRepository = { get: sinon.stub() };
    i18n = getI18n();
    campaignRepository.get.rejects('error for campaignRepository.get');
  });

  it('should throw a CampaignTypeError when campaign is PROFILES_COLLECTION type', async function () {
    // given
    const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);

    // when
    const err = await catchErr(exportCampaignAssessmentResults)({
      campaignId: campaign.id,
      i18n,
      campaignRepository,
    });

    // then
    expect(err).to.be.instanceOf(CampaignTypeError);
    expect(err.message).to.equal(`Ce type de campagne n'est pas autorisé.`);
  });

  context('when the export fails', function () {
    it('should log the error and fail the csv chunks', async function () {
      // given
      const exportError = new Error('export failed');
      // eslint-disable-next-line require-yield
      sinon.stub(CampaignAssessmentExport.prototype, 'export').callsFake(async function* () {
        throw exportError;
      });
      const logger = { error: sinon.stub() };

      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();
      campaignRepository.get.withArgs(campaign.id).resolves(campaign);
      const targetProfileRepository = { getByCampaignId: sinon.stub().resolves({}) };
      const learningContentRepository = {
        findByCampaignId: sinon.stub().resolves({ competences: [], areas: [], skills: [] }),
      };
      const stageCollectionRepository = { findStageCollection: sinon.stub().resolves({}) };
      const organizationRepository = { get: sinon.stub().resolves({}) };
      const campaignParticipationInfoRepository = { findByCampaignId: sinon.stub().resolves([]) };
      const organizationFeatureApi = {
        getAllFeaturesFromOrganization: sinon.stub().resolves({ hasLearnersImportFeature: false }),
      };

      // when
      const { csvChunks } = await exportCampaignAssessmentResults({
        campaignId: campaign.id,
        locale: 'fr',
        campaignRepository,
        targetProfileRepository,
        learningContentRepository,
        stageCollectionRepository,
        organizationRepository,
        campaignParticipationInfoRepository,
        organizationFeatureApi,
        logger,
      });

      // then
      await expect(text(csvChunks)).to.be.rejectedWith(exportError);
      expect(logger.error).calledWith(exportError);
    });
  });
});
