const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');

const participantResultsSharedRepository = require('../../../../lib/infrastructure/repositories/participant-results-shared-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');
const { MAX_REACHABLE_PIX_BY_COMPETENCE } = require('../../../../lib/domain/constants');

describe('Integration | Repository | Campaign Participant Result Shared Repository', function () {
  describe('#get', function () {
    describe('when there is no target profile', function () {
      it('computes the participant results for the complete learning content', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 0 },
          { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
          { skillId: 'skill_3', status: 'validated', earnedPix: 1 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [{ id: 'skill_1' }, { id: 'skill_2' }, { id: 'skill_3' }],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.masteryRate).to.equals(4 / (16 * MAX_REACHABLE_PIX_BY_COMPETENCE));
        expect(participantResultsShared.id).to.equal(participation.id);
        expect(participantResultsShared.pixScore).to.equals(4);
        expect(participantResultsShared.validatedSkillsCount).to.equals(3);
      });
    });

    describe('when there is a target profile', function () {
      it('computes the participant results for a target profile', async function () {
        const skillIds = ['skill_1', 'skill_2'];

        const { id: campaignId } = _buildCampaignForSkills(skillIds);

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 2 },
          { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
          { skillId: 'skill_3', status: 'validated', earnedPix: 1 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [
            { id: 'skill_1', status: 'actif' },
            { id: 'skill_2', status: 'actif' },
            { id: 'skill_3', status: 'actif' },
          ],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.masteryRate).to.equals(1);
        expect(participantResultsShared.id).to.equal(participation.id);
        expect(participantResultsShared.pixScore).to.equals(5);
        expect(participantResultsShared.validatedSkillsCount).to.equals(2);
      });

      describe('when there are active, archived and deprecated skills', function () {
        it('computes the participant results using operative skills', async function () {
          const skillIds = ['skill_1', 'skill_2', 'skill_3'];

          const { id: campaignId } = _buildCampaignForSkills(skillIds);

          const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
            { skillId: 'skill_1', status: 'validated', earnedPix: 1 },
            { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
            { skillId: 'skill_3', status: 'validated', earnedPix: 5 },
          ]);

          await databaseBuilder.commit();

          const learningContent = {
            skills: [
              { id: 'skill_1', status: 'actif' },
              { id: 'skill_2', status: 'archivé' },
              { id: 'skill_3', status: 'périmé' },
            ],
          };
          mockLearningContent(learningContent);

          //when
          const participantResultsShared = await participantResultsSharedRepository.get(participation.id);
          expect(participantResultsShared.masteryRate).to.equals(1);
          expect(participantResultsShared.id).to.equal(participation.id);
          expect(participantResultsShared.pixScore).to.equals(4);
          expect(participantResultsShared.validatedSkillsCount).to.equals(2);
        });
      });

      describe('when there are invalidated knowledge elements', function () {
        it('computes the participant results counting only validated knowledge element for the mastery percentage and validated skills count', async function () {
          const skillIds = ['skill_1', 'skill_2', 'skill_3'];

          const { id: campaignId } = _buildCampaignForSkills(skillIds);

          const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
            { skillId: 'skill_1', status: 'validated', earnedPix: 1 },
            { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
            { skillId: 'skill_3', status: 'invalidated', earnedPix: 0 },
          ]);

          await databaseBuilder.commit();

          const learningContent = {
            skills: [
              { id: 'skill_1', status: 'actif' },
              { id: 'skill_2', status: 'actif' },
              { id: 'skill_3', status: 'actif' },
            ],
          };
          mockLearningContent(learningContent);

          //when
          const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

          expect(participantResultsShared.id).to.equal(participation.id);
          expect(participantResultsShared.masteryRate).to.equals(2 / 3);
          expect(participantResultsShared.pixScore).to.equals(4);
          expect(participantResultsShared.validatedSkillsCount).to.equals(2);
        });
      });
    });

    it('return results for the given campaign participation', async function () {
      const { id: campaignId } = _buildCampaignForSkills(['skill_1']);

      _buildParticipationWithSnapshot({}, []);

      const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
        { skillId: 'skill_1', status: 'validated', earnedPix: 1 },
      ]);

      await databaseBuilder.commit();

      const learningContent = { skills: [{ id: 'skill_1', status: 'actif' }] };
      mockLearningContent(learningContent);

      //when
      const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

      expect(participantResultsShared.masteryRate).to.equals(1);
    });
  });
});

function _buildCampaignForSkills(skillIds) {
  const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ skillId, targetProfileId });
  });

  return databaseBuilder.factory.buildCampaign({ targetProfileId, type: Campaign.types.ASSESSMENT });
}

function _buildParticipationWithSnapshot(participationAttributes, knowledgeElementsAttributes) {
  const participation = databaseBuilder.factory.buildCampaignParticipation(participationAttributes);

  databaseBuilder.factory.knowledgeElementSnapshotFactory.buildSnapshot({
    userId: participation.userId,
    snappedAt: participation.sharedAt,
    knowledgeElementsAttributes,
  });

  return participation;
}
