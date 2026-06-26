import { createServer } from '../../../../../server.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { STARTED } = CampaignParticipationStatuses;
import { CAMPAIGN_FEATURES } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';

describe('Acceptance | API | campaign-detail-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns', function () {
    it('should return the campaign requested by code', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID).id;
      databaseBuilder.factory.buildCampaignFeature({
        campaignId: campaign.id,
        featureId,
        params: { label: 'Hello', type: CampaignExternalIdTypes.STRING },
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/campaigns/?filter[code]=${campaign.code}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.code).to.equal(campaign.code);
      expect(response.result.data.attributes.type).to.equal(campaign.type);
      expect(response.result.data.attributes.title).to.equal(campaign.title);
      expect(response.result.data.attributes['is-for-absolute-novice']).to.equal(campaign.isForAbsoluteNovice);
      expect(response.result.data.attributes['external-id-label']).to.equal('Hello');
      expect(response.result.data.attributes['external-id-type']).to.equal(CampaignExternalIdTypes.STRING);
      expect(response.result.data.attributes['recommendation-engine']).to.be.false;
    });
  });

  describe('GET /api/campaigns/{campaignId}', function () {
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    let campaign;
    let userId;

    beforeEach(async function () {
      const skillId = 'recSkillId1';
      campaign = databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId });
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: campaign.organizationId,
        userId,
      });

      options.headers = generateAuthenticatedUserRequestHeaders({ userId });
      options.url = `/api/campaigns/${campaign.id}`;

      const learningContent = [
        {
          competences: [
            {
              tubes: [
                {
                  skills: [
                    {
                      id: skillId,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should return the campaign by id', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/campaigns/{campaignId}/target-profile', function () {
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    let campaign;
    let userId;
    let targetProfile;

    beforeEach(async function () {
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId: campaign.organizationId,
        userId,
      });

      options.headers = generateAuthenticatedUserRequestHeaders({ userId });
      options.url = `/api/campaigns/${campaign.id}/target-profile`;

      await databaseBuilder.commit();
    });

    it('should return the target profile', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('target-profiles');
    });
  });

  describe('GET /api/campaigns/{campaignId}/csv-profiles-collection-results', function () {
    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization();
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: 'PROFILES_COLLECTION',
      });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      options.headers = generateAuthenticatedUserRequestHeaders({ userId });
      options.url = `/api/campaigns/${campaign.id}/csv-profiles-collection-results`;

      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      nom: '@web2',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should return csv file with statusCode 200', async function () {
      // given & when
      const { statusCode, payload } = await server.inject(options);

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-profiles-collection-results`,
          headers: options.headers,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/csv-assessment-results', function () {
    let campaign;
    let organization;

    const options = {
      headers: { authorization: null },
      method: 'GET',
      url: null,
    };

    beforeEach(async function () {
      const skillId = 'rec123';
      const userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId });

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.MEMBER,
      });

      options.headers = generateAuthenticatedUserRequestHeaders({ userId });
      options.url = `/api/campaigns/${campaign.id}/csv-assessment-results`;

      const learningContent = [
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: { fr: 'Fabriquer un meuble' },
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: skillId,
                      nom: '@web2',
                      challenges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should return csv file with statusCode 200', async function () {
      // given & when
      const { statusCode, payload } = await server.inject(options);

      // then
      expect(statusCode).to.equal(200, payload);
    });

    context('when accessing another campaign with the wrong access token', function () {
      it('should return an error response with an HTTP status code 403', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: `/api/campaigns/1234567890/csv-assessment-results`,
          headers: options.headers,
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/participants-activity', function () {
    let campaign;
    let userId;
    let organizationLearner1;
    let organizationLearner2;
    let organizationLearner3;
    let campaignParticipation2;

    beforeEach(async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organizationId });

      const featureId = databaseBuilder.factory.buildFeature({
        key: CAMPAIGN_FEATURES.EXTERNAL_ID.key,
        description: CAMPAIGN_FEATURES.EXTERNAL_ID.description,
      }).id;

      databaseBuilder.factory.buildCampaignFeature({
        campaignId: campaign.id,
        featureId,
      });

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId: organizationId });

      organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'John',
        lastName: 'McClane',
        division: '5eme',
        organizationId,
      });
      organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Holly',
        lastName: 'McClane',
        division: '4eme',
        organizationId,
      });
      organizationLearner3 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Mary',
        lastName: 'McClane',
        group: 'L1',
        organizationId,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        sharedAt: new Date(2010, 1, 1),
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner1.id,
        participantExternalId: 'johnm',
      });
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: STARTED,
        organizationLearnerId: organizationLearner2.id,
        participantExternalId: 'hollym',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner3.id,
        participantExternalId: 'marrym',
      });

      return databaseBuilder.commit();
    });

    it('should return a list of participation as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(3);
    });

    it('should return two pages as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?page[number]=1&page[size]=1`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const meta = response.result.meta;
      expect(meta.pageCount).to.equal(3);
    });

    it('should return the campaign participant activity from division 5eme as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[divisions][]=5eme`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(organizationLearner1.firstName);
    });

    it('should return the campaign participant activity with status STARTED as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=STARTED`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(organizationLearner2.firstName);
    });

    it('should return the campaign participant activity filtered by search as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[search]=Mary M`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(organizationLearner3.firstName);
    });

    it('should return the campaign participant activity with group L1 as JSONAPI', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[groups][]=L1`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['first-name']).to.equal(organizationLearner3.firstName);
    });

    it('should return the campaign participant activity filtered by participantExternalId', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[participantExternalId]=hol`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      const participation = response.result.data[0].attributes;
      expect(response.result.data).to.have.lengthOf(1);
      expect(participation['participant-external-id']).to.equal(campaignParticipation2.participantExternalId);
    });

    it('should return 400 when status is not valid', async function () {
      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/participants-activity?filter[status]=bad`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organizations/{organizationId}/campaigns', function () {
    let campaignsData;
    let organizationId, otherOrganizationId;
    let userId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({}).id;
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      otherOrganizationId = databaseBuilder.factory.buildOrganization({}).id;
      campaignsData = [
        { name: 'Quand Peigne numba one', code: 'ATDGRK343', organizationId },
        { name: 'Quand Peigne numba two', code: 'KFCTSU984', organizationId },
        {
          name: 'Quand Peigne numba three',
          code: 'ABC180ELO',
          organizationId,
          archivedAt: new Date('2000-01-01T10:00:00Z'),
        },
        {
          name: 'Quand Peigne numba four',
          code: 'ABC180LEO',
          organizationId,
          archivedAt: new Date('2000-02-01T10:00:00Z'),
        },
        { name: 'Quand Peigne otha orga', code: 'CPFTQX735', organizationId: otherOrganizationId },
      ].map((camp) => {
        const builtCampaign = databaseBuilder.factory.buildCampaign(camp);
        return { name: camp.name, code: camp.code, id: builtCampaign.id };
      });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignsData[4].id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/campaigns`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
    });

    context('Something is wrong', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('when the user is not a member of the organization', function () {
      it('should respond with a 403', function () {
        // given
        userId = databaseBuilder.factory.buildUser({}).id;
        options = {
          method: 'GET',
          url: `/api/organizations/${organizationId}/campaigns`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('Retrieve campaigns', function () {
      it('should return 200 status code the organization campaigns', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(2);

        const names = campaigns.map((campaign) => campaign.attributes.name);
        expect(names).to.have.members([campaignsData[0].name, campaignsData[1].name]);

        const codes = campaigns.map((campaign) => campaign.attributes.code);
        expect(codes).to.have.members([campaignsData[0].code, campaignsData[1].code]);
      });

      it('should return campaigns with its owner', async function () {
        // given
        organizationId = databaseBuilder.factory.buildOrganization({}).id;
        const ownerId = databaseBuilder.factory.buildUser({ firstName: 'Daenerys', lastName: 'Targaryen' }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });
        databaseBuilder.factory.buildCampaign({ organizationId, ownerId });
        await databaseBuilder.commit();
        options.url = `/api/organizations/${organizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].attributes['owner-first-name']).to.equal('Daenerys');
        expect(response.result.data[0].attributes['owner-last-name']).to.equal('Targaryen');
      });

      it('should return archived campaigns', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?page[number]=1&page[size]=2&filter[status]=archived`;
        const expectedMetaData = { page: 1, pageSize: 2, rowCount: 2, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return report with the campaigns', async function () {
        // given
        databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId });
        await databaseBuilder.commit();
        options.url = `/api/organizations/${otherOrganizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(1);
        expect(response.result.data[0].attributes['participations-count']).to.equal(1);
        expect(response.result.data[0].attributes['shared-participations-count']).to.equal(1);
      });

      it('should return default pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated data', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?&page[number]=2&page[size]=1`;
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?filter[name]=Two&page[number]=1&page[size]=1`;
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 1, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?&page[number]=3&page[size]=1`;
        const expectedMetaData = { page: 3, pageSize: 1, rowCount: 2, pageCount: 2, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });
    });
  });

  describe('GET /api/admin/campaigns/{id}', function () {
    it('should return the campaign details', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/campaigns/${campaign.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(campaign.id.toString());
    });
  });
});
