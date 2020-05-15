const faker = require('faker');
const jwt = require('jsonwebtoken');
const createServer = require('../../../server');
const { expect, databaseBuilder, airtableBuilder, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const settings = require('../../../lib/config');
const Membership = require('../../../lib/domain/models/Membership');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | API | Campaign Controller', () => {

  let campaign;
  let organization;
  let targetProfile;
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/campaign', function() {

    let campaignWithoutOrga;

    beforeEach(async () => {
      campaignWithoutOrga = databaseBuilder.factory.buildCampaign({ organizationId: null });
      await databaseBuilder.commit();
    });

    it('should return one NotFoundError if there is no campaign link to the code', async () => {
      // given
      const fakeCamapignCode = 'FAKE_CAMPAIGN_CODE';
      const options = {
        method: 'GET',
        url: `/api/campaigns/?filter[code]=${fakeCamapignCode}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].title).to.equal('Not Found');
      expect(response.result.errors[0].detail).to.equal(`Campaign with code ${fakeCamapignCode} not found`);
    });

    it('should return an NotFoundError if there is no organization link to the code', async () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/campaigns/?filter[code]=${campaignWithoutOrga.code}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].title).to.equal('Not Found');
      expect(response.result.errors[0].detail).to.equal(`Not found organization for ID ${null}`);
    });

    context('when organization does not manage student', () => {

      beforeEach(async () => {
        organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        campaignWithoutOrga = databaseBuilder.factory.buildCampaign({ organizationId: null });
        await databaseBuilder.commit();
      });

      it('should return the campaign ask by code', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/campaigns/?filter[code]=${campaign.code}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].attributes.code).to.equal(campaign.code);
        expect(response.result.data[0].attributes['organization-logo-url']).to.equal(organization.logoUrl);
        expect(response.result.data[0].attributes['organization-name']).to.equal(organization.name);
        expect(response.result.data[0].attributes['is-restricted']).to.be.false;
      });
    });

    context('when organization manage student and is type SCO', () => {

      beforeEach(async () => {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        await databaseBuilder.commit();
      });

      it('should return the campaign ask by code', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/campaigns/?filter[code]=${campaign.code}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].attributes.code).to.equal(campaign.code);
        expect(response.result.data[0].attributes['organization-logo-url']).to.equal(organization.logoUrl);
        expect(response.result.data[0].attributes['organization-name']).to.equal(organization.name);
        expect(response.result.data[0].attributes['is-restricted']).to.be.true;
      });
    });
  });

  describe('GET /api/campaign/{id}/collective-result', function() {

    let userId;
    const participationStartDate = '2018-01-01';
    const assessmentStartDate = '2018-01-02';

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      organization = databaseBuilder.factory.buildOrganization();
      targetProfile = databaseBuilder.factory.buildTargetProfile({
        organizationId: organization.id,
        name: 'Profile 2'
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkillId1' });
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°2',
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        idPixLabel: 'Identifiant entreprise'
      });

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

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        isShared: true,
        createdAt: new Date(participationStartDate),
        sharedAt: new Date('2018-01-27'),
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        userId,
        type: 'SMART_PLACEMENT',
        createdAt: new Date(assessmentStartDate),
        campaignParticipationId: campaignParticipation.id
      });

      databaseBuilder.factory.buildKnowledgeElement({
        skillId: 'recSkillId1',
        status: 'validated',
        userId,
        assessmentId: assessment.id,
        competenceId: 'recCompetence1',
        createdAt: faker.date.past(10, campaignParticipation.sharedAt)
      });

      await databaseBuilder.commit();

      const area = airtableBuilder.factory.buildArea({ competenceIds: ['recCompetence1'], couleur: 'specialColor' });
      const competence1 = airtableBuilder.factory.buildCompetence({
        id: 'recCompetence1',
        titre: 'Fabriquer un meuble',
        domaineIds: [area.id]
      });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([
        airtableBuilder.factory.buildSkill({ id: 'recSkillId1', ['compétenceViaTube']: ['recCompetence1'] }),
        airtableBuilder.factory.buildSkill({ id: 'recSkillId2', ['compétenceViaTube']: ['recCompetence1'] }),
      ]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence1]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return campaign collective result with status code 200', async () => {
      // given
      const url = `/api/campaigns/${campaign.id}/collective-results`;
      const request = {
        method: 'GET',
        url,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      const expectedResult = {
        data: {
          type: 'campaign-collective-results',
          id: campaign.id.toString(),
          attributes: {},
          relationships: {
            'campaign-competence-collective-results': {
              data: [{
                id: `${campaign.id}_recCompetence1`,
                type: 'campaignCompetenceCollectiveResults'
              }]
            },
          },
        },
        included: [{
          id: `${campaign.id}_recCompetence1`,
          type: 'campaignCompetenceCollectiveResults',
          attributes: {
            'area-code': '1',
            'area-color': 'specialColor',
            'average-validated-skills': 1,
            'competence-id': 'recCompetence1',
            'competence-name': 'Fabriquer un meuble',
            'total-skills-count': 2,
          },
        }]
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
      expect(response.result).to.deep.equal(expectedResult);
    });
  });

  describe('GET /api/campaign/{id}/csv-assessment-results', function() {

    let accessToken;

    function _createTokenWithAccessId(userId) {
      return jwt.sign({
        access_id: userId,
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
    }

    beforeEach(async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      accessToken = _createTokenWithAccessId(userId);

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([airtableBuilder.factory.buildSkill()]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([airtableBuilder.factory.buildCompetence()]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([airtableBuilder.factory.buildArea()]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return csv file with statusCode 200', async () => {

      // given
      const url = `/api/campaigns/${campaign.id}/csv-assessment-results?accessToken=${accessToken}`;
      const request = {
        method: 'GET',
        url
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
    });
  });

  describe('GET /api/campaign/{id}/csv-profiles-collection-results', function() {

    let accessToken;

    function _createTokenWithAccessId(userId) {
      return jwt.sign({
        access_id: userId,
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
    }

    beforeEach(async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      accessToken = _createTokenWithAccessId(userId);

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([airtableBuilder.factory.buildSkill()]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([airtableBuilder.factory.buildCompetence()]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([airtableBuilder.factory.buildArea()]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return csv file with statusCode 200', async () => {
      // given
      const url = `/api/campaigns/${campaign.id}/csv-profiles-collection-results?accessToken=${accessToken}`;
      const request = {
        method: 'GET',
        url
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
    });
  });

  describe('GET /api/campaign/{id}/analyses', function() {

    let userId;

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
      databaseBuilder.factory.buildCampaignParticipation({ isShared: true, campaignId: campaign.id });

      await databaseBuilder.commit();

      const area = airtableBuilder.factory.buildArea({ competenceIds: ['recCompetence1'], couleur: 'specialColor' });
      const competence1 = airtableBuilder.factory.buildCompetence({
        id: 'recCompetence1',
        titre: 'Fabriquer un meuble',
        acquisViaTubes: ['recSkillId1'],
        domaineIds: [area.id]
      });
      const tutorial = airtableBuilder.factory.buildTutorial({
        id: 'recTutorial1',
        titre: 'Apprendre à vivre confiné',
        format: '2 mois',
        source: 'covid-19',
        lien: 'www.liberez-moi.fr',
        createdTime: '2020-03-16T14:38:03.000Z'
      });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([
        airtableBuilder.factory.buildSkill({
          id: 'recSkillId1',
          'compétenceViaTube': ['recCompetence1'],
          tube: ['recTube1'],
          comprendre: [tutorial.id]
        }),
      ]).activate();
      const tube1 = airtableBuilder.factory.buildTube({
        id: 'recTube1',
        titrePratique: 'Monter une étagère',
        competences: ['recCompetence1']
      });
      airtableBuilder.mockList({ tableName: 'Tubes' }).returns([tube1]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence1]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area]).activate();
      airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([tutorial]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return campaign analysis with status code 200', async () => {
      // given
      const url = `/api/campaigns/${campaign.id}/analyses`;
      const request = {
        method: 'GET',
        url,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      const expectedResult = {
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
          'id': 'recTutorial1',
          'type': 'tutorials',
          attributes: {
            'duration': '00:03:31',
            'format': '2 mois',
            'id': 'recTutorial1',
            'link': 'www.liberez-moi.fr',
            'source': 'covid-19',
            'title': 'Apprendre à vivre confiné'
          },
        }, {
          id: `${campaign.id}_recTube1`,
          type: 'campaignTubeRecommendations',
          attributes: {
            'area-color': 'specialColor',
            'tube-id': 'recTube1',
            'competence-id': 'recCompetence1',
            'competence-name': 'Fabriquer un meuble',
            'tube-practical-title': 'Monter une étagère',
            'average-score': 30
          },
          relationships: {
            tutorials: {
              data: [{
                'id': 'recTutorial1',
                'type': 'tutorials',
              }]
            }
          }
        }]
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
      expect(response.result).to.deep.equal(expectedResult);
    });
  });

  describe('POST /api/campaign', () => {

    let options, payload;

    beforeEach(async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization({ canCollectProfiles: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });
      targetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId: organization.id });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'recSkill1' });
      await databaseBuilder.commit();

      const skill = airtableBuilder.factory.buildSkill({ id: 'recSkill1' });

      airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .returns([skill])
        .activate();

      payload = {
        data: {
          type: 'campaign',
          attributes: {
            'name': 'Campagne collège',
            'type': 'ASSESSMENT',
            'organization-id': `${organization.id}`,
          },
          relationships: {
            'target-profile': {
              data: {
                type: 'target-profiles',
                id: `${targetProfile.id}`
              }
            }
          }
        }
      };
      options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload
      };
    });

    afterEach(async () => {
      await knex('campaigns').delete();
      await airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should return 201 status code and the campaign created with type ASSESSMENT', async () => {
      // when
      const response = await server.inject(options, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.attributes.name).to.equal('Campagne collège');
      expect(response.result.data.attributes.type).to.equal('ASSESSMENT');
    });

    it('should return 201 status code and the campaign created with type PROFILES_COLLECTION', async () => {
      // given
      payload = {
        data: {
          type: 'campaign',
          attributes: {
            'name': 'Campagne lycée',
            'type': 'PROFILES_COLLECTION',
            'organization-id': `${organization.id}`,
          },
          relationships: {
            'target-profile': {
              data: {
                type: 'target-profiles',
                id: undefined,
              }
            }
          }
        }
      };
      options.payload = payload;

      // when
      const response = await server.inject(options, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.attributes.name).to.equal('Campagne lycée');
      expect(response.result.data.attributes.type).to.equal('PROFILES_COLLECTION');
    });

    it('should return 403 status code when the user does not have access', async () => {
      // given
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuthorizationHeader(anotherUserId) },
        payload
      };

      // when
      const response = await server.inject(options, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{id}/profiles-collection/participations', () => {
    it('should returns collect profile campaign participations', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Bono' }).id;
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        organizationId: organization.id,
        name: 'Profile 3'
      });
      const campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne de Test N°3',
        organizationId: organization.id,
        targetProfileId: targetProfile.id
      });

      const participantId = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Bob' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ isShared: true, campaignId: campaign.id, userId: participantId });

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/profiles-collection/participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].attributes['first-name']).to.equal('Robert');
      expect(response.result.data[0].attributes['last-name']).to.equal('Bob');
    });
  });
});
