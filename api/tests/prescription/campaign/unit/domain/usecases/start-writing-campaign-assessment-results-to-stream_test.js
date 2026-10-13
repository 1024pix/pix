import { PassThrough } from 'node:stream';

import { expect } from 'chai';
import sinon from 'sinon';

import { startWritingCampaignAssessmentResultsToStream } from '../../../../../../src/prescription/campaign/domain/usecases/start-writing-campaign-assessment-results-to-stream.js';
import { CampaignAssessmentExport } from '../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-assessment-export.js';
import { CampaignTypeError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', function () {
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
    const err = await catchErr(startWritingCampaignAssessmentResultsToStream)({
      campaignId: campaign.id,
      i18n,
      campaignRepository,
    });

    // then
    expect(err).to.be.instanceOf(CampaignTypeError);
    expect(err.message).to.equal(`Ce type de campagne n'est pas autorisé.`);
  });

  context('when the export fails', function () {
    let clock, logger, writableStream, unhandledRejectionListener;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
      logger = { error: sinon.stub() };
      writableStream = new PassThrough();
      unhandledRejectionListener = sinon.stub();
      process.on('unhandledRejection', unhandledRejectionListener);
    });

    afterEach(function () {
      process.removeListener('unhandledRejection', unhandledRejectionListener);
    });

    it('should log and emit the error on the stream without causing an unhandled rejection', async function () {
      // given
      const exportError = new Error('export failed');
      sinon.stub(CampaignAssessmentExport.prototype, 'export').rejects(exportError);
      const streamErrorListener = sinon.stub();
      writableStream.on('error', streamErrorListener);

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
      await startWritingCampaignAssessmentResultsToStream({
        campaignId: campaign.id,
        writableStream,
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
      await clock.tickAsync(0);

      // then
      expect(streamErrorListener).calledWith(exportError);
      expect(logger.error).calledWith(exportError);
      expect(unhandledRejectionListener.called).to.be.false;
    });
  });
});
