import { createServer } from '../../../../../server.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, datamartBuilder } from '../../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../../tooling/mocks/attestation-storage.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Prescription | Organization Learner | Acceptance | Application | OrganizationLearnerRoute', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organizations/{organizationId}/attestations/{attestationKey}', function () {
    it('should return 200 status code and right content type', async function () {
      // given
      const attestationFeatureId = databaseBuilder.factory.buildFeature(
        ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT,
      ).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId: attestationFeatureId });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });
      const attestation = databaseBuilder.factory.buildAttestation({
        templateName: 'sixth-grade-attestation-template',
      });
      mockAttestationStorage(attestation);
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6emeA',
      });
      const profileRewardId = databaseBuilder.factory.buildProfileReward({
        userId: organizationLearner.userId,
        rewardId: attestation.id,
        rewardType: REWARD_TYPES.ATTESTATION,
      }).id;
      databaseBuilder.factory.buildOrganizationsProfileRewards({ organizationId, profileRewardId });

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/attestations/${attestation.key}?divisions[]=6emeA`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('application/pdf');
    });
  });

  describe('GET /api/organizations/{organizationId}/attestations/{attestationKey}/statuses', function () {
    it('should return 200 status code and data', async function () {
      // given
      const attestationFeatureId = databaseBuilder.factory.buildFeature(
        ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT,
      ).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId: attestationFeatureId });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });
      const attestation = databaseBuilder.factory.buildAttestation({
        templateName: 'sixth-grade-attestation-template',
      });
      mockAttestationStorage(attestation);
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6emeA',
      });
      const profileRewardId = databaseBuilder.factory.buildProfileReward({
        userId: organizationLearner.userId,
        rewardId: attestation.id,
        rewardType: REWARD_TYPES.ATTESTATION,
        createdAt: new Date('2024-07-08'),
      }).id;
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/attestations/${attestation.key}/statuses?page[size]=1&filter[statuses][]=OBTAINED`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when

      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedResult = {
        data: [
          {
            type: 'attestation-participant-statuses',
            id: `SIXTH_GRADE_${organizationLearner.id}`,
            attributes: {
              'attestation-key': 'SIXTH_GRADE',
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              'obtained-at': new Date('2024-07-08'),
              'organization-learner-id': organizationLearner.id,
              division: organizationLearner.division,
            },
          },
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 1,
          rowCount: 1,
        },
      };
      expect(response.result).to.deep.equal(expectedResult);
    });
  });

  describe('GET /api/organizations/{organizationId}/participation-statistics', function () {
    describe('Success case', function () {
      it('should return the participation statistics and a 200 status code response', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.MEMBER,
        });

        // Create campaigns and participations for test data
        const campaign1 = databaseBuilder.factory.buildCampaign({ organizationId, ownerId: userId });

        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

        // Create campaign participations - some completed, some not
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign1.id,
          organizationLearnerId: organizationLearner1.id,
          isShared: true,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organizationId}/participation-statistics`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.have.property('data');
        expect(response.result.data).to.have.property('type', 'participation-statistics');
        expect(response.result.data).to.have.property('attributes');
        expect(response.result.data.attributes).to.have.property('total-participation-count');
        expect(response.result.data.attributes).to.have.property('completed-participation-count');
        expect(response.result.data.attributes).to.have.property('shared-participation-count-last-thirty-days');
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/organization-learners-level-by-tubes', function () {
    describe('Success case', function () {
      it('should return the organization learner and a 200 status code response', async function () {
        //given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.ADMIN,
        });
        const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COVER_RATE).id;
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId,
          featureId,
        });
        await databaseBuilder.commit();

        const campaignInfo = {
          campaign_id: 456,
          target_profile_id: 123,
          orga_id: organizationId,
        };

        datamartBuilder.factory.buildOrganizationsCoverRates({
          ...campaignInfo,
          tag_name: 'TAG',
          domain_name: '1 domain',
          competence_code: '1.1',
          competence_name: 'competence 1',
          tube_id: 'tube1',
          tube_practical_title: 'tubeTitle 1',
          extraction_date: '2025-01-01',
          max_level: 5,
          sum_user_max_level: 2,
          passage_count: 2,
          nb_tubes_in_competence: 1,
        });
        datamartBuilder.factory.buildOrganizationsCoverRates({
          ...campaignInfo,
          tag_name: 'TAG',
          domain_name: '2 domain',
          competence_code: '2.2',
          competence_name: 'competence 2',
          tube_id: 'tube2',
          tube_practical_title: 'tubeTitle 2',
          extraction_date: '2025-01-01',
          max_level: 7,
          sum_user_max_level: 6,
          passage_count: 2,
          nb_tubes_in_competence: 1,
        });
        await datamartBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organizationId}/organization-learners-level-by-tubes`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedResult = {
          data: {
            attributes: {
              data: [
                {
                  competence: 'competence 2',
                  competence_code: '2.2',
                  couverture: '0.42857142857142857143',
                  domaine: '2 domain',
                  extraction_date: '2025-01-01',
                  niveau_par_sujet: '7.0',
                  niveau_par_user: '3.0',
                  sujet: 'tubeTitle 2',
                },
                {
                  competence: 'competence 1',
                  competence_code: '1.1',
                  couverture: '0.20000000000000000000',
                  domaine: '1 domain',
                  extraction_date: '2025-01-01',
                  niveau_par_sujet: '5.0',
                  niveau_par_user: '1.0',
                  sujet: 'tubeTitle 1',
                },
              ],
            },
            type: 'analysis-by-tubes',
          },
        };
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.includes(expectedResult.data);
      });
    });
  });
});
