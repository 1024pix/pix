import { expect, knex, databaseBuilder, mockLearningContent } from '../../../test-helper.js';
import { participantResultsSharedRepository } from '../../../../lib/infrastructure/repositories/participant-results-shared-repository.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../lib/domain/constants.js';

describe('Integration | Repository | Campaign Participant Result Shared Repository', function () {
  describe('#save', function () {
    it('updates the campaign participation', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        pixScore: null,
        masteryRate: null,
        validatedSkillsCount: null,
        isCertifiable: null,
      });
      await databaseBuilder.commit();
      const participantResultsShared = {
        id: 1,
        pixScore: 42,
        masteryRate: 0.03,
        validatedSkillsCount: 21,
        isCertifiable: true,
      };

      await participantResultsSharedRepository.save(participantResultsShared);

      const campaignParticipation = await knex('campaign-participations').where({ id: 1 }).first();

      expect(campaignParticipation).to.deep.includes({
        id: 1,
        pixScore: 42,
        masteryRate: '0.03',
        validatedSkillsCount: 21,
        isCertifiable: true,
      });
    });

    context('when there is several campaign', function () {
      it('updates the campaign participation with correct id', async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          id: 1,
          pixScore: null,
          masteryRate: null,
          validatedSkillsCount: null,
          isCertifiable: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          id: 2,
          pixScore: null,
          masteryRate: null,
          validatedSkillsCount: null,
          isCertifiable: null,
        });
        await databaseBuilder.commit();

        const participantResultsShared = {
          id: 2,
          pixScore: 42,
          masteryRate: 0.03,
          validatedSkillsCount: 21,
          isCertifiable: true,
        };

        await participantResultsSharedRepository.save(participantResultsShared);

        const campaignParticipation1 = await knex('campaign-participations').where({ id: 1 }).first();
        const campaignParticipation2 = await knex('campaign-participations').where({ id: 2 }).first();

        expect(campaignParticipation1).to.deep.includes({
          id: 1,
          pixScore: null,
          masteryRate: null,
          validatedSkillsCount: null,
          isCertifiable: null,
        });
        expect(campaignParticipation2).to.deep.includes({
          id: 2,
          pixScore: 42,
          masteryRate: '0.03',
          validatedSkillsCount: 21,
          isCertifiable: true,
        });
      });
    });
  });

  describe('#get', function () {
    describe('when there is no target profile', function () {
      it('computes the participant results for the complete learning content', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 0 },
          { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
          { skillId: 'skill_3', status: 'validated', earnedPix: 1 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [{ id: 'skill_1' }, { id: 'skill_2' }, { id: 'skill_3' }],
          competences: [],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.masteryRate).to.equals(4 / (16 * MAX_REACHABLE_PIX_BY_COMPETENCE));
        expect(participantResultsShared.id).to.equal(participation.id);
        expect(participantResultsShared.pixScore).to.equals(4);
        expect(participantResultsShared.validatedSkillsCount).to.equals(3);
      });

      it('computes isCertifiable as false', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'competence_1', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_2', competenceId: 'competence_2', status: 'validated', earnedPix: 0 },
          { skillId: 'skill_3', competenceId: 'competence_3', status: 'validated', earnedPix: 10 },
          { skillId: 'skill_4', competenceId: 'competence_4', status: 'validated', earnedPix: 11 },
          { skillId: 'skill_5', competenceId: 'competence_5', status: 'invalidated', earnedPix: 0 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [
            { id: 'skill_1', competenceId: 'competence_1' },
            { id: 'skill_2', competenceId: 'competence_2' },
            { id: 'skill_3', competenceId: 'competence_3' },
            { id: 'skill_4', competenceId: 'competence_4' },
            { id: 'skill_5', competenceId: 'competence_5' },
          ],
          competences: [
            { id: 'competence_1', origin: 'Pix' },
            { id: 'competence_2', origin: 'Pix' },
            { id: 'competence_3', origin: 'Pix' },
            { id: 'competence_4', origin: 'Pix' },
            { id: 'competence_5', origin: 'Pix' },
          ],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.isCertifiable).to.be.false;
      });

      it('computes isCertifiable as true', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'competence_1', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_2', competenceId: 'competence_2', status: 'validated', earnedPix: 9 },
          { skillId: 'skill_3', competenceId: 'competence_3', status: 'validated', earnedPix: 10 },
          { skillId: 'skill_4', competenceId: 'competence_4', status: 'validated', earnedPix: 11 },
          { skillId: 'skill_5', competenceId: 'competence_5', status: 'validated', earnedPix: 12 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [
            { id: 'skill_1', competenceId: 'competence_1' },
            { id: 'skill_2', competenceId: 'competence_2' },
            { id: 'skill_3', competenceId: 'competence_3' },
            { id: 'skill_4', competenceId: 'competence_4' },
            { id: 'skill_5', competenceId: 'competence_5' },
          ],
          competences: [
            { id: 'competence_1', origin: 'Pix' },
            { id: 'competence_2', origin: 'Pix' },
            { id: 'competence_3', origin: 'Pix' },
            { id: 'competence_4', origin: 'Pix' },
            { id: 'competence_5', origin: 'Pix' },
          ],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.isCertifiable).to.be.true;
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
          competences: [],
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
            competences: [],
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
            competences: [],
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

      it('computes isCertifiable as null', async function () {
        const skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4', 'skill_5'];

        const { id: campaignId } = _buildCampaignForSkills(skillIds);

        const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'competence_1', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_2', competenceId: 'competence_2', status: 'validated', earnedPix: 9 },
          { skillId: 'skill_3', competenceId: 'competence_3', status: 'validated', earnedPix: 10 },
          { skillId: 'skill_4', competenceId: 'competence_4', status: 'validated', earnedPix: 11 },
          { skillId: 'skill_5', competenceId: 'competence_5', status: 'validated', earnedPix: 12 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [
            { id: 'skill_1', competenceId: 'competence_1', status: 'actif' },
            { id: 'skill_2', competenceId: 'competence_2', status: 'actif' },
            { id: 'skill_3', competenceId: 'competence_3', status: 'actif' },
            { id: 'skill_4', competenceId: 'competence_4', status: 'actif' },
            { id: 'skill_5', competenceId: 'competence_5', status: 'actif' },
          ],
          competences: [
            { id: 'competence_1', origin: 'Pix' },
            { id: 'competence_2', origin: 'Pix' },
            { id: 'competence_3', origin: 'Pix' },
            { id: 'competence_4', origin: 'Pix' },
            { id: 'competence_5', origin: 'Pix' },
          ],
        };
        mockLearningContent(learningContent);

        //when
        const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

        expect(participantResultsShared.isCertifiable).to.be.null;
      });
    });

    it('return results for the given campaign participation', async function () {
      const { id: campaignId } = _buildCampaignForSkills(['skill_1']);

      _buildParticipationWithSnapshot({}, []);

      const participation = _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
        { skillId: 'skill_1', status: 'validated', earnedPix: 1 },
      ]);

      await databaseBuilder.commit();

      const learningContent = { skills: [{ id: 'skill_1', status: 'actif' }], competences: [] };
      mockLearningContent(learningContent);

      //when
      const participantResultsShared = await participantResultsSharedRepository.get(participation.id);

      expect(participantResultsShared.masteryRate).to.equals(1);
    });
  });
});

function _buildCampaignForSkills(skillIds) {
  const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });

  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildCampaignSkill({ skillId, campaignId: campaign.id });
  });
  return campaign;
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
