import { createMaddoServer } from '../../../../server.maddo.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { generateValidRequestAuthorizationHeaderForApplication } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Maddo | Route | Campaigns', function () {
  let server;

  beforeEach(async function () {
    server = await createMaddoServer();
  });

  describe('GET /api/campaigns/{campaignId}/participations', function () {
    context('when campaign type is ASSESSMENT', function () {
      it('returns the list of all participations of campaign with tubes, stages, masteryRate and badges with an HTTP status code 200', async function () {
        // given
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        const clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const badge = databaseBuilder.factory.buildBadge({ targetProfileId });
        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({
          id: 'recSkillId1',
          tubeId: tube.id,
          status: 'actif',
          level: 1,
          competenceId: competenceId,
        }).id;
        const skillId2 = databaseBuilder.factory.learningContent.buildSkill({
          id: 'recSkillId2',
          tubeId: tube.id,
          status: 'actif',
          level: 2,
          competenceId: competenceId,
        }).id;

        databaseBuilder.factory.buildBadgeCriterion({
          badgeId: badge.id,
          threshold: 100,
          cappedTubes: JSON.stringify([{ tubeId: tube.id, level: 2 }]),
        });

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
          targetProfileId,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skillId2 });

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
        const ke2 = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: skillId2,
          userId: participation1.userId,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participation1.id,
          snapshot: new KnowledgeElementCollection([ke, ke2]).toSnapshot(),
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
            participantFirstName: organizationLearner1.firstName,
            participantLastName: organizationLearner1.lastName,
            clientId,
            tubes: [
              domainBuilder.maddo.buildTubeCoverage({
                id: tube.id,
                competenceId,
                maxLevel: 2,
                reachedLevel: 1,
                practicalDescription: tube.practicalDescription_i18n['fr'],
                practicalTitle: tube.practicalTitle_i18n['fr'],
              }),
            ],
            stages: {
              numberOfStages: 0,
              reachedStage: 0,
            },
            badges: [
              {
                altMessage: badge.altMessage,
                id: badge.id,
                imageUrl: badge.imageUrl,
                key: badge.key,
                title: badge.title,
                isAcquired: false,
                acquisitionPercentage: 50,
              },
            ],
          }),
          domainBuilder.maddo.buildCampaignParticipation({
            ...participation2,
            participantFirstName: organizationLearner2.firstName,
            participantLastName: organizationLearner2.lastName,
            clientId,
            stages: {
              numberOfStages: 0,
              reachedStage: 0,
            },
            tubes: [],
            badges: [
              {
                altMessage: badge.altMessage,
                id: badge.id,
                imageUrl: badge.imageUrl,
                key: badge.key,
                title: badge.title,
                isAcquired: false,
                acquisitionPercentage: 0,
              },
            ],
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
            participantFirstName: organizationLearner.firstName,
            participantLastName: organizationLearner.lastName,
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
            participantFirstName: organizationLearner1.firstName,
            participantLastName: organizationLearner1.lastName,
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
            stages: {
              numberOfStages: 0,
              reachedStage: 0,
            },
            badges: [],
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

    context('should handle filters', function () {
      let campaign, clientId, tube, competenceId, skillId;

      beforeEach(async function () {
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
        databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId: orgaInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });

        await databaseBuilder.commit();
      });

      it('should returns only participation created or updated after a given date', async function () {
        // given
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          participantExternalId: 'started before 1',
          createdAt: new Date('2025-01-01'),
        });
        const participationCreatedAfterDate = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          participantExternalId: 'started after 1',
          masteryRate: null,
          createdAt: new Date('2025-01-03'),
          organizationLearnerId: organizationLearner.id,
        });

        const participationSharedBefore = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          participantExternalId: 'shared before 1',
          createdAt: new Date('2025-01-01'),
          sharedAt: new Date('2025-01-01'),
        });
        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participationSharedBefore.userId,
        });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participationSharedBefore.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        const participationSharedAfterDate = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          participantExternalId: 'shared after 1',
          createdAt: new Date('2025-01-04'),
          sharedAt: new Date('2025-01-05'),
          organizationLearner: organizationLearner.id,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participationSharedAfterDate.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          participantExternalId: 'deleted external id 1',
          createdAt: new Date('2024-01-02'),
          sharedAt: new Date('2024-01-03'),
          deletedAt: new Date('2025-01-04'),
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations?since=2025-01-02T01:01:01Z`,
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
            ...participationSharedAfterDate,
            participantFirstName: organizationLearner.firstName,
            participantLastName: organizationLearner.lastName,
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
            stages: {
              numberOfStages: 0,
              reachedStage: 0,
            },
            badges: [],
          }),
          domainBuilder.maddo.buildCampaignParticipation({
            ...participationCreatedAfterDate,
            participantFirstName: organizationLearner.firstName,
            participantLastName: organizationLearner.lastName,
            clientId,
            stages: {
              numberOfStages: 0,
              reachedStage: 0,
            },
            tubes: undefined,
            badges: [],
          }),
        ]);
        expect(response.result.page).to.deep.equal({
          count: 1,
          number: 1,
          size: 10,
        });
      });
    });

    context('should handle sort', function () {
      let campaign, clientId, tube, competenceId, skillId;

      beforeEach(async function () {
        const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
        databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });

        clientId = 'client';
        databaseBuilder.factory.buildClientApplication({
          clientId: 'client',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          organizationId: orgaInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });

        await databaseBuilder.commit();
      });

      it('should returns participations sorted by given sort param', async function () {
        // given
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
        const participationCreatedLast = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          participantExternalId: 'started last',
          createdAt: new Date('2026-01-01'),
        });
        const participationCreatedFirst = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.STARTED,
          participantExternalId: 'started first',
          masteryRate: null,
          createdAt: new Date('2024-01-03'),
          organizationLearnerId: organizationLearner.id,
        });

        const participationCreatedSecond = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          masteryRate: 0.1,
          validatedSkillsCount: 10,
          participantExternalId: 'started 2nd',
          createdAt: new Date('2025-01-01'),
          sharedAt: new Date('2025-01-01'),
        });
        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participationCreatedFirst.userId,
        });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participationCreatedSecond.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations?sort[0][value]=createdAt&sort[0][type]=asc`,
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
        expect(response.result.campaignParticipations[0].createdAt).to.deep.equal(participationCreatedFirst.createdAt);
        expect(response.result.campaignParticipations[1].createdAt).to.deep.equal(participationCreatedSecond.createdAt);
        expect(response.result.campaignParticipations[2].createdAt).to.deep.equal(participationCreatedLast.createdAt);
      });
    });

    context('when authentication data are requested', function () {
      let campaign;
      let authorization;

      beforeEach(async function () {
        // Build oidc provider
        const oidcProvider = await databaseBuilder.factory.buildOidcProvider({
          identityProvider: 'IDENTITY_PROVIDER_EXAMPLE',
          claimsToStore: 'employeeNumber,population',
          accessTokenLifespan: '7d',
          clientId: 'client',
          clientSecret: 'plainTextSecret',
          openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
          organizationName: 'Identity Provider Example',
          redirectUri: 'https://orga.dev.pix.org/connexion/oidc-example-net',
          scope: 'openid profile campaigns',
          slug: 'oidc-example-net',
          source: 'oidcexamplenet',
        });

        // Build organization
        const organization = databaseBuilder.factory.buildOrganization({
          identityProviderForCampaigns: oidcProvider.identityProvider,
        });
        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });

        // Build client application for maddo
        databaseBuilder.factory.buildClientApplication({
          clientId: 'app-client-id',
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        // Build user and authentication method
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.withOidcProviderAsIdentityProvider({
          authenticationComplement: { population: 'MCF', employeeNumber: 'MCFCH' },
          externalIdentifier: 'externalIdentifier-1',
          identityProvider: 'IDENTITY_PROVIDER_EXAMPLE',
          userId,
        });

        // Build learner in organization
        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId,
        });

        // Build campaign and participation
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ status: 'actif' }).id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, targetProfileId });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: CampaignParticipationStatuses.SHARED,
          organizationLearnerId: organizationLearner1.id,
          userId,
        });

        await databaseBuilder.commit();

        authorization = generateValidRequestAuthorizationHeaderForApplication(
          'app-client-id',
          'pix-client',
          'campaigns meta',
        );
      });

      it('returns the campaign participations with authentication data', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/campaigns/${campaign.id}/participations?authenticationRequestedData=employeeNumber`,
          headers: { authorization },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaignParticipations[0].authenticationRequestedData).to.deep.equal({
          employeeNumber: 'MCFCH',
        });
      });

      context('when no authentication data are requested', function () {
        it('returns the campaign participations without authentication data', async function () {
          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/participations`,
            headers: { authorization },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.campaignParticipations[0].authenticationRequestedData).to.deep.equal({});
        });
      });

      context('when multiple authentication data are requested', function () {
        it('returns the campaign participations with multiple authentication data', async function () {
          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/participations?authenticationRequestedData=employeeNumber&authenticationRequestedData=population`,
            headers: { authorization },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.campaignParticipations[0].authenticationRequestedData).to.deep.equal({
            population: 'MCF',
            employeeNumber: 'MCFCH',
          });
        });
      });

      context('when invalid authentication data are requested', function () {
        it('returns a bad request error', async function () {
          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/campaigns/${campaign.id}/participations?authenticationRequestedData=foo`,
            headers: { authorization },
          });

          // then
          expect(response.statusCode).to.equal(400);
          expect(JSON.parse(response.payload)).to.deep.equal({
            errors: [
              {
                status: '400',
                code: 'INVALID_AUTHENTICATION_DATA',
                title: 'Bad Request',
                detail: 'Invalid authenticationRequestedData, must be some of: employeeNumber, population',
              },
            ],
          });
        });
      });
    });
  });
});
