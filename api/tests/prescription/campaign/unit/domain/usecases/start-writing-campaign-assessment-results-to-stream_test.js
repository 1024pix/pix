import sinon from 'sinon';

import { startWritingCampaignAssessmentResultsToStream } from '../../../../../../src/prescription/campaign/domain/usecases/start-writing-campaign-assessment-results-to-stream.js';
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
});
