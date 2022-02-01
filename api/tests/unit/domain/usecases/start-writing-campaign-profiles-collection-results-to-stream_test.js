const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise, catchErr } = require('../../../test-helper');
const startWritingCampaignProfilesCollectionResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../../../../lib/domain/errors');
const CampaignProfilesCollectionExport = require('../../../../lib/infrastructure/serializers/csv/campaign-profiles-collection-export');
const { getI18n } = require('../../../tooling/i18n/i18n');

describe('Unit | Domain | Use Cases | start-writing-campaign-profiles-collection-results-to-stream', function () {
  const campaignRepository = { get: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const competenceRepository = { listPixCompetencesOnly: () => undefined };
  const organizationRepository = { get: () => undefined };
  const campaignParticipationRepository = { findProfilesCollectionResultDataByCampaignId: () => undefined };
  let writableStream;
  let csvPromise;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const placementProfileService = Symbol('placementProfileService');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const i18n = getI18n();

  beforeEach(function () {
    sinon.stub(campaignRepository, 'get').rejects('error for campaignRepository.get');
    sinon.stub(userRepository, 'getWithMemberships').rejects('error for userRepository.getWithMemberships');
    sinon
      .stub(competenceRepository, 'listPixCompetencesOnly')
      .rejects('error for competenceRepository.listPixCompetencesOnly');
    sinon.stub(organizationRepository, 'get').rejects('error for organizationRepository.get');
    sinon
      .stub(campaignParticipationRepository, 'findProfilesCollectionResultDataByCampaignId')
      .rejects('error for campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId');
    sinon
      .stub(CampaignProfilesCollectionExport.prototype, 'export')
      .rejects('CampaignProfilesCollectionExport.prototype.export');
    writableStream = new PassThrough();
    csvPromise = streamToPromise(writableStream);
  });

  it('should throw a UserNotAuthorizedToGetCampaignResultsError when user is not authorized', async function () {
    // given
    const notAuthorizedUser = domainBuilder.buildUser({ memberships: [] });
    const campaign = domainBuilder.buildCampaign();
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);
    userRepository.getWithMemberships.withArgs(notAuthorizedUser.id).resolves(notAuthorizedUser);

    // when
    const err = await catchErr(startWritingCampaignProfilesCollectionResultsToStream)({
      userId: notAuthorizedUser.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      competenceRepository,
      campaignParticipationRepository,
      organizationRepository,
      placementProfileService,
    });

    // then
    expect(err).to.be.instanceOf(UserNotAuthorizedToGetCampaignResultsError);
    expect(err.message).to.equal(`User does not have an access to the organization ${campaign.organization.id}`);
  });

  it('should process result for each participation and add it to csv', async function () {
    // given
    const competences = Symbol('competences');
    const campaignParticipationResultDatas = Symbol('campaignParticipationResultDatas');
    const organization = domainBuilder.buildOrganization();
    const user = domainBuilder.buildUser();
    domainBuilder.buildMembership({ user, organization });
    const campaign = domainBuilder.buildCampaign();
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);
    userRepository.getWithMemberships.withArgs(user.id).resolves(user);
    organizationRepository.get.withArgs(organization.id).resolves(organization);
    competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves(competences);
    campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId
      .withArgs(campaign.id)
      .resolves(campaignParticipationResultDatas);
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
      placementProfileService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal('result');
  });
});
