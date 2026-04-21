import { Campaign } from '../../../../src/maddo/domain/models/Campaign.js';
import { Organization } from '../../../../src/maddo/domain/models/Organization.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { serverMaddo } from '../../../tooling/servers.js';
import { generateValidRequestAuthorizationHeaderForApplication } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Maddo | Route | Organizations', function () {
  describe('GET /api/organizations', function () {
    it('returns the list of all organizations of the client jurisdiction with an HTTP status code 200', async function () {
      // given
      const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({
        name: 'orga-in-jurisdiction',
        externalId: 'external-id1',
      });
      const orgaAlsoInJurisdiction = databaseBuilder.factory.buildOrganization({
        name: 'orga-also-in-jurisdiction',
        externalId: 'external-id2',
      });
      databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

      const tag = databaseBuilder.factory.buildTag();
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaAlsoInJurisdiction.id, tagId: tag.id });

      const clientId = 'client';
      databaseBuilder.factory.buildClientApplication({
        clientId: 'client',
        jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/organizations',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'meta'),
        },
      };

      // when
      const response = await serverMaddo.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([
        new Organization({ id: orgaInJurisdiction.id, name: orgaInJurisdiction.name, externalId: 'external-id1' }),
        new Organization({
          id: orgaAlsoInJurisdiction.id,
          name: orgaAlsoInJurisdiction.name,
          externalId: 'external-id2',
        }),
      ]);
    });
  });

  describe('GET /api/organizations/{organizationId}/campaigns', function () {
    let orgaInJurisdiction, orgaAlsoInJurisdiction, orgaNotInJurisdiction;
    let clientId;

    beforeEach(async function () {
      orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
      orgaAlsoInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-also-in-jurisdiction' });
      orgaNotInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

      const tag = databaseBuilder.factory.buildTag();
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaAlsoInJurisdiction.id, tagId: tag.id });

      clientId = 'client';
      databaseBuilder.factory.buildClientApplication({
        clientId: 'client',
        jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
      });
      await databaseBuilder.commit();
    });

    it('returns the list of all campaigns belonging to organization in the client jurisdiction with an HTTP status code 200', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign1InJurisdiction = databaseBuilder.factory.buildCampaign({
        organizationId: orgaInJurisdiction.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: orgaAlsoInJurisdiction.id,
      });
      databaseBuilder.factory.buildCampaign({ organizationId: orgaNotInJurisdiction.id });

      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
      const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
      const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
      const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
      const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1InJurisdiction.id, skillId });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: orgaNotInJurisdiction.id, userId });

      const participationUser = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1InJurisdiction.id,
        userId,
      });

      const ke = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId,
        userId: participationUser.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser.id,
        snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${orgaInJurisdiction.id}/campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
        },
      };

      // when
      const response = await serverMaddo.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.page).to.deep.equal({
        number: 1,
        size: 1000,
        count: 1,
      });
      expect(response.result.campaigns).to.deep.equal([
        new Campaign({
          id: campaign1InJurisdiction.id,
          name: campaign1InJurisdiction.name,
          type: campaign1InJurisdiction.type,
          targetProfileName: targetProfile.name,
          code: campaign1InJurisdiction.code,
          createdAt: campaign1InJurisdiction.createdAt,
          archivedAt: campaign1InJurisdiction.archivedAt,
          tubes: [
            {
              id: tube.id,
              competenceId,
              maxLevel: 2,
              meanLevel: 2,
              practicalDescription: tube.practicalDescription_i18n['fr'],
              practicalTitle: tube.practicalTitle_i18n['fr'],
            },
          ],
        }),
      ]);
    });

    context('when organization contains profile collection campaigns', function () {
      it('returns the list of all campaigns belonging to organization in the client jurisdiction with an HTTP status code 200', async function () {
        // given
        const campaign1InJurisdiction = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId: orgaInJurisdiction.id,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${orgaInJurisdiction.id}/campaigns`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
          },
        };

        // when
        const response = await serverMaddo.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaigns).to.deep.equal([
          new Campaign({
            id: campaign1InJurisdiction.id,
            name: campaign1InJurisdiction.name,
            type: campaign1InJurisdiction.type,
            targetProfileName: null,
            code: campaign1InJurisdiction.code,
            createdAt: campaign1InJurisdiction.createdAt,
            archivedAt: campaign1InJurisdiction.archivedAt,
            tubes: null,
          }),
        ]);
      });
    });

    context('pagination management', function () {
      it('returns the list of n first campaigns belonging to organization in the client jurisdiction with an HTTP status code 200', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaign1InJurisdiction = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
        });
        const campaign2InJurisdiction = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1InJurisdiction.id, skillId });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2InJurisdiction.id, skillId });
        const userId = databaseBuilder.factory.buildUser().id;

        const participationUser = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign1InJurisdiction.id,
          userId,
        });

        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participationUser.userId,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participationUser.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${orgaInJurisdiction.id}/campaigns?page[number]=1&page[size]=1`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
          },
        };

        // when
        const response = await serverMaddo.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaigns).to.deep.equal([
          new Campaign({
            id: campaign1InJurisdiction.id,
            name: campaign1InJurisdiction.name,
            type: campaign1InJurisdiction.type,
            targetProfileName: targetProfile.name,
            code: campaign1InJurisdiction.code,
            createdAt: campaign1InJurisdiction.createdAt,
            archivedAt: campaign1InJurisdiction.archivedAt,
            tubes: [
              {
                id: tube.id,
                competenceId,
                maxLevel: 2,
                meanLevel: 2,
                practicalDescription: tube.practicalDescription_i18n['fr'],
                practicalTitle: tube.practicalTitle_i18n['fr'],
              },
            ],
          }),
        ]);
      });
    });

    context('language negociation', function () {
      it('should return translated tube title and description', async function () {
        // given
        const locale = 'en';
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaignInJurisdiction = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaignInJurisdiction.id, skillId });
        const userId = databaseBuilder.factory.buildUser().id;

        const participationUser = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignInJurisdiction.id,
          userId,
        });

        const ke = databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId,
          userId: participationUser.userId,
        });

        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: participationUser.id,
          snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${orgaInJurisdiction.id}/campaigns?page[number]=1&page[size]=1`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
            cookie: `locale=${locale}`,
          },
        };

        // when
        const response = await serverMaddo.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaigns).to.deep.equal([
          new Campaign({
            id: campaignInJurisdiction.id,
            name: campaignInJurisdiction.name,
            type: campaignInJurisdiction.type,
            targetProfileName: targetProfile.name,
            code: campaignInJurisdiction.code,
            createdAt: campaignInJurisdiction.createdAt,
            archivedAt: campaignInJurisdiction.archivedAt,
            tubes: [
              {
                id: tube.id,
                competenceId,
                maxLevel: 2,
                meanLevel: 2,
                practicalDescription: tube.practicalDescription_i18n.en,
                practicalTitle: tube.practicalTitle_i18n.en,
              },
            ],
          }),
        ]);
      });
    });

    it('responds with an HTTP Forbidden when organization is not in jurisdiction', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/organizations/${orgaNotInJurisdiction.id}/campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'meta'),
        },
      };

      // when
      const response = await serverMaddo.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
