import { createServer } from '../../../../../server.js';
import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
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

      const coreStartDate = new Date('2025-01-15');

      databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: coreStartDate,
        status: VERSION_STATUSES.ACTIVE,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.deep.members([
        {
          type: 'certification-frameworks',
          id: Frameworks.CORE,
          attributes: {
            name: Frameworks.CORE,
            'active-version-start-date': coreStartDate,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.DROIT,
          attributes: {
            name: Frameworks.DROIT,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_1ER_DEGRE,
          attributes: {
            name: Frameworks.EDU_1ER_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_2ND_DEGRE,
          attributes: {
            name: Frameworks.EDU_2ND_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_CPE,
          attributes: {
            name: Frameworks.EDU_CPE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.PRO_SANTE,
          attributes: {
            name: Frameworks.PRO_SANTE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.CLEA,
          attributes: {
            name: Frameworks.CLEA,
            'active-version-start-date': null,
          },
        },
      ]);
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/framework-history', function () {
    it('should return the framework history for given scope ordered by start date descending', async function () {
      // given
      const newerVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: null,
        status: VERSION_STATUSES.ACTIVE,
      });

      const olderVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-11'),
        expirationDate: newerVersion.startDate,
        status: VERSION_STATUSES.ARCHIVED,
      });

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
              maximumAssessmentLength: JSON.parse(newerVersion.challengesConfiguration).maximumAssessmentLength,
              status: VERSION_STATUSES.ACTIVE,
            },
            {
              id: olderVersion.id,
              startDate: olderVersion.startDate,
              expirationDate: olderVersion.expirationDate,
              assessmentDuration: olderVersion.assessmentDuration,
              maximumAssessmentLength: JSON.parse(olderVersion.challengesConfiguration).maximumAssessmentLength,
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
