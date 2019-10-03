const createServer = require('../../../server');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Controller', () => {

  let campaign;
  let campaignWithoutOrga;
  let organization;
  let server;
  let user;
  let user2;

  beforeEach(async () => {
    await databaseBuilder.clean();
    server = await createServer();
    organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
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
      });
    });

    context('when organization manage student', () => {

      beforeEach(async () => {
        user = databaseBuilder.factory.buildUser();
        user2 = databaseBuilder.factory.buildUser();
        organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
        databaseBuilder.factory.buildStudent({ organizationId: organization.id, firstName: user.firstName, lastName: user.lastName });
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        campaignWithoutOrga = databaseBuilder.factory.buildCampaign({ organizationId: null });
        await databaseBuilder.commit();
      });

      it('should return the campaign ask by code', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/campaigns/?filter[code]=${campaign.code}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].attributes.code).to.equal(campaign.code);
        expect(response.result.data[0].attributes['organization-logo-url']).to.equal(organization.logoUrl);
      });

      it('should return an UserNotAuthorizedToAccessEntity error if user is not part of organization student list', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/campaigns/?filter[code]=${campaign.code}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user2.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].title).to.equal('Forbidden');
        expect(response.result.errors[0].detail).to.equal('Utilisateur non autorisé à accéder à la ressource');
      });
    });

  });
});
