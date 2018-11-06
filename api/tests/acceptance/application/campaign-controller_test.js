const faker = require('faker');
const server = require('../../../server');
const { knex, expect, generateValidRequestAuhorizationHeader, databaseBuilder, airtableBuilder } = require('../../test-helper');

describe('Acceptance | API | Campaigns', () => {

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

    it('should return 201 and the campaign when it has been successfully created', function() {
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
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('campaigns');
        expect(response.result.data.attributes.name).to.equal('L‘hymne de nos campagnes');
        expect(response.result.data.attributes.code).to.exist;
      });
    });

    it('should return 403 Unauthorized when a user try to create a campaign for an organization that he does not access', function() {
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
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].title).to.equal('Forbidden Error');
      });
    });

    it('should return 403 Unauthorized when a user try to create a campaign with a profile not shared with his organization', function() {
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
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].title).to.equal('Forbidden Error');
      });
    });

  });

  describe('GET /api/campaigns', () => {

    const options = {
      method: 'GET',
      url: '/api/campaigns?filter[code]=AZERTY123',
    };
    let insertedCampaign;

    beforeEach(async () => {
      insertedCampaign = databaseBuilder.factory.buildCampaign({ name: 'Ou est Brandone 1.0', code: 'AZERTY123' });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaign found for the given code', () => {
      // given
      options.headers = { authorization: generateValidRequestAuhorizationHeader() };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const campaign = response.result.data[0];
        expect(response.statusCode).to.equal(200);
        expect(campaign).to.exist;
        expect(campaign.type).to.equal('campaigns');
        expect(campaign.attributes.name).to.equal(insertedCampaign.name);
        expect(campaign.attributes.code).to.equal(insertedCampaign.code);
      });
    });

  });

});
