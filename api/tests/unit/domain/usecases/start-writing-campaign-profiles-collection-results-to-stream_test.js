import { PassThrough } from 'stream';
import { expect, sinon, domainBuilder, streamToPromise, catchErr } from '../../../test-helper';
import startWritingCampaignProfilesCollectionResultsToStream from '../../../../lib/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream';
import { UserNotAuthorizedToGetCampaignResultsError, CampaignTypeError } from '../../../../lib/domain/errors';
import CampaignProfilesCollectionExport from '../../../../lib/infrastructure/serializers/csv/campaign-profiles-collection-export';
import { getI18n } from '../../../tooling/i18n/i18n';

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

  it('should throw a CampaignTypeError when campaign is not PROFILES_COLLECTION type', async function () {
    // given
    const organization = domainBuilder.buildOrganization();
    const user = domainBuilder.buildUser();
    domainBuilder.buildMembership({ user, organization });
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ organization });
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
    const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();
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
