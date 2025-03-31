import { CampaignParticipation } from '../../../../../src/maddo/domain/models/CampaignParticipation.js';
import { findByCampaignId } from '../../../../../src/maddo/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, datamartBuilder, expect } from '../../../../test-helper.js';

describe('Maddo | Infrastructure | Repositories | Integration | campaign-participation', function () {
  describe('#findByCampaignId', function () {
    it('lists campaign participations belonging to campaign with given id', async function () {
      // given
      const campaign1 = databaseBuilder.factory.buildCampaign();
      const campaign2 = databaseBuilder.factory.buildCampaign();

      const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign1.id });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign2.id });
      const campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        status: CampaignParticipationStatuses.TO_SHARE,
      });

      const participation1ReachedLevels = [
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: campaignParticipation1.id,
          tubeId: 'tube1',
          reachedLevel: 2,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: campaignParticipation1.id,
          tubeId: 'tube2',
          reachedLevel: 0,
        }),
        datamartBuilder.factory.buildCampaignParticipationTubeReachedLevel({
          campaignParticipationId: campaignParticipation1.id,
          tubeId: 'tube3',
          reachedLevel: 6,
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

      const expectedCampaignParticipations = [
        new CampaignParticipation({
          ...campaignParticipation1,
          tubesReachedLevel: participation1ReachedLevels.map(({ tubeId, reachedLevel }) => ({
            id: tubeId,
            name: tubeNameById[tubeId],
            level: reachedLevel,
          })),
        }),
        new CampaignParticipation(campaignParticipation3),
      ];

      // when
      const campaignParticipations = await findByCampaignId(campaign1.id);

      // then
      expect(campaignParticipations).to.deep.equal(expectedCampaignParticipations);
    });
  });
});
