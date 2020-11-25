const { expect, databaseBuilder, mockLearningContent, knex } = require('../../../test-helper');
const CampaignProfilesCollectionParticipationSummary = require('../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary');
const campaignProfilesCollectionParticipationSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-profiles-collection-participation-summary-repository');

describe('Integration | Repository | Campaign Profiles Collection Participation Summary repository', () => {

  describe('#findPaginatedByCampaignId', () => {

    let campaignId, organizationId;
    let competences;
    let skills;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async () => {
      const learningContentData = buildLearningContentData();
      competences = learningContentData.competences;
      skills = learningContentData.skills;

      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
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
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jérémy', lastName: 'bugietta' }, campaignParticipation, false);
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
        }),
      ]);
    });

    it('should return participants data summary only for the given campaign id', async () => {
      // given
      const campaignParticipation1 = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation1, false);
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation2, false);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc (including schooling registration data)', async () => {
      // given
      const campaignParticipation = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Jaja', lastName: 'Le raplapla', organizationId }, campaignParticipation, false);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jiji', lastName: 'Le riquiqui', organizationId }, campaignParticipation, false);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jojo', lastName: 'Le rococo', organizationId }, campaignParticipation, false);
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Juju', lastName: 'Le riquiqui', organizationId }, campaignParticipation, false);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Jaja', 'Jiji', 'Juju', 'Jojo']);
    });

    describe('when a participant has shared the participation to the campaign', () => {
      let campaignParticipation;

      beforeEach(async () => {
        const createdAt = new Date('2018-04-06T10:00:00Z');
        const userId = 999;

        campaignParticipation = { id: 1, campaignId, isShared: true, sharedAt };
        databaseBuilder.factory.buildCampaignParticipationWithUser({ id: userId }, campaignParticipation, false);

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

const buildLearningContentData = () => {
  const skillWeb1 = { id: 'recSkillWeb1', name: '@web1', competenceId: 'recCompetence1', status: 'actif' };
  const skillWeb2 = { id: 'recSkillWeb2', name: '@web2', competenceId: 'recCompetence1', status: 'actif' };
  const skillUrl1 = { id: 'recSkillUrl1', name: '@url1', competenceId: 'recCompetence2', status: 'actif' };
  const skillUrl8 = { id: 'recSkillUrl8', name: '@url8', competenceId: 'recCompetence2', status: 'actif' };
  const skills = [skillWeb1, skillWeb2, skillUrl1, skillUrl8];

  const competence1 = {
    id: 'recCompetence1',
    nameFrFr: 'Competence1',
    index: '1.1',
    areaId: 'recArea1',
    skillIds: [skillWeb1.id, skillWeb2.id],
    origin: 'Pix',
  };

  const competence2 = {
    id: 'recCompetence2',
    nameFrFr: 'Competence2',
    index: '3.2',
    areaId: 'recArea3',
    skillIds: [skillUrl1.id, skillUrl8.id],
    origin: 'Pix',
  };

  const competences = [competence1, competence2];

  const area1 = { id: 'recArea1', code: '1', titleFrFr: 'Domain 1', competenceIds: ['recCompetence1'] };
  const area3 = { id: 'recArea3', code: '3', titleFrFr: 'Domain 3', competenceIds: ['recCompetence2'] };

  const learningContent = {
    areas: [area1, area3],
    competences,
    skills,
  };

  mockLearningContent(learningContent);

  return { competences, skills };
};
