import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../src/shared/domain/models/index.js';
import {
  createMaddoServer,
  databaseBuilder,
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeaderForApplication,
} from '../../../test-helper.js';

describe('Acceptance | Maddo | Route | Campaigns', function () {
  let server;

  beforeEach(async function () {
    server = await createMaddoServer();
  });

  describe('GET /api/campaigns/{campaignId}/participations', function () {
    context('when campaign type is ASSESSMENT', function () {
      it('returns the list of all participations of campaign with tubes and masteryRate with an HTTP status code 200', async function () {
        // given
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
        databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        const clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        const { id: userId } = databaseBuilder.factory.buildUser({
          firstName: 'user firstname 1',
          lastName: 'user lastname 1',
        });
        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: orgaInJurisdiction.id,
          userId,
          firstName: 'firstname 1',
          lastName: 'lastname 1',
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId: orgaInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        const participation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          organizationLearnerId: organizationLearner1.id,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          userId,
          participantExternalId: 'external id 1',
          createdAt: new Date('2025-01-02'),
          sharedAt: new Date('2025-01-03'),
        });
        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participation1.userId,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participation1.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationLearner1.organizationId,
        });
        const participation2 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          organizationLearnerId: organizationLearner2.id,
          userId: organizationLearner2.userId,
          masteryRate: null,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              clientId,
              'pix-client',
              'campaigns meta',
            ),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaignParticipations).to.deep.members([
          domainBuilder.maddo.buildCampaignParticipation({
            ...participation1,
            clientId,
            tubes: [
              domainBuilder.maddo.buildTubeCoverage({
                id: tube.id,
                competenceId,
                maxLevel: 2,
                reachedLevel: 2,
                practicalDescription: tube.practicalDescription_i18n['fr'],
                practicalTitle: tube.practicalTitle_i18n['fr'],
              }),
            ],
          }),
          domainBuilder.maddo.buildCampaignParticipation({
            ...participation2,
            clientId,
          }),
        ]);
        expect(response.result.page).to.deep.equal({
          count: 1,
          number: 1,
          size: 10,
        });
      });
    });

    context('when campaign type is PROFILES_COLLECTION', function () {
      it('returns the list of all participations of campaign with an HTTP status code 200', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });

        const clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId: organization.id,
        });
        const participation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          organizationLearnerId: organizationLearner.id,
          userId: organizationLearner.userId,
          pixScore: 42,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              clientId,
              'pix-client',
              'campaigns meta',
            ),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaignParticipations).to.deep.members([
          domainBuilder.maddo.buildCampaignParticipation({
            ...participation,
            clientId,
          }),
        ]);
        expect(response.result.page).to.deep.equal({
          count: 1,
          number: 1,
          size: 10,
        });
      });
    });

    context('should handle pagination ', function () {
      it('returns the list of all participations for given page', async function () {
        // given
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
        databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        const clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        const { id: userId } = databaseBuilder.factory.buildUser({
          firstName: 'user firstname 1',
          lastName: 'user lastname 1',
        });
        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: orgaInJurisdiction.id,
          userId,
          firstName: 'firstname 1',
          lastName: 'lastname 1',
        });
        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId: orgaInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        const participation1 = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          organizationLearnerId: organizationLearner1.id,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          userId,
          participantExternalId: 'external id 1',
          createdAt: new Date('2025-01-02'),
          sharedAt: new Date('2025-01-03'),
        });
        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participation1.userId,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participation1.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationLearner1.organizationId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          organizationLearnerId: organizationLearner2.id,
          userId: organizationLearner2.userId,
          masteryRate: null,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations?page[size]=1&page[number]=2`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              clientId,
              'pix-client',
              'campaigns meta',
            ),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaignParticipations).to.deep.members([
          domainBuilder.maddo.buildCampaignParticipation({
            ...participation1,
            clientId,
            tubes: [
              domainBuilder.maddo.buildTubeCoverage({
                id: tube.id,
                competenceId,
                maxLevel: 2,
                reachedLevel: 2,
                practicalDescription: tube.practicalDescription_i18n['fr'],
                practicalTitle: tube.practicalTitle_i18n['fr'],
              }),
            ],
          }),
        ]);
        expect(response.result.page).to.deep.equal({
          count: 2,
          number: 2,
          size: 1,
        });
      });

      it('should return 400, when size exceed 200', async function () {
        // given
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId: orgaInJurisdiction.id,
        });

        const clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        await databaseBuilder.commit();

        // when
        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations?page[size]=401&page[number]=2`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              clientId,
              'pix-client',
              'campaigns meta',
            ),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors).to.deep.equal([
          {
            status: '400',
            title: 'Bad Request',
            detail: '"page.size" must be less than or equal to 200',
          },
        ]);
      });
    });
  });
});
