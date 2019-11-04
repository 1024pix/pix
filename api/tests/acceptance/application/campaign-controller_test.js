const createServer = require('../../../server');
const { expect, databaseBuilder, airtableBuilder } = require('../../test-helper');
const settings = require('../../../lib/config');
const jwt = require('jsonwebtoken');
const Membership = require('../../../lib/domain/models/Membership');
const cache = require('../../../lib/infrastructure/caches/cache');

describe('Acceptance | API | Campaign Controller', () => {

  let campaign;
  let campaignWithoutOrga;
  let organization;
  let targetProfile;
  let server;

  beforeEach(async () => {
    await databaseBuilder.clean();
    server = await createServer();
    organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    targetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId: organization.id });
    campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, targetProfileId: targetProfile.id });
    campaignWithoutOrga = databaseBuilder.factory.buildCampaign({ organizationId: null });
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('GET /api/campaign', () => {

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

    it('should return an InternalError if there is no organization link to the code', async () => {
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
        expect(response.result.data[0].attributes['is-restricted']).to.be.true;
      });
    });
  });

  describe('GET /api/campaign/{id}/csvResult', ()=> {

    let accessToken;
    let user;
    let userId;
    const externalId = 'my external id';
    const assessmentStartDate = '2018-01-01';

    function _createTokenWithAccessId(userId) {
      return jwt.sign({
        access_id: userId,
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
    }

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      userId = user.id;
      accessToken = _createTokenWithAccessId(userId);

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: userId,
        participantExternalId: externalId,
        isShared: false,
      });

      databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: 'SMART_PLACEMENT',
        createdAt: new Date(assessmentStartDate),
        campaignParticipationId: campaignParticipation.id
      });

      await databaseBuilder.commit();

      const competence1 = airtableBuilder.factory.buildCompetence({ id: 1, titre: 'Liberticide', acquisViaTubes: 'recSkillIds1' });
      airtableBuilder.mockList({ tableName: 'Acquis' }).returns([]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence1]).activate();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([]).activate();
    });

    afterEach(async () => {
      await airtableBuilder.cleanAll();
      await cache.flushAll();
    });

    it('should return csv file with statusCode 200', async ()=> {

      // given
      const url = `/api/campaigns/${campaign.id}/csvResults?accessToken=${accessToken}`;
      const request = {
        method: 'GET',
        url
      };

      const expectedCsv = `\uFEFF"Nom de l'organisation";"ID Campagne";"Nom de la campagne";"Nom du Profil Cible";"Nom du Participant";"Prénom du Participant";"${campaign.idPixLabel}";"% de progression";"Date de début";"Partage (O/N)";"Date du partage";"% maitrise de l'ensemble des acquis du profil"\n` +
        `"${organization.name}";${campaign.id};"${campaign.name}";"${targetProfile.name}";"${user.lastName}";"${user.firstName}";"${externalId}";1;${assessmentStartDate};"Non";"NA";"NA"\n`;

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200, response.payload);
      expect(response.result).to.equal(expectedCsv);
    });
  });
});
