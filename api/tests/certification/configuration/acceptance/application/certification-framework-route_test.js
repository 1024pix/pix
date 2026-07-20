import { createServer } from '../../../../../server.js';
import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | Certification | Configuration | certification-framework-route', function () {
  let server;
  let superAdmin;

  beforeEach(async function () {
    server = await createServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('GET /api/admin/certification-frameworks', function () {
    it('should return 200 HTTP status code with all frameworks', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certification-frameworks',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withActiveVersion({
          id: 100003,
          startDate: new Date('2021-01-01'),
          assessmentDuration: 1,
          maximumAssessmentLength: 1,
        })
        .withParameters({ scope: SCOPES.CORE })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withActiveVersion({
          id: 100004,
          startDate: new Date('2022-02-02'),
          assessmentDuration: 2,
          maximumAssessmentLength: 2,
        })
        .withArchivedVersion({
          id: 100005,
          startDate: new Date('2022-01-01'),
          expirationDate: new Date('2022-02-02'),
          assessmentDuration: 3,
          maximumAssessmentLength: 3,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_PRO_SANTE })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withDraftVersion({
          id: 100006,
          startDate: new Date('2024-02-02'),
          assessmentDuration: 4,
          maximumAssessmentLength: 4,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_DROIT })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_2ND_DEGRE })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withParameters({ scope: SCOPES.PIX_PLUS_EDU_CPE })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withParameters({ scope: Frameworks.CLEA })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'certification-frameworks',
            id: Frameworks.CLEA,
            attributes: {
              scope: Frameworks.CLEA,
            },
            relationships: {
              'version-summaries': {
                data: [],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/CLEA/target-profiles',
                },
              },
            },
          },
          {
            attributes: {
              scope: Frameworks.CORE,
            },
            id: Frameworks.CORE,
            relationships: {
              'version-summaries': {
                data: [
                  {
                    id: '100003',
                    type: 'certification-version-summaries',
                  },
                ],
              },
              'complementary-certification': {},
            },
            type: 'certification-frameworks',
          },
          {
            attributes: {
              scope: Frameworks.DROIT,
            },
            id: Frameworks.DROIT,
            relationships: {
              'version-summaries': {
                data: [
                  {
                    id: '100006',
                    type: 'certification-version-summaries',
                  },
                ],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/DROIT/target-profiles',
                },
              },
            },
            type: 'certification-frameworks',
          },
          {
            attributes: {
              scope: Frameworks.EDU_1ER_DEGRE,
            },
            id: Frameworks.EDU_1ER_DEGRE,
            relationships: {
              'version-summaries': {
                data: [],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/EDU_1ER_DEGRE/target-profiles',
                },
              },
            },
            type: 'certification-frameworks',
          },
          {
            attributes: {
              scope: Frameworks.EDU_2ND_DEGRE,
            },
            id: Frameworks.EDU_2ND_DEGRE,
            relationships: {
              'version-summaries': {
                data: [],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/EDU_2ND_DEGRE/target-profiles',
                },
              },
            },
            type: 'certification-frameworks',
          },
          {
            attributes: {
              scope: Frameworks.EDU_CPE,
            },
            id: Frameworks.EDU_CPE,
            relationships: {
              'version-summaries': {
                data: [],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/EDU_CPE/target-profiles',
                },
              },
            },
            type: 'certification-frameworks',
          },
          {
            attributes: {
              scope: Frameworks.PRO_SANTE,
            },
            id: Frameworks.PRO_SANTE,
            relationships: {
              'version-summaries': {
                data: [
                  {
                    id: '100004',
                    type: 'certification-version-summaries',
                  },
                  {
                    id: '100005',
                    type: 'certification-version-summaries',
                  },
                ],
              },
              'complementary-certification': {
                links: {
                  related: '/api/admin/complementary-certifications/PRO_SANTE/target-profiles',
                },
              },
            },
            type: 'certification-frameworks',
          },
        ],

        included: [
          {
            id: '100003',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 1,
              'expiration-date': null,
              'maximum-assessment-length': 1,
              'start-date': new Date('2021-01-01'),
              status: VERSION_STATUSES.ACTIVE,
            },
          },
          {
            id: '100006',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 4,
              'expiration-date': null,
              'maximum-assessment-length': 4,
              'start-date': new Date('2024-02-02'),
              status: VERSION_STATUSES.DRAFT,
            },
          },
          {
            id: '100004',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 2,
              'expiration-date': null,
              'maximum-assessment-length': 2,
              'start-date': new Date('2022-02-02'),
              status: VERSION_STATUSES.ACTIVE,
            },
          },
          {
            id: '100005',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 3,
              'expiration-date': new Date('2022-02-02'),
              'maximum-assessment-length': 3,
              'start-date': new Date('2022-01-01'),
              status: VERSION_STATUSES.ARCHIVED,
            },
          },
        ],
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{framework}', function () {
    it('should return 200 HTTP status code with framework info', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${Frameworks.PRO_SANTE}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withActiveVersion({
          id: 12,
          startDate: new Date('2022-02-02'),
          assessmentDuration: 2,
          maximumAssessmentLength: 2,
        })
        .withArchivedVersion({
          id: 13,
          startDate: new Date('2022-01-01'),
          expirationDate: new Date('2022-02-02'),
          assessmentDuration: 3,
          maximumAssessmentLength: 3,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_PRO_SANTE })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            scope: Frameworks.PRO_SANTE,
          },
          id: Frameworks.PRO_SANTE,
          relationships: {
            'version-summaries': {
              data: [
                {
                  id: '12',
                  type: 'certification-version-summaries',
                },
                {
                  id: '13',
                  type: 'certification-version-summaries',
                },
              ],
            },
            'complementary-certification': {
              links: {
                related: '/api/admin/complementary-certifications/PRO_SANTE/target-profiles',
              },
            },
          },
          type: 'certification-frameworks',
        },
        included: [
          {
            id: '12',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 2,
              'expiration-date': null,
              'maximum-assessment-length': 2,
              'start-date': new Date('2022-02-02'),
              status: VERSION_STATUSES.ACTIVE,
            },
          },
          {
            id: '13',
            type: 'certification-version-summaries',
            attributes: {
              'assessment-duration': 3,
              'expiration-date': new Date('2022-02-02'),
              'maximum-assessment-length': 3,
              'start-date': new Date('2022-01-01'),
              status: VERSION_STATUSES.ARCHIVED,
            },
          },
        ],
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/framework-history', function () {
    it('should return the framework history for given scope ordered by start date descending', async function () {
      // given
      const newerVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2025-01-11') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: [] })
        .insertToDB({ databaseBuilder });

      const olderVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2024-01-11'), expirationDate: newerVersion.startDate })
        .withParameters({ scope: SCOPES.CORE, tubeIds: [] })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${SCOPES.CORE}/framework-history`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: SCOPES.CORE,
        type: 'framework-histories',
        attributes: {
          scope: SCOPES.CORE,
          history: [
            {
              id: newerVersion.id,
              startDate: newerVersion.startDate,
              expirationDate: newerVersion.expirationDate,
              assessmentDuration: newerVersion.assessmentDuration,
              maximumAssessmentLength: newerVersion.challengesConfiguration.maximumAssessmentLength,
              status: VERSION_STATUSES.ACTIVE,
            },
            {
              id: olderVersion.id,
              startDate: olderVersion.startDate,
              expirationDate: olderVersion.expirationDate,
              assessmentDuration: olderVersion.assessmentDuration,
              maximumAssessmentLength: olderVersion.challengesConfiguration.maximumAssessmentLength,
              status: VERSION_STATUSES.ARCHIVED,
            },
          ],
        },
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/target-profiles', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const attachedAt = new Date('2019-01-01');
      const scope = SCOPES.PIX_PLUS_DROIT;

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'Pix+ Droit',
        hasExternalJury: true,
        key: scope,
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'Target' });

      const badge = databaseBuilder.factory.buildBadge({
        id: 198,
        key: 'badge',
        targetProfileId: targetProfile.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge.id,
        label: 'badge label',
        complementaryCertificationId: complementaryCertification.id,
        createdAt: attachedAt,
        minimumEarnedPix: 150,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${scope}/target-profiles`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'certification-frameworks',
          id: scope,
          attributes: {
            name: scope,
            'target-profiles-history': [
              {
                id: 999,
                name: 'Target',
                attachedAt,
                detachedAt: null,
              },
            ],
          },
        },
      });
    });
  });
});
