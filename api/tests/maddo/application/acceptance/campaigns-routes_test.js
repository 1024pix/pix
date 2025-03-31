import { CampaignParticipation } from '../../../../src/maddo/domain/models/CampaignParticipation.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import {
  createMaddoServer,
  databaseBuilder,
  datamartBuilder,
  expect,
  generateValidRequestAuthorizationHeaderForApplication,
} from '../../../test-helper.js';

describe('Acceptance | Maddo | Route | Campaigns', function () {
  let server;

  beforeEach(async function () {
    server = await createMaddoServer();
  });

  describe('GET /api/campaigns/{campaignId}/participations', function () {
    it('returns the list of all participations of campaign with an HTTP status code 200', async function () {
      // given
      const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
      databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

      const tag = databaseBuilder.factory.buildTag();
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

      const clientId = 'client';
      databaseBuilder.factory.buildClientApplication({
        clientId: 'client',
        jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
      });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: orgaInJurisdiction.id });
      const participation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      const participation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
      });

      const participation1ReachedLevels = [
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation1.id,
          tubeId: 'tube1',
          reachedLevel: 2,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation1.id,
          tubeId: 'tube2',
          reachedLevel: 0,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation1.id,
          tubeId: 'tube3',
          reachedLevel: 6,
        }),
      ];

      const participation2ReachedLevels = [
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation2.id,
          tubeId: 'tube1',
          reachedLevel: 1,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation2.id,
          tubeId: 'tube2',
          reachedLevel: 2,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: participation2.id,
          tubeId: 'tube3',
          reachedLevel: 4,
        }),
      ];

      const tubeNameById = Object.fromEntries(
        [
          databaseBuilder.factory.learningContent.buildTube({
            id: 'tube1',
            name: '@superTube',
          }),
          databaseBuilder.factory.learningContent.buildTube({
            id: 'tube2',
            name: '@gigaTube',
          }),
          databaseBuilder.factory.learningContent.buildTube({
            id: 'tube3',
            name: '@megaTube',
          }),
        ].map(({ id, name }) => [id, name]),
      );

      await datamartBuilder.commit();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participations`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([
        new CampaignParticipation({
          ...participation1,
          tubesReachedLevel: participation1ReachedLevels.map(({ tubeId, reachedLevel }) => ({
            id: tubeId,
            name: tubeNameById[tubeId],
            level: reachedLevel,
          })),
        }),
        new CampaignParticipation({
          ...participation2,
          tubesReachedLevel: participation2ReachedLevels.map(({ tubeId, reachedLevel }) => ({
            id: tubeId,
            name: tubeNameById[tubeId],
            level: reachedLevel,
          })),
        }),
      ]);
    });
  });
});
