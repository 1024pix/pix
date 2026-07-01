import { createServer } from '../../../../server.js';
import {
  checkAuthorizationToAccessCombinedCourse,
  checkCombinedCourseBlueprintBelongsToOrganization,
  checkCombinedCoursesFeatureIsEnabled,
  checkParticipationBelongsToCombinedCourse,
} from '../../../../src/quest/application/security-pre-handlers.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Acceptance | Application | SecurityPreHandlers', function () {
  const jsonApiError403 = {
    errors: [
      {
        code: 403,
        title: 'Forbidden access',
        detail: 'Missing or insufficient permissions.',
      },
    ],
  };

  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#checkAuthorizationToAccessCombinedCourse', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      const code = 'COMBINIX1';
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });

      server.route({
        method: 'GET',
        path: '/api/test-combined-course',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [{ method: checkAuthorizationToAccessCombinedCourse }],
        },
      });

      options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/test-combined-course?filter[code]=${code}`,
      };

      await databaseBuilder.commit();
    });

    it('returns true if connected user is allowed to access given combined course', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns an error if connected user is not allowed to access given combined course', async function () {
      // given
      const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: importFeature.id,
      });

      await databaseBuilder.commit();
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkParticipationBelongsToCombinedCourse', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/api/fake-cc/{combinedCourseId}/fake-p/{participationId}',
        handler: (_, h) => h.response({}).code(200),
        config: {
          auth: false,
          pre: [{ method: checkParticipationBelongsToCombinedCourse }],
        },
      });
    });

    it('returns true if participation belongs to combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/fake-cc/${combinedCourseId}/fake-p/${participationId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns an error if participation does not belong to combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/fake-cc/${combinedCourseId}/fake-p/${participationId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkCombinedCoursesFeatureIsEnabled', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/api/test-route',
        handler: (_, h) => h.response({}).code(200),
        config: {
          pre: [{ method: checkCombinedCoursesFeatureIsEnabled }],
        },
      });
    });

    it('returns 200 when combined courses feature is enabled', async function () {
      featureToggles.set('areCombinedCoursesEnabled', true);

      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test-route`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });

    it('returns error when combined courses feature is disabled', async function () {
      featureToggles.set('areCombinedCoursesEnabled', false);

      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test-route`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(422);
      expect(response.payload).to.equal('Combined courses feature is disabled');
    });
  });

  describe('#checkCombinedCourseBlueprintBelongsToOrganization', function () {
    let combinedCourseBlueprintId, organizationId;

    beforeEach(async function () {
      const combinedCourseBlueprintShare = databaseBuilder.factory.buildCombinedCourseBlueprintShare();

      combinedCourseBlueprintId = combinedCourseBlueprintShare.combinedCourseBlueprintId;
      organizationId = combinedCourseBlueprintShare.organizationId;

      server.route({
        method: 'GET',
        path: '/api/organization/{organizationId}/combined-course-blueprint/{blueprintId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          auth: false,
          pre: [{ method: checkCombinedCourseBlueprintBelongsToOrganization }],
        },
      });

      await databaseBuilder.commit();
    });

    it('returns 200 OK if combined course blueprint belongs to organization', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/organization/${organizationId}/combined-course-blueprint/${combinedCourseBlueprintId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns an error if combined course blueprint does not belong to organization', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const { combinedCourseBlueprintId: otherCombinedCourseBlueprintId } =
        databaseBuilder.factory.buildCombinedCourseBlueprintShare({
          organizationId: otherOrganizationId,
        });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organization/${organizationId}/combined-course-blueprint/${otherCombinedCourseBlueprintId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });
});
