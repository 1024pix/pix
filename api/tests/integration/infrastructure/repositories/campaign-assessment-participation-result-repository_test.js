const { expect, databaseBuilder, airtableBuilder, knex } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const CampaignAssessmentParticipationResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const campaignAssessmentParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-result-repository');

describe('Integration | Repository | Campaign Assessment Participation Result', () => {

  describe('#getByCampaignIdAndCampaignParticipationId', () => {

    beforeEach(() => {
      const areas = [airtableBuilder.factory.buildArea({ competenceIds: ['rec1', 'rec2', 'rec3'], couleur: 'orange' })];
      const competences = [
        airtableBuilder.factory.buildCompetence({ id: 'rec1', domaineIds: [areas[0].id], sousDomaine: '1.1', acquisViaTubes: ['skill1'], titre: 'Compétence 1' }),
        airtableBuilder.factory.buildCompetence({ id: 'rec2', domaineIds: [areas[0].id], sousDomaine: '1.2', acquisViaTubes: ['skill2'], titre: 'Compétence 2' }),
        airtableBuilder.factory.buildCompetence({ id: 'rec3', domaineIds: [areas[0].id], sousDomaine: '1.3', acquisViaTubes: ['skill3'], titre: 'Other Competence' }),
      ];
      const skills = [
        airtableBuilder.factory.buildSkill({ id: 'skill1', nom: '@acquis1', ['compétenceViaTube']: ['rec1'] }),
        airtableBuilder.factory.buildSkill({ id: 'skill2', nom: '@acquis2', ['compétenceViaTube']: ['rec2'] }),
        airtableBuilder.factory.buildSkill({ id: 'skill3', nom: '@autreAcquis', ['compétenceViaTube']: ['rec3'] })
      ];
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns(areas).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns(competences).activate();
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns(skills).activate();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      cache.flushAll();
      return knex('knowledge-element-snapshots').delete();
    });

    let campaignId, campaignParticipationId;

    context('When there is an assessment for another campaign and another participation', () => {
      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}).id;

        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId
        }, {}).campaignParticipationId;

        databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId: campaignId
        }, {});

        const otherCampaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildAssessmentFromParticipation({
          campaignId: otherCampaign.id
        }, {});

        await databaseBuilder.commit();
      });

      it('matches the given campaign and given participation', async () => {
        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.campaignId).to.equal(campaignId);
        expect(campaignAssessmentParticipationResult.campaignParticipationId).to.equal(campaignParticipationId);
      });

      it('create campaignAssessmentParticipationResult', async () => {
        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult).to.be.instanceOf(CampaignAssessmentParticipationResult);
      });
    });

    context('When campaign participation is not shared', () => {
      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildAssessmentCampaign({}, [{ id: 'skill1' }]).id;
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          isShared: false,
          sharedAt: null,
          campaignId
        }, {}).campaignParticipationId;

        await databaseBuilder.commit();
      });

      it('does not fill results attributes', async () => {
        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal([]);
        expect(campaignAssessmentParticipationResult.isShared).to.equal(false);
      });
    });

    context('When campaign participation is shared', () => {
      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, [{ id: 'skill1' }, { id: 'skill2' }]).id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          sharedAt: new Date('2020-01-02')
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
        await databaseBuilder.commit();
      });

      it('fills competenceResults', async () => {
        const expectedResult = [
          {
            areaColor: 'orange',
            id: 'rec1',
            index: '1.1',
            name: 'Compétence 1',
            totalSkillsCount: 1,
            validatedSkillsCount: 1
          },
          {
            areaColor: 'orange',
            id: 'rec2',
            index: '1.2',
            name: 'Compétence 2',
            totalSkillsCount: 1,
            validatedSkillsCount: 0,
          }
        ];

        const campaignAssessmentParticipationResult = await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

        expect(campaignAssessmentParticipationResult.isShared).to.equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).to.equal(2);
        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal(expectedResult);
      });
    });
  });
});
