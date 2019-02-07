const faker = require('faker');
const createServer = require('../../../server');
const { knex, expect, generateValidRequestAuhorizationHeader, databaseBuilder, airtableBuilder } = require('../../test-helper');

describe('Acceptance | API | Campaigns', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/campaigns', () => {

    let organization;
    let user;
    let otherUser;
    let targetProfile;
    let targetProfileNotAccessibleToUser;

    beforeEach(() => {
      user = databaseBuilder.factory.buildUser({});
      otherUser = databaseBuilder.factory.buildUser({});
      organization = databaseBuilder.factory.buildOrganization({ userId: user.id });
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id
      });
      targetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId: organization.id, isPublic: false });
      targetProfileNotAccessibleToUser = databaseBuilder.factory.buildTargetProfile({ organizationId: 0, isPublic: false });

      airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .returns(airtableBuilder.factory.buildSkill())
        .activate();

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('campaigns').delete()
        .then(() => databaseBuilder.clean())
        .then(() => airtableBuilder.cleanAll());
    });

    it('should return 201 and the campaign when it has been successfully created', async function() {
      const options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'L‘hymne de nos campagnes',
              'organization-id': organization.id,
            },
            relationships: {
              'target-profile': {
                data: {
                  id: targetProfile.id
                }
              }
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal('campaigns');
      expect(response.result.data.attributes.name).to.equal('L‘hymne de nos campagnes');
      expect(response.result.data.attributes.code).to.exist;
    });

    it('should return 403 Unauthorized when a user try to create a campaign for an organization that he does not access', async function() {
      const organizationIdThatNobodyHasAccess = 0;
      const options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuhorizationHeader(otherUser.id) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'L‘hymne de nos campagnes',
              'organization-id': organizationIdThatNobodyHasAccess,
            },
            relationships: {
              'target-profile': {
                data: {
                  id: faker.random.number()
                }
              }
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].title).to.equal('Forbidden Error');
    });

    it('should return 403 Unauthorized when a user try to create a campaign with a profile not shared with his organization', async function() {
      const options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'L‘hymne de nos campagnes',
              'organization-id': organization.id,
            },
            relationships: {
              'target-profile': {
                data: {
                  id: targetProfileNotAccessibleToUser.id
                }
              }
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].title).to.equal('Forbidden Error');
    });

  });

  describe('GET /api/campaigns', () => {

    const options = {
      method: 'GET',
      url: '/api/campaigns?filter[code]=AZERTY123',
    };
    let insertedCampaign;
    let insertedOrganization;

    beforeEach(async () => {
      insertedOrganization = databaseBuilder.factory.buildOrganization({ logoUrl: 'A côté de Mala 0.9' });
      insertedCampaign = databaseBuilder.factory.buildCampaign({
        name: 'Ou est Brandone 1.0', code: 'AZERTY123', organizationId: insertedOrganization.id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaign found for the given code', async () => {
      // given
      options.headers = { authorization: generateValidRequestAuhorizationHeader() };

      // when
      const response = await server.inject(options);

      // then
      const campaign = response.result.data[0];
      expect(response.statusCode).to.equal(200);
      expect(campaign).to.exist;
      expect(campaign.type).to.equal('campaigns');
      expect(campaign.attributes.name).to.equal(insertedCampaign.name);
      expect(campaign.attributes.code).to.equal(insertedCampaign.code);
      expect(campaign.attributes['organization-logo-url']).to.equal(insertedOrganization.logoUrl);
    });

  });

  describe('GET /api/campaigns/{id}', () => {

    let campaign;

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'My campaign',
      });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should retrieve a campaign', function() {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}`,
        headers: {
          authorization: generateValidRequestAuhorizationHeader()
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('campaigns');
        expect(response.result.data.attributes.name).to.equal(campaign.name);
        expect(response.result.data.attributes['token-for-campaign-results']).to.be.a('string');
      });
    });

    it('should returns a 404 when the campaign can not be found', function() {
      const options = {
        method: 'GET',
        url: '/api/campaigns/666',
        headers: {
          authorization: generateValidRequestAuhorizationHeader()
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('PATCH /api/campaigns/{id}', () => {

    let user, otherUser, organization, campaign;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});
      otherUser = databaseBuilder.factory.buildUser({});
      organization = databaseBuilder.factory.buildOrganization({ userId: user.id });
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id
      });
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'Name',
        title: 'Title',
        customLandingPageText: 'Text',
        organizationId: organization.id,
      });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should update a campaign title and landing page text only', function() {
      const options = {
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            id: campaign.id,
            type: 'campaigns',
            attributes: {
              name: 'New name',
              title: 'New title',
              'custom-landing-page-text': 'New text',
            },
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('campaigns');
        expect(response.result.data.id).to.equal(campaign.id);
        expect(response.result.data.attributes.name).to.equal(campaign.name);
        expect(response.result.data.attributes.title).to.equal('New title');
        expect(response.result.data.attributes['custom-landing-page-text']).to.equal('New text');
      });
    });

    it('should returns a 403 when user is not authorized to update the campaign', function() {
      const options = {
        method: 'PATCH',
        url: `/api/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(otherUser.id) },
        payload: {
          data: {
            id: campaign.id,
            type: 'campaigns',
            attributes: {
              title: 'New title',
              'custom-landing-page-text': 'New text',
            },
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(403);
      });
    });

    it('should returns a 404 when the campaign can not be found', function() {
      const options = {
        method: 'PATCH',
        url: '/api/campaigns/666',
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            id: campaign.id,
            type: 'campaigns',
            attributes: {
              title: 'New title',
              'custom-landing-page-text': 'New text',
            },
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });

  });

});
