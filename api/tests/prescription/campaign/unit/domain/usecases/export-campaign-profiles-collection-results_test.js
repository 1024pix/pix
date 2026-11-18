import { text } from 'node:stream/consumers';

import { expect } from 'chai';
import sinon from 'sinon';

import { exportCampaignProfilesCollectionResults } from '../../../../../../src/prescription/campaign/domain/usecases/export-campaign-profiles-collection-results.js';
import { CampaignProfilesCollectionExport } from '../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-profiles-collection-export.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Use Cases | export-campaign-profiles-collection-results', function () {
  let campaign, logger, dependencies;

  beforeEach(function () {
    campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();
    logger = { error: sinon.stub() };
    dependencies = {
      campaignId: campaign.id,
      locale: 'fr',
      campaignRepository: { get: sinon.stub().resolves(campaign) },
      competenceRepository: { listPixCompetencesOnly: sinon.stub().resolves([]) },
      campaignParticipationRepository: { findInfoByCampaignId: sinon.stub().resolves({ models: [] }) },
      organizationRepository: { get: sinon.stub().resolves({}) },
      placementProfileService: {},
      organizationFeatureApi: {
        getAllFeaturesFromOrganization: sinon.stub().resolves({ hasLearnersImportFeature: false }),
      },
      organizationLearnerImportFormatRepository: {},
      logger,
    };
  });

  context('when the export succeeds', function () {
    it('should return the csv chunks without logging any error', async function () {
      // given
      sinon.stub(CampaignProfilesCollectionExport.prototype, 'export').callsFake(async function* () {
        yield 'header\n';
        yield 'line\n';
      });

      // when
      const { csvChunks } = await exportCampaignProfilesCollectionResults(dependencies);

      // then
      expect(await text(csvChunks)).to.equal('header\nline\n');
      expect(logger.error).not.to.have.been.called;
    });
  });

  context('when the export fails', function () {
    it('should log the error and fail the csv chunks with the same error', async function () {
      // given
      const exportError = new Error('export failed');
      // eslint-disable-next-line require-yield
      sinon.stub(CampaignProfilesCollectionExport.prototype, 'export').callsFake(async function* () {
        throw exportError;
      });

      // when
      const { csvChunks } = await exportCampaignProfilesCollectionResults(dependencies);

      // then
      await expect(text(csvChunks)).to.be.rejectedWith(exportError);
      expect(logger.error).to.have.been.calledOnceWith(exportError);
    });

    it('should keep the chunks already produced before the failure', async function () {
      // given
      const exportError = new Error('export failed');
      sinon.stub(CampaignProfilesCollectionExport.prototype, 'export').callsFake(async function* () {
        yield 'header\n';
        throw exportError;
      });

      // when
      const { csvChunks } = await exportCampaignProfilesCollectionResults(dependencies);
      const received = [];
      const consume = async () => {
        for await (const chunk of csvChunks) received.push(chunk);
      };

      // then
      await expect(consume()).to.be.rejectedWith(exportError);
      expect(received).to.deep.equal(['header\n']);
      expect(logger.error).to.have.been.calledOnceWith(exportError);
    });
  });
});
