const createServer = require('../../../../server');
const Membership = require('../../../../lib/domain/models/Membership');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const { expect, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

describe('Acceptance | API | Campaign Participations | Analyses', () => {

  let server, options, userId, organization, targetProfile, campaign, campaignParticipation;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/campaign-participations/{id}/analyses', () => {

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      targetProfile = databaseBuilder.factory.buildTargetProfile({
        organizationId: organization.id,
        name: 'Profile 3'
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkillId1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkillId2' });
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°3',
        organizationId: organization.id,
        targetProfileId: targetProfile.id
      });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        isShared: true,
      });

      await databaseBuilder.commit();

      const area = airtableBuilder.factory.buildArea({ competenceIds: ['recCompetence1'], couleur: 'specialColor' });
      const competence1 = airtableBuilder.factory.buildCompetence({ id: 'recCompetence1', titre: 'Fabriquer un meuble', acquisViaTubes: [ 'recSkillId1' ], domaineIds: [ area.id ] });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([
        airtableBuilder.factory.buildSkill({ id: 'recSkillId1', ['compétenceViaTube']: [ 'recCompetence1' ], tube: ['recTube1'] }),
      ]).activate();
      const tube1 = airtableBuilder.factory.buildTube({ id: 'recTube1', titrePratique: 'Monter une étagère', competences: [ 'recCompetence1' ] });
      airtableBuilder.mockList({ tableName: 'Tubes' }).returns([ tube1 ]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([ competence1 ]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([ area ]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return the campaign participation analyses', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedCampaignParticipationAnalysis = {
        data: {
          type: 'campaign-analyses',
          id: campaign.id.toString(),
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [{
                id: `${campaign.id}_recTube1`,
                type: 'campaignTubeRecommendations'
              }]
            },
          },
        },
        included: [{
          id: `${campaign.id}_recTube1`,
          type: 'campaignTubeRecommendations',
          attributes: {
            'area-color': 'specialColor',
            'tube-id': 'recTube1',
            'competence-id': 'recCompetence1',
            'competence-name': 'Fabriquer un meuble',
            'tube-practical-title': 'Monter une étagère',
            'average-score': 30,
          },
        }]
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCampaignParticipationAnalysis);
    });
  });
});
