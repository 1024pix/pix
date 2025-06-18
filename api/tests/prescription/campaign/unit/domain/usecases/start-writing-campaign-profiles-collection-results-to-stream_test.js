import stream from 'node:stream';

const { PassThrough } = stream;

import { startWritingCampaignProfilesCollectionResultsToStream } from '../../../../../../src/prescription/campaign/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream.js';
import { CampaignProfilesCollectionExport } from '../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-profiles-collection-export.js';
import { CampaignTypeError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, domainBuilder, expect, sinon, streamToPromise } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | start-writing-campaign-profiles-collection-results-to-stream', function () {
  const campaignRepository = { get: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const competenceRepository = { listPixCompetencesOnly: () => undefined };
  const organizationRepository = { get: () => undefined };
  const campaignParticipationRepository = { findInfoByCampaignId: () => undefined };
  let organizationFeatureApi;
  let writableStream;
  let csvPromise;
  let placementProfileService;
  let i18n;

  beforeEach(function () {
    placementProfileService = Symbol('placementProfileService');
    i18n = getI18n();
    sinon.stub(campaignRepository, 'get').rejects('error for campaignRepository.get');
    sinon.stub(userRepository, 'getWithMemberships').rejects('error for userRepository.getWithMemberships');
    sinon
      .stub(competenceRepository, 'listPixCompetencesOnly')
      .rejects('error for competenceRepository.listPixCompetencesOnly');
    sinon.stub(organizationRepository, 'get').rejects('error for organizationRepository.get');
    sinon
      .stub(campaignParticipationRepository, 'findInfoByCampaignId')
      .rejects('error for campaignParticipationRepository.findInfoByCampaignId');
    sinon
      .stub(CampaignProfilesCollectionExport.prototype, 'export')
      .rejects('CampaignProfilesCollectionExport.prototype.export');
    writableStream = new PassThrough();
    csvPromise = streamToPromise(writableStream);
    organizationFeatureApi = { getAllFeaturesFromOrganization: sinon.stub() };
    organizationFeatureApi.getAllFeaturesFromOrganization.resolves({ hasLearnersImportFeature: false });
  });

  it('should throw a CampaignTypeError when campaign is not PROFILES_COLLECTION type', async function () {
    // given
    const organization = domainBuilder.buildOrganization();
    const user = domainBuilder.buildUser();
    domainBuilder.buildMembership({ user, organization });
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ organizationId: organization.id });
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);
    userRepository.getWithMemberships.withArgs(user.id).resolves(user);

    // when
    const err = await catchErr(startWritingCampaignProfilesCollectionResultsToStream)({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      competenceRepository,
      campaignParticipationRepository,
      organizationRepository,
      organizationFeatureApi,
      placementProfileService,
    });

    // then
    expect(err).to.be.instanceOf(CampaignTypeError);
    expect(err.message).to.equal(`Ce type de campagne n'est pas autorisé.`);
  });

  it('should process result for each participation and add it to csv', async function () {
    // given
    const competences = Symbol('competences');
    const campaignParticipationResultDatas = Symbol('campaignParticipationResultDatas');
    const organization = domainBuilder.buildOrganization();
    const user = domainBuilder.buildUser();
    domainBuilder.buildMembership({ user, organization });
    const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({ organizationId: organization.id });
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);
    userRepository.getWithMemberships.withArgs(user.id).resolves(user);
    organizationRepository.get.withArgs(organization.id).resolves(organization);
    competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves(competences);
    campaignParticipationRepository.findInfoByCampaignId
      .withArgs(campaign.id, { size: 1000000, number: 1 })
      .resolves({ models: campaignParticipationResultDatas });
    CampaignProfilesCollectionExport.prototype.export
      .withArgs(campaignParticipationResultDatas, placementProfileService)
      .callsFake(async () => {
        await writableStream.write('result');
      });

    // when
    await startWritingCampaignProfilesCollectionResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      competenceRepository,
      campaignParticipationRepository,
      organizationRepository,
      organizationFeatureApi,
      placementProfileService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal('result');
  });
});
