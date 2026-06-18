import sinon from 'sinon';

import {
  CampaignParticipationStatuses,
  CombinedCourseParticipationStatuses,
  CombinedCourseStatuses,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../../src/quest/domain/constants.js';
import { CombinedCourseDetails } from '../../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js';
import { CombinedCourseReward } from '../../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseReward.js';
import { CombinedCourseParticipation } from '../../../../../../src/quest/domain/models/combined-course-participations/entities/CombinedCourseParticipation.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import {
  CampaignCombinedCourseItem,
  COMBINED_COURSE_ITEM_TYPES,
  ModuleCombinedCourseItem,
  TrainingCombinedCourseItem,
} from '../../../../../../src/quest/domain/models/combined-course-participations/value-objects/CombinedCourseItem.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Domain | Models | CombinedCourseDetails', function () {
  let organizationId, name, code, questId, cryptoService;

  beforeEach(function () {
    cryptoService = { encrypt: sinon.stub() };
    cryptoService.encrypt.resolves('encryptedUrl');

    questId = 2;
    organizationId = 1;
    name = 'name';
    code = 'code';
  });

  describe('#campaignIds', function () {
    it('should only return ids of all campaigns included in the given combined course', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
      });

      // when
      const hasCampaigns = combinedCourseDetails.hasCampaigns;
      const campaignIds = combinedCourseDetails.campaignIds;

      // then
      expect(hasCampaigns).equal(true);
      expect(campaignIds).to.deep.equal([2]);
    });

    it('should return false to hasCampaign if no campaign on combined course', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ moduleId: 'abcdef' }],
      });

      // when
      const hasCampaigns = combinedCourseDetails.hasCampaigns;
      const campaignIds = combinedCourseDetails.campaignIds;

      // then
      expect(hasCampaigns).equal(false);
      expect(campaignIds).deep.equal([]);
    });
  });

  describe('#moduleIds', function () {
    it('should only return ids of all modules included in the given combined course', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ moduleId: 'abcdef' }],
      });

      // when
      const hasModules = combinedCourseDetails.hasModules;
      const moduleIds = combinedCourseDetails.moduleIds;

      // then
      expect(hasModules).equal(true);
      expect(moduleIds).to.deep.equal(['abcdef']);
    });

    it('should return false to hasModules if no module on combined course', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 12 }],
      });

      // when
      const hasModules = combinedCourseDetails.hasModules;
      const moduleIds = combinedCourseDetails.moduleIds;

      // then
      expect(hasModules).equal(false);
      expect(moduleIds).deep.equal([]);
    });
  });

  describe('#participationDetails', function () {
    it('should return a participation details with correct items count', async function () {
      //given
      const participation = new CombinedCourseParticipation({
        id: 123,
        firstName: 'Bob',
        lastName: 'Lapointe',
        group: 'Groupe A',
        division: '4eme B',
        status: CombinedCourseParticipationStatuses.STARTED,
        updatedAt: new Date('2024-12-10'),
        createdAt: new Date('2024-12-09'),
      });
      //when
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 777 }, { moduleId: 'ebcde1' }, { campaignId: 888 }, { moduleId: 'ebcde2' }],
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
        passages: [
          {
            referenceId: 'ebcde1',
            isTerminated: true,
          },
          {
            referenceId: 'ebcde2',
            isTerminated: false,
          },
        ],
        campaignParticipations: [
          { campaignId: 777, status: CampaignParticipationStatuses.SHARED },
          { campaignId: 888, status: CampaignParticipationStatuses.STARTED },
        ],
      });

      combinedCourseDetails.setDataAndGenerateItems({ participation, dataForQuest });

      // then
      expect(combinedCourseDetails.participationDetails).deep.equal({
        id: participation.id,
        division: participation.division,
        group: participation.group,
        firstName: participation.firstName,
        lastName: participation.lastName,
        status: participation.status,
        createdAt: participation.createdAt,
        updatedAt: participation.updatedAt,
        hasFormationItem: false,
        nbCampaigns: 2,
        nbModules: 2,
        nbModulesCompleted: 1,
        nbCampaignsCompleted: 1,
      });
    });

    it('should return hasFormationItems if a formation item is present', async function () {
      //given
      const participation = new CombinedCourseParticipation({
        id: 123,
        firstName: 'Bob',
        lastName: 'Lapointe',
        group: 'Groupe A',
        division: '6eme B',
        status: CombinedCourseParticipationStatuses.STARTED,
        updatedAt: new Date('2024-12-10'),
        createdAt: new Date('2024-12-09'),
      });
      //when
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [
          { campaignId: 777, targetProfileId: 666 },
          { moduleId: 'ebcde1' },
          { moduleId: 'ebcde2' },
        ],
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
        passages: [
          {
            referenceId: 'ebcde1',
            isTerminated: false,
          },
        ],
        campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.STARTED }],
      });

      combinedCourseDetails.setRecommandableModuleIds([{ moduleId: 'ebcde1', targetProfileIds: [666] }]);
      combinedCourseDetails.setDataAndGenerateItems({ participation, dataForQuest });

      // then
      expect(combinedCourseDetails.participationDetails).deep.equal({
        id: participation.id,
        firstName: participation.firstName,
        lastName: participation.lastName,
        status: participation.status,
        group: 'Groupe A',
        division: '6eme B',
        createdAt: participation.createdAt,
        updatedAt: participation.updatedAt,
        hasFormationItem: true,
        nbCampaigns: 1,
        nbModules: 2,
        nbModulesCompleted: 0,
        nbCampaignsCompleted: 0,
      });
    });
  });

  describe('#setDataAndGenerateItems', function () {
    describe('when item is type campaign', function () {
      it('returns a combined course item for provided campaign', async function () {
        // given
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 2 }],
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          campaignParticipations: [{ campaignId: 2, status: CampaignParticipationStatuses.SHARED }],
        });

        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        // then
        expect(combinedCourseDetails.items).to.deep.equal([
          new CampaignCombinedCourseItem({
            id: 2,
            reference: 'ABCDIAG2',
            title: 'diagnostique2',
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            masteryRate: null,
            validatedStagesCount: null,
            redirection: undefined,
            totalStagesCount: null,
            participationStatus: CampaignParticipationStatuses.SHARED,
            isCompleted: true,
            isLocked: false,
          }),
        ]);
      });

      it('should return a combined course item even if data for quest is empty', async function () {
        // given && when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 7 }],
        });

        combinedCourseDetails.setDataAndGenerateItems();

        // then
        expect(combinedCourseDetails.items).to.deep.equal([
          new CampaignCombinedCourseItem({
            id: 7,
            reference: 'ABCDIAG7',
            title: 'diagnostique7',
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            isCompleted: false,
            isLocked: false,
            masteryRate: null,
            totalStagesCount: null,
            validatedStagesCount: null,
          }),
        ]);
      });
    });

    describe('when items are type module', function () {
      it('should return module if it is in quest but not is not in target profile', async function () {
        // given && when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ moduleId: 'abcdefgh1' }],
          cryptoService,
          baseSurveyUrl: 'http://survey.fr',
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          passages: [
            {
              referenceId: 'abcdefgh1',
              isTerminated: false,
            },
          ],
        });

        await combinedCourseDetails.setEncryptedUrl();
        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        // then
        expect(combinedCourseDetails.items).to.deep.equal([
          new ModuleCombinedCourseItem({
            id: 'abcdefgh1',
            reference: 'slugabcdefgh1',
            title: 'titleabcdefgh1',
            image: 'emileabcdefgh1',
            type: COMBINED_COURSE_ITEM_TYPES.MODULE,
            redirection: 'encryptedUrl',
            isCompleted: false,
            isLocked: false,
            duration: 10,
            shortId: 'short-abcdefgh1',
          }),
        ]);
      });

      it('should not return module if it is recommandable, but not recommended for user', async function () {
        // given & when
        const recommendableModuleIds = [{ moduleId: 'module-id', targetProfileIds: [666] }];

        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 777, targetProfileId: 666 }, { moduleId: 'module-id' }],
          cryptoService,
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          passages: [
            {
              referenceId: 'module-id',
              isTerminated: false,
            },
          ],
          campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.SHARED }],
        });

        await combinedCourseDetails.setEncryptedUrl();
        combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);
        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        // then
        expect(combinedCourseDetails.items).to.deep.equal([
          new CampaignCombinedCourseItem({
            id: 777,
            reference: 'ABCDIAG777',
            title: 'diagnostique777',
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            participationStatus: CampaignParticipationStatuses.SHARED,
            isCompleted: true,
            isLocked: false,
            masteryRate: null,
            totalStagesCount: null,
            validatedStagesCount: null,
          }),
        ]);
      });

      it('should return module if it in quest, recommandable and recommended for user', async function () {
        // given & when
        const recommendableModuleIds = [{ moduleId: 'ebcde1', targetProfileIds: [888] }];
        const recommendedModuleIdsForUser = [{ moduleId: 'ebcde1' }];

        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 777, targetProfileId: 888 }, { moduleId: 'ebcde1' }],
          cryptoService,
        });
        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          passages: [
            {
              referenceId: 'ebcde1',
              isTerminated: false,
            },
          ],
          campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.SHARED }],
        });

        await combinedCourseDetails.setEncryptedUrl();
        combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);
        combinedCourseDetails.setDataAndGenerateItems({ recommendedModuleIdsForUser, dataForQuest });

        // then
        expect(combinedCourseDetails.items).to.deep.equal([
          new CampaignCombinedCourseItem({
            id: 777,
            title: 'diagnostique777',
            reference: 'ABCDIAG777',
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            participationStatus: CampaignParticipationStatuses.SHARED,
            isCompleted: true,
            masteryRate: null,
            totalStagesCount: null,
            validatedStagesCount: null,
            isLocked: false,
          }),
          new ModuleCombinedCourseItem({
            id: 'ebcde1',
            reference: 'slugebcde1',
            title: 'titleebcde1',
            image: 'emileebcde1',
            type: COMBINED_COURSE_ITEM_TYPES.MODULE,
            redirection: 'encryptedUrl',
            duration: 10,
            isCompleted: false,
            isLocked: false,
            shortId: 'short-ebcde1',
          }),
        ]);
      });

      it('should evaluates if module is completed', async function () {
        // given && when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ moduleId: 'abcde' }],
          cryptoService,
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          passages: [{ referenceId: 'abcde', isTerminated: true }],
        });

        await combinedCourseDetails.setEncryptedUrl();
        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        const [moduleItem] = combinedCourseDetails.items;

        // then
        expect(moduleItem.isCompleted).to.be.true;
      });
    });

    describe('when there needs to be a formation item', function () {
      describe('when there is only recommandable modules', function () {
        it('should return a campaign participation item and a formation item', async function () {
          // given && when
          const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
            name,
            code,
            organizationId,
            questId,
            combinedCourseItems: [
              { campaignId: 777, targetProfileId: 888 },
              { moduleId: 'abcdef1' },
              { moduleId: 'abcdef2' },
            ],
            cryptoService,
          });

          const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
            campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.STARTED }],
            passages: [
              {
                referenceId: 'abcdef1',
                isTerminated: false,
              },
              {
                referenceId: 'abcdef2',
                isTerminated: false,
              },
            ],
          });

          combinedCourseDetails.setRecommandableModuleIds([
            { moduleId: 'abcdef1', targetProfileIds: [888] },
            { moduleId: 'abcdef2', targetProfileIds: [888] },
          ]);
          await combinedCourseDetails.setEncryptedUrl();
          combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

          // then
          expect(combinedCourseDetails.items).to.deep.equal([
            new CampaignCombinedCourseItem({
              id: 777,
              reference: 'ABCDIAG777',
              title: 'diagnostique777',
              type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
              masteryRate: null,
              totalStagesCount: null,
              validatedStagesCount: null,
              participationStatus: CampaignParticipationStatuses.STARTED,
              isCompleted: false,
              isLocked: false,
            }),
            new TrainingCombinedCourseItem({
              id: 'formation_' + combinedCourseDetails.quest.id + '_' + 888,
              reference: 888,
              type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
              isLocked: true,
            }),
          ]);
        });

        it('should return two campaign participation items and two formation items', async function () {
          // given && when
          const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
            name,
            code,
            organizationId,
            questId,
            combinedCourseItems: [
              { campaignId: 777, targetProfileId: 888 },
              { moduleId: 'abcdef1' },
              { campaignId: 999, targetProfileId: 101 },
              { moduleId: 'abcdef2' },
            ],
            cryptoService,
          });

          const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
            campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.STARTED }],
            passages: [
              {
                referenceId: 'abcdef1',
                isTerminated: false,
              },
              {
                referenceId: 'abcdef2',
                isTerminated: false,
              },
            ],
          });

          combinedCourseDetails.setRecommandableModuleIds([
            { moduleId: 'abcdef1', targetProfileIds: [101, 888] },
            { moduleId: 'abcdef2', targetProfileIds: [101] },
          ]);
          await combinedCourseDetails.setEncryptedUrl();
          combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

          // then
          expect(combinedCourseDetails.items).to.deep.equal([
            new CampaignCombinedCourseItem({
              id: 777,
              reference: 'ABCDIAG777',
              title: 'diagnostique777',
              type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
              masteryRate: null,
              totalStagesCount: null,
              validatedStagesCount: null,
              participationStatus: CampaignParticipationStatuses.STARTED,
              isCompleted: false,
              isLocked: false,
            }),
            new TrainingCombinedCourseItem({
              id: 'formation_' + combinedCourseDetails.quest.id + '_' + 888,
              reference: 888,
              type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
              isLocked: true,
            }),
            new CampaignCombinedCourseItem({
              id: 999,
              reference: 'ABCDIAG999',
              title: 'diagnostique999',
              type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
              isCompleted: false,
              masteryRate: null,
              totalStagesCount: null,
              validatedStagesCount: null,
              isLocked: true,
            }),
            new TrainingCombinedCourseItem({
              id: 'formation_' + combinedCourseDetails.quest.id + '_' + 101,
              reference: 101,
              type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
              isLocked: true,
            }),
          ]);
        });

        it('should return a combined course item even if data for quest is empty', async function () {
          // given && when
          const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
            name,
            code,
            organizationId,
            questId,
            combinedCourseItems: [
              { campaignId: 777, targetProfileId: 888 },
              { moduleId: 'abcdef1' },
              { moduleId: 'abcdef2' },
            ],
            cryptoService,
          });

          combinedCourseDetails.setRecommandableModuleIds([
            { moduleId: 'abcdef1', targetProfileIds: [888] },
            { moduleId: 'abcdef2', targetProfileIds: [888] },
          ]);
          await combinedCourseDetails.setEncryptedUrl();
          combinedCourseDetails.setDataAndGenerateItems();

          // then
          expect(combinedCourseDetails.items).to.deep.equal([
            new CampaignCombinedCourseItem({
              id: 777,
              reference: 'ABCDIAG777',
              title: 'diagnostique777',
              type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
              masteryRate: null,
              totalStagesCount: null,
              validatedStagesCount: null,
              isCompleted: false,
              isLocked: false,
            }),
            new TrainingCombinedCourseItem({
              id: 'formation_' + combinedCourseDetails.quest.id + '_' + 888,
              reference: 888,
              type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
              isLocked: true,
            }),
          ]);
        });
      });

      describe('when there is a recommandable module and a quest item', function () {
        it('should return a formation item and a quest item', async function () {
          // given && when
          const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
            name,
            code,
            organizationId,
            questId,
            combinedCourseItems: [
              { campaignId: 777, targetProfileId: 888 },
              { moduleId: 'abcdef1' },
              { moduleId: 'abcdef2' },
            ],
            cryptoService,
          });

          const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
            campaignParticipations: [{ campaignId: 777, status: CampaignParticipationStatuses.STARTED }],
            passages: [
              {
                referenceId: 'abcdef2',
                isTerminated: false,
              },
              {
                referenceId: 'abcdef1',
                isTerminated: false,
              },
            ],
          });

          combinedCourseDetails.setRecommandableModuleIds([{ moduleId: 'abcdef2', targetProfileIds: [888] }]);
          await combinedCourseDetails.setEncryptedUrl();
          combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

          // then
          expect(combinedCourseDetails.items).to.deep.equal([
            new CampaignCombinedCourseItem({
              id: 777,
              reference: 'ABCDIAG777',
              title: 'diagnostique777',
              type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
              masteryRate: null,
              totalStagesCount: null,
              validatedStagesCount: null,
              participationStatus: CampaignParticipationStatuses.STARTED,
              isCompleted: false,
              isLocked: false,
            }),
            new ModuleCombinedCourseItem({
              id: 'abcdef1',
              reference: 'slugabcdef1',
              title: 'titleabcdef1',
              image: 'emileabcdef1',
              duration: 10,
              type: COMBINED_COURSE_ITEM_TYPES.MODULE,
              redirection: 'encryptedUrl',
              isCompleted: false,
              isLocked: true,
              shortId: 'short-abcdef1',
            }),
            new TrainingCombinedCourseItem({
              id: 'formation_' + combinedCourseDetails.quest.id + '_' + 888,
              reference: 888,
              type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
              isLocked: true,
            }),
          ]);
        });
      });
    });

    it('should keep success requirements order', async function () {
      // given && when
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [
          { campaignId: 2, targetProfileId: 888 },
          { campaignId: 3, targetProfileId: 999 },
          { moduleId: 'abc2de' },
        ],
        cryptoService,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
        campaignParticipations: [
          { campaignId: 3, status: CampaignParticipationStatuses.STARTED },
          { campaignId: 2, status: CampaignParticipationStatuses.SHARED },
        ],
      });

      await combinedCourseDetails.setEncryptedUrl();
      combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

      // then
      expect(combinedCourseDetails.items).to.deep.equal([
        new CampaignCombinedCourseItem({
          id: 2,
          reference: 'ABCDIAG2',
          title: 'diagnostique2',
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          masteryRate: null,
          totalStagesCount: null,
          validatedStagesCount: null,
          participationStatus: CampaignParticipationStatuses.SHARED,
          isCompleted: true,
          isLocked: false,
        }),
        new CampaignCombinedCourseItem({
          id: 3,
          reference: 'ABCDIAG3',
          title: 'diagnostique3',
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          masteryRate: null,
          totalStagesCount: null,
          validatedStagesCount: null,
          participationStatus: CampaignParticipationStatuses.STARTED,
          isCompleted: false,
          isLocked: false,
        }),
        new ModuleCombinedCourseItem({
          id: 'abc2de',
          duration: 10,
          reference: 'slugabc2de',
          title: 'titleabc2de',
          image: 'emileabc2de',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: true,
          shortId: 'short-abc2de',
        }),
      ]);
    });

    it('should set reward if provided', async function () {
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [
          { campaignId: 2, targetProfileId: 888 },
          { campaignId: 3, targetProfileId: 999 },
          { moduleId: 'abc2de' },
        ],
        cryptoService,
        rewardId: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
      });

      await combinedCourseDetails.setEncryptedUrl();
      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({ passages: [], campaignParticipations: [] });
      const profileReward = domainBuilder.buildProfileReward();
      combinedCourseDetails.setDataAndGenerateItems({ dataForQuest, reward: profileReward });
      expect(combinedCourseDetails.reward).is.instanceOf(CombinedCourseReward);
    });

    describe('campaign completion', function () {
      it('returns masteryRate value and isCompleted to true on linked participation to combined course campaign', async function () {
        // given && when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 777, targetProfileId: 888 }],
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          campaignParticipations: [
            { campaignId: 777, status: CampaignParticipationStatuses.SHARED, masteryRate: 0.18 },
          ],
        });

        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        const [campaignItem] = combinedCourseDetails.items;

        // then
        expect(campaignItem.isCompleted).to.be.true;
        expect(campaignItem.masteryRate).equal(0.18);
      });

      it('returns masteryRate to null and isCompleted to false on not linked participation to combined course campaign', async function () {
        // given && when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 777, targetProfileId: 888 }],
        });

        const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
          campaignParticipations: [
            { campaignId: 9999, status: CampaignParticipationStatuses.SHARED, masteryRate: 0.18 },
          ],
        });

        combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

        const [campaignItem] = combinedCourseDetails.items;

        // then
        expect(campaignItem.isCompleted).to.be.false;
        expect(campaignItem.masteryRate).null;
      });
    });

    it('should not mess with the combined course items', async function () {
      // given & when
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [
          { campaignId: 3, targetProfileId: 999 },
          { moduleId: 'abcde3' },
          { moduleId: 'abcde4' },
          { campaignId: 2, targetProfileId: 888 },
          { moduleId: 'abcde1' },
          { moduleId: 'abcde2' },
        ],
        cryptoService,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
        campaignParticipations: [
          { campaignId: 2, status: CampaignParticipationStatuses.SHARED, masteryRate: 0.21 },
          { campaignId: 3, status: CampaignParticipationStatuses.SHARED, masteryRate: 0.12 },
        ],
        passages: [
          { referenceId: 'abcde3', isTerminated: true },
          { referenceId: 'abcde4', isTerminated: true },
        ],
      });

      await combinedCourseDetails.setEncryptedUrl();
      combinedCourseDetails.setRecommandableModuleIds([
        { moduleId: 'abcde3', targetProfileIds: [888, 999] },
        { moduleId: 'abcde4', targetProfileIds: [888, 999] },
        { moduleId: 'abcde1', targetProfileIds: [888, 999] },
        { moduleId: 'abcde2', targetProfileIds: [888, 999] },
      ]);

      combinedCourseDetails.setDataAndGenerateItems({
        dataForQuest,
        recommendedModuleIdsForUser: [
          { moduleId: 'abcde3' },
          { moduleId: 'abcde4' },
          { moduleId: 'abcde1' },
          { moduleId: 'abcde2' },
        ],
      });

      // then
      expect(combinedCourseDetails.items).to.deep.equal([
        new CampaignCombinedCourseItem({
          id: 3,
          reference: 'ABCDIAG3',
          title: 'diagnostique3',
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          masteryRate: 0.12,
          participationStatus: CampaignParticipationStatuses.SHARED,
          isCompleted: true,
          isLocked: false,
        }),
        new ModuleCombinedCourseItem({
          id: 'abcde3',
          reference: 'slugabcde3',
          title: 'titleabcde3',
          image: 'emileabcde3',
          duration: 10,
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: true,
          isLocked: false,
          shortId: 'short-abcde3',
        }),
        new ModuleCombinedCourseItem({
          id: 'abcde4',
          reference: 'slugabcde4',
          title: 'titleabcde4',
          image: 'emileabcde4',
          duration: 10,
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: true,
          isLocked: false,
          shortId: 'short-abcde4',
        }),
        new CampaignCombinedCourseItem({
          id: 2,
          reference: 'ABCDIAG2',
          title: 'diagnostique2',
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          participationStatus: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.21,
          isCompleted: true,
          isLocked: false,
        }),
        new ModuleCombinedCourseItem({
          id: 'abcde1',
          reference: 'slugabcde1',
          title: 'titleabcde1',
          image: 'emileabcde1',
          duration: 10,
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: false,
          shortId: 'short-abcde1',
        }),
        new ModuleCombinedCourseItem({
          id: 'abcde2',
          reference: 'slugabcde2',
          title: 'titleabcde2',
          image: 'emileabcde2',
          duration: 10,
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: true,
          shortId: 'short-abcde2',
        }),
      ]);
    });
  });

  describe('#status', function () {
    describe('when there is no participation', function () {
      it('should set status to NOT_STARTED', async function () {
        // given & when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems();

        // then
        expect(combinedCourseDetails.status).to.deep.equal(CombinedCourseStatuses.NOT_STARTED);
      });
      it('should return surveyUrl without any params', async function () {
        // given & when
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
          baseSurveyUrl: 'https://link.to/survey',
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems();

        // then
        expect(combinedCourseDetails.status).to.deep.equal(CombinedCourseStatuses.NOT_STARTED);
        expect(combinedCourseDetails.surveyUrl).to.equal('https://link.to/survey');
      });
    });

    describe('when there is a participation', function () {
      it('should set status to STARTED if participation is STARTED', async function () {
        // given & when
        const combinedCourseParticipation = {
          status: CombinedCourseParticipationStatuses.STARTED,
        };
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems({ participation: combinedCourseParticipation });

        // then
        expect(combinedCourseDetails.status).to.deep.equal(CombinedCourseStatuses.STARTED);
      });

      it('should set status to COMPLETED if participation is COMPLETED', async function () {
        // given & when
        const combinedCourseParticipation = {
          status: CombinedCourseParticipationStatuses.COMPLETED,
        };
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems({ participation: combinedCourseParticipation });

        // then
        expect(combinedCourseDetails.status).to.deep.equal(CombinedCourseStatuses.COMPLETED);
      });

      it('should return surveyUrl with participation id as queryParams', async function () {
        // given & when
        const combinedCourseParticipation = {
          status: CombinedCourseParticipationStatuses.COMPLETED,
          id: 1,
        };
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
          baseSurveyUrl: 'https://link.to/survey',
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems({ participation: combinedCourseParticipation });

        // then
        expect(combinedCourseDetails.surveyUrl).to.deep.equal('https://link.to/survey?participationId=1');
      });

      it('should return surveyUrl only if baseSurveyUrl is defined', async function () {
        // given & when
        const combinedCourseParticipation = {
          status: CombinedCourseParticipationStatuses.COMPLETED,
          id: 1,
        };
        const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
          name,
          code,
          organizationId,
          questId,
          combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abcde1' }],
          cryptoService,
          baseSurveyUrl: null,
        });

        await combinedCourseDetails.setEncryptedUrl();

        combinedCourseDetails.setDataAndGenerateItems({ participation: combinedCourseParticipation });

        // then
        expect(combinedCourseDetails.surveyUrl).to.be.null;
      });
    });
  });

  describe('#updateItemsFromPassages', function () {
    it('should generate items and return an updated instance of Combined Course Details', async function () {
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 3, targetProfileId: 999 }, { moduleId: 'abc123' }, { moduleId: 'abcde1' }],
        cryptoService,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({
        campaignParticipations: [
          { id: 1, campaignId: 3, targetProfileId: 999, status: CampaignParticipationStatuses.SHARED },
        ],
        passages: [
          {
            referenceId: 'abc123',
            isTerminated: false,
          },
          {
            referenceId: 'abcde1',
            isTerminated: false,
          },
        ],
      });

      combinedCourseDetails.setDataAndGenerateItems({ dataForQuest });

      await combinedCourseDetails.setEncryptedUrl();

      const passages = [
        new OrganizationLearnerParticipation({
          organizationLearnerId: 123,
          type: OrganizationLearnerParticipationTypes.PASSAGE,
          referenceId: 'abc123',
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
        }),
        new OrganizationLearnerParticipation({
          organizationLearnerId: 456,
          type: OrganizationLearnerParticipationTypes.PASSAGE,
          referenceId: 'abcde1',
          status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
        }),
      ];
      const result = combinedCourseDetails.updateItemsFromPassages(passages);

      expect(result).to.be.instanceOf(CombinedCourseDetails);
      expect(result.items[0]).to.be.instanceOf(CampaignCombinedCourseItem);
      expect(result.items[0].isCompleted).to.be.true;

      expect(result.items[1]).to.be.instanceOf(ModuleCombinedCourseItem);
      expect(result.items[2]).to.be.instanceOf(ModuleCombinedCourseItem);
      expect(result.items[1].id).to.equal('abc123');
      expect(result.items[2].id).to.equal('abcde1');
      expect(result.items[1].isCompleted).to.be.true;
      expect(result.items[2].isCompleted).to.be.false;
    });
  });
});
