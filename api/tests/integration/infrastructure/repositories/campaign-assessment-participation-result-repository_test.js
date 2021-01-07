const { expect, databaseBuilder, mockLearningContent, knex } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const campaignAssessmentParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-result-repository');

describe('Integration | Repository | Campaign Assessment Participation Result', () => {

  describe('#getByCampaignIdAndCampaignParticipationId', () => {

    let campaignId, campaignParticipationId, targetProfileId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });

      const learningContent = {
        areas: [{
          id: 'recArea0',
          competenceIds: ['rec1', 'rec2'],
          color: 'orange',
        }],
        competences: [{
          id: 'rec1',
          index: '1.1',
          areaId: 'recArea0',
          skillIds: ['skill1'],
          origin: 'Pix',
          nameFrFr: 'Compétence 1',
        }, {
          id: 'rec2',
          index: '1.2',
          areaId: 'recArea0',
          skillIds: ['skill2'],
          origin: 'Pix',
          nameFrFr: 'Compétence 2',
        }],
        tubes: [{
          id: 'recTube1',
          competenceId: 'rec1',
        }, {
          id: 'recTube2',
          competenceId: 'rec2',
        }],
        skills: [{
          id: 'skill1',
          name: '@acquis1',
          status: 'actif',
          tubeId: 'recTube1',
          competenceId: 'rec1',
        }, {
          id: 'skill2',
          name: '@acquis2',
          status: 'actif',
          tubeId: 'recTube2',
          competenceId: 'rec1',
        }],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    context('When campaign participation is shared', () => {
      beforeEach(() => {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', targetProfileId }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        }).id;

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill2',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        return databaseBuilder.commit();
      });

      it('fills competenceResults', async () => {
        const expectedResult = [{
          areaColor: 'orange',
          id: 'rec1',
          index: '1.1',
          name: 'Compétence 1',
          targetedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          areaColor: 'orange',
          id: 'rec2',
          index: '1.2',
          name: 'Compétence 2',
          targetedSkillsCount: 1,
          validatedSkillsCount: 0,
        }];

        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.isShared).to.equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).to.equal(2);
        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal(expectedResult);
      });
    });
  });
});
