import dayjs from 'dayjs';

import { PoleEmploiSending } from '../../../../lib/domain/models/PoleEmploiSending.js';
import { insertMissingPoleEmploiSendingFromDate } from '../../../../scripts/prod/insert-missing-pole-emploi-sending-from-date.js';
import { Tag } from '../../../../src/organizational-entities/domain/models/Tag.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import {
  catchErr,
  databaseBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

describe('Script | Prod | Delete Organization Learners From Organization', function () {
  describe('#insertMissingPoleEmploiSendingFromDate', function () {
    beforeEach(async function () {
      const learningContent = [
        {
          id: '1. Information et données',
          competences: [
            {
              id: 'competence_id',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      challenges: [{ id: 'k_challenge_id' }],
                      level: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    context('validation', function () {
      context('startDate', function () {
        it('throw an error when startDate not a date', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('coucou');

          expect(error).to.be.instanceOf(Error);
        });

        it('throw an error when startDate is not in a valid format', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('20/01/2020');

          expect(error).to.be.instanceOf(Error);
        });
      });

      context('endDate', function () {
        it('throw an error when is not a date', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('2024-01-01', 'coucou');

          expect(error).to.be.instanceOf(Error);
        });

        it('throw an error when is not in a valid format', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('2024-01-01', '20/01/2020');

          expect(error).to.be.instanceOf(Error);
        });
      });

      context('date comparaison', function () {
        it('throw an error when startDate after  endDate', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('2024-01-01', '2020-01-01');

          expect(error).to.be.instanceOf(Error);
        });

        it('throw an error when startDate equal to endDate', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)('2024-01-01', '2024-01-01');

          expect(error).to.be.instanceOf(Error);
        });
      });

      context('campaign', function () {
        it('should throw an error when no campaign found for given id', async function () {
          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)(
            '2020-01-01',
            '2024-01-01',
            'UNKNOWN_CAMPAIGN',
          );

          expect(error).to.be.instanceOf(Error);
        });

        it('should throw an error when campaign is not assessment type', async function () {
          databaseBuilder.factory.buildCampaign({ code: 'PROFILE_CODE', type: CampaignTypes.PROFILES_COLLECTION });

          await databaseBuilder.commit();

          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)(
            '2020-01-01',
            '2024-01-01',
            'PROFILE_CODE',
          );

          expect(error).to.be.instanceOf(Error);
        });

        it('should throw an error when organization is not PE', async function () {
          databaseBuilder.factory.buildCampaign({ code: 'ASSESSMENT_CODE', type: CampaignTypes.ASSESSMENT });

          await databaseBuilder.commit();

          const error = await catchErr(insertMissingPoleEmploiSendingFromDate)(
            '2020-01-01',
            '2024-01-01',
            'ASSESSMENT_CODE',
          );

          expect(error).to.be.instanceOf(Error);
        });

        it('should not throw an error when organization is PE with assessment campaign', async function () {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const tagId = databaseBuilder.factory.buildTag({ name: Tag.POLE_EMPLOI }).id;

          databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
          databaseBuilder.factory.buildCampaign({
            code: 'ASSESSMENT_CODE',
            type: CampaignTypes.ASSESSMENT,
            organizationId,
          });

          await databaseBuilder.commit();

          const call = () => insertMissingPoleEmploiSendingFromDate('2020-01-01', '2024-01-01', 'ASSESSMENT_CODE');

          expect(call).to.not.throw();
        });
      });
    });

    context('data', function () {
      const campaignCode = 'MY_CODE';
      let campaign;

      beforeEach(async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const tagId = databaseBuilder.factory.buildTag({ name: Tag.POLE_EMPLOI }).id;

        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        campaign = databaseBuilder.factory.buildCampaign({
          code: campaignCode,
          type: CampaignTypes.ASSESSMENT,
          organizationId,
        });

        await databaseBuilder.commit();
      });

      context('Common cases', function () {
        it('should return no event to create for participation from other campaign inside date interval', async function () {
          const otherCampaign = databaseBuilder.factory.buildCampaign({ code: 'ANOTHER_CAMPAIGN' });

          const createdAt = new Date('2024-02-03');

          const firstParticipation = _buildLearnerWithStartedParticipation(otherCampaign, createdAt);
          const secondParticipation = _buildLearnerWithToShareParticipation(otherCampaign, createdAt);
          const thirdParticipation = _buildLearnerWithSharedParticipation(otherCampaign, createdAt, createdAt);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .whereIn('campaignParticipationId', [firstParticipation.id, secondParticipation.id, thirdParticipation.id])
            .where({ isSuccessful: false, responseCode: 'SCRIPT_2024-02-02_to_2024-02-04' });

          expect(result).lengthOf(0);
        });

        it('should return no event to create for participation outside the interval', async function () {
          const firstParticipation = _buildLearnerWithStartedParticipation(campaign, new Date('2024-02-01'));

          const secondParticipation = _buildLearnerWithToShareParticipation(campaign, new Date('2024-02-05'));

          const thirdParticipation = _buildLearnerWithSharedParticipation(
            campaign,
            new Date('2024-02-05'),
            new Date('2024-02-06'),
          );

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .whereIn('campaignParticipationId', [firstParticipation.id, secondParticipation.id, thirdParticipation.id])
            .where({ isSuccessful: false, responseCode: 'SCRIPT_2024-02-02_to_2024-02-04' });

          expect(result).lengthOf(0);
        });
      });

      context('Status STARTED', function () {
        it('should return started event participation to create inside date interval', async function () {
          const createdAt = new Date('2024-02-03');

          const participation = _buildLearnerWithStartedParticipation(campaign, createdAt);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings').select('type').where({
            campaignParticipationId: participation.id,
            isSuccessful: false,
            responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
          });

          expect(result).lengthOf(1);
        });

        it('should return empty started event participation to create inside date interval when exists', async function () {
          const createdAt = new Date('2024-02-03');

          const participation = _buildLearnerWithStartedParticipation(campaign, createdAt);
          _buildPoleEmploiSendingsForStartedParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START]);

          expect(result).lengthOf(0);
        });
      });

      context('Status TO_SHARE', function () {
        it('should return started / completion event participation to create inside date interval', async function () {
          const createdAt = new Date('2024-02-03');

          const participation = _buildLearnerWithToShareParticipation(campaign, createdAt);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
            ]);

          expect(result).lengthOf(2);
        });

        it('should return completion event participation to create inside date interval when started already exists', async function () {
          const createdAt = new Date('2024-02-03');

          const participation = _buildLearnerWithToShareParticipation(campaign, createdAt);
          _buildPoleEmploiSendingsForStartedParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION]);

          expect(result).lengthOf(1);
        });

        it('should return no event participation to create inside date interval when started / completion already exists', async function () {
          const createdAt = new Date('2024-02-03');

          const participation = _buildLearnerWithToShareParticipation(campaign, createdAt);
          _buildPoleEmploiSendingsForToShareParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings').select('type').where({
            campaignParticipationId: participation.id,
            isSuccessful: false,
            responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
          });

          expect(result).lengthOf(0);
        });
      });

      context('Status SHARED', function () {
        it('should return started / completion / shared event participation inside date interval', async function () {
          const createdAt = new Date('2024-02-01');
          const sharedAt = new Date('2024-02-03');

          const participation = _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
            ]);

          expect(result).lengthOf(3);
        });

        it('should return started / completion / shared event participation inside date interval even if is Improved', async function () {
          const createdAt = new Date('2024-02-01');
          const sharedAt = new Date('2024-02-03');
          const isImproved = true;

          const participation = _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt, isImproved);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
            ]);

          expect(result).lengthOf(3);
        });

        it('should return completion / shared event participation to create inside date interval when started already exists', async function () {
          const createdAt = new Date('2024-02-01');
          const sharedAt = new Date('2024-02-03');

          const participation = _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt);
          _buildPoleEmploiSendingsForStartedParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
              PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
            ]);

          expect(result).lengthOf(2);
        });

        it('should return shared event participation to create inside date interval when started/completion already exists', async function () {
          const createdAt = new Date('2024-02-01');
          const sharedAt = new Date('2024-02-03');

          const participation = _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt);
          _buildPoleEmploiSendingsForToShareParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings')
            .select('type')
            .where({
              campaignParticipationId: participation.id,
              isSuccessful: false,
              responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
            })
            .whereIn('type', [PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING]);

          expect(result).lengthOf(1);
        });

        it('should return no event participation to create inside date interval when started/completion/shared already exists', async function () {
          const createdAt = new Date('2024-02-01');
          const sharedAt = new Date('2024-02-03');

          const participation = _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt);
          _buildPoleEmploiSendingsForSharedParticipation(participation);

          await databaseBuilder.commit();

          await insertMissingPoleEmploiSendingFromDate('2024-02-02', '2024-02-04', campaignCode);

          const result = await knex('pole-emploi-sendings').select('type').where({
            campaignParticipationId: participation.id,
            isSuccessful: false,
            responseCode: 'SCRIPT_2024-02-02_to_2024-02-04',
          });

          expect(result).lengthOf(0);
        });
      });
    });

    function _buildLearnerWithStartedParticipation(campaign, createdAt) {
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaign.organizationId,
      });

      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        userId,
        createdAt,
        status: CampaignParticipationStatuses.STARTED,
      });

      databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participation.id,
        state: Assessment.states.STARTED,
        createdAt,
      });

      return participation;
    }

    function _buildLearnerWithToShareParticipation(campaign, createdAt) {
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaign.organizationId,
      });

      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        userId,
        createdAt,
        status: CampaignParticipationStatuses.TO_SHARE,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participation.id,
        state: Assessment.states.COMPLETED,
        createdAt,
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        createdAt,
      });

      return participation;
    }

    function _buildLearnerWithSharedParticipation(campaign, createdAt, sharedAt, isImproved = false) {
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaign.organizationId,
      });

      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId,
        userId,
        createdAt,
        status: CampaignParticipationStatuses.SHARED,
        isImproved,
        sharedAt,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participation.id,
        state: Assessment.states.COMPLETED,
        createdAt,
        updatedAt: sharedAt,
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        createdAt: dayjs(sharedAt).subtract(10, 'day'),
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        createdAt: sharedAt,
      });

      return participation;
    }

    function _buildPoleEmploiSendingsForStartedParticipation(participation) {
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
      });
    }

    function _buildPoleEmploiSendingsForToShareParticipation(participation) {
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
      });
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
      });
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
      });
    }

    function _buildPoleEmploiSendingsForSharedParticipation(participation) {
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
      });
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.sharedAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
      });
      databaseBuilder.factory.buildPoleEmploiSending({
        campaignParticipationId: participation.id,
        createdAt: participation.sharedAt,
        updateAt: participation.sharedAt,
        type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
      });
    }
  });
});
