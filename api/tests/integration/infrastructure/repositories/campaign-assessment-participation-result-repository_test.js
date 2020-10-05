const { expect, databaseBuilder, airtableBuilder, domainBuilder, knex } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const campaignAssessmentParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-result-repository');

describe('Integration | Repository | Campaign Assessment Participation Result', () => {

  describe('#getByCampaignIdAndCampaignParticipationId', () => {

    let campaignId, campaignParticipationId, targetProfileId;

    beforeEach(() => {
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'skill1', name: '@acquis1', tubeId: 'recTube1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'skill2', name: '@acquis2', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'rec1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2], competenceId: 'rec2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'rec1', tubes: [tube1], index: '1.1', name: 'Compétence 1', areaId: 'recArea0' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'rec2', tubes: [tube2], index: '1.2', name: 'Compétence 2', areaId: 'recArea0' });
      const area = domainBuilder.buildTargetedArea({ id: 'recArea0', color: 'orange', competences: [competence1, competence2] });
      const domainTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area],
      });
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });

      const airTableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({
        targetProfile: domainTargetProfile,
      });
      airtableBuilder.mockLists(airTableObjects);
      return databaseBuilder.commit();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      cache.flushAll();
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
        const expectedResult = [
          {
            areaColor: 'orange',
            id: 'rec1',
            index: '1.1',
            name: 'Compétence 1',
            targetedSkillsCount: 1,
            validatedSkillsCount: 1,
          },
          {
            areaColor: 'orange',
            id: 'rec2',
            index: '1.2',
            name: 'Compétence 2',
            targetedSkillsCount: 1,
            validatedSkillsCount: 0,
          },
        ];

        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.isShared).to.equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).to.equal(2);
        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal(expectedResult);
      });
    });
  });
});
