const { expect, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const CampaignProfilesCollectionParticipationSummary = require('../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary');
const campaignProfilesCollectionParticipationSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-profiles-collection-participation-summary-repository');

describe('Integration | Repository | Campaign Profiles Collection Participation Summary repository', () => {

  describe('#findPaginatedByCampaignId', () => {

    let campaignId;
    let competences;
    let skills;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async () => {
      const airtableData = buildAirtableData();
      competences = airtableData.competences;
      skills = airtableData.skills;
    
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return empty array if no participant', async () => {
      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
  
      // then
      expect(results.data.length).to.equal(0);
    });
  
    it('should return participant data summary for a not shared campaign participation', async () => {
      // given
      const campaignParticipation = { id: 1, campaignId, isShared: false, sharedAt: null, participantExternalId: 'JeBu' };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jérémy', lastName: 'bugietta' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
  
      // then
      expect(results.data).to.deep.equal([
        new CampaignProfilesCollectionParticipationSummary({
          campaignParticipationId: campaignParticipation.id,
          firstName: 'Jérémy',
          lastName: 'bugietta',
          participantExternalId: 'JeBu',
          sharedAt: null,
        })
      ]);
    });

    it('should return participants data summary only for the given campaign id', async () => {
      // given
      const campaignParticipation1 = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation1);
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation2);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc', async () => {
      // given
      const campaignParticipation = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Yvonnick', lastName: 'Frin' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Arthur', lastName: 'Frin' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Estelle', lastName: 'Landry' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Arthur', 'Yvonnick', 'Estelle', 'Benjamin', 'Lise']);
    });

    describe('when a participant has shared the participation to the campaign', () => {
      let campaignParticipation;
    
      beforeEach(async () => {
        const createdAt = new Date('2018-04-06T10:00:00Z');
        const userId = 999;

        campaignParticipation = { id: 1, campaignId, isShared: true, sharedAt };
        databaseBuilder.factory.buildCampaignParticipationWithUser({ id: userId }, campaignParticipation);

        databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[0].id,
          skillId: skills[0].id,
          earnedPix: 40,
          userId,
          createdAt,
        });
      
        databaseBuilder.factory.buildKnowledgeElement({
          status: 'validated',
          competenceId: competences[1].id,
          skillId: skills[2].id,
          earnedPix: 6,
          userId,
          createdAt,
        });

        await databaseBuilder.commit();
      });

      it('should return the certification profile info and pix score', async () => {
        // when
        const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
    
        // then
        expect(results.data[0].sharedAt).to.deep.equal(sharedAt);
        expect(results.data[0].pixScore).to.equal(46);
        expect(results.data[0].certifiable).to.equal(false);
        expect(results.data[0].certifiableCompetencesCount).to.equal(1);
      });
    });
  });
});

const buildAirtableData = () => {
  const skillWeb1 = airtableBuilder.factory.buildSkill({ id: 'recSkillWeb1', nom: '@web1', ['compétenceViaTube']: ['recCompetence1'] });
  const skillWeb2 = airtableBuilder.factory.buildSkill({ id: 'recSkillWeb2', nom: '@web2', ['compétenceViaTube']: ['recCompetence1'] });
  const skillUrl1 = airtableBuilder.factory.buildSkill({ id: 'recSkillUrl1', nom: '@url1', ['compétenceViaTube']: ['recCompetence2'] });
  const skillUrl8 = airtableBuilder.factory.buildSkill({ id: 'recSkillUrl8', nom: '@url8', ['compétenceViaTube']: ['recCompetence2'] });
  const skills = [skillWeb1, skillWeb2, skillUrl1, skillUrl8];

  const competence1 = airtableBuilder.factory.buildCompetence({
    id: 'recCompetence1',
    titre: 'Competence1',
    sousDomaine: '1.1',
    domaineIds: ['recArea1'],
    acquisViaTubes: [skillWeb1.id, skillWeb2.id],
  });

  const competence2 = airtableBuilder.factory.buildCompetence({
    id: 'recCompetence2',
    titre: 'Competence2',
    sousDomaine: '3.2',
    domaineIds: ['recArea3'],
    acquisViaTubes: [skillUrl1.id, skillUrl8.id],
  });

  const competences = [competence1, competence2];

  const area1 = airtableBuilder.factory.buildArea({ id: 'recArea1', code: '1', titre: 'Domain 1' });
  const area3 = airtableBuilder.factory.buildArea({ id: 'recArea3', code: '3', title: 'Domain 3' });

  airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area1, area3]).activate();
  airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence1, competence2]).activate();
  airtableBuilder.mockList({ tableName: 'Acquis' }).returns(skills).activate();

  return { competences, skills };
};
