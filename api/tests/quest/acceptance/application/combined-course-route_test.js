import iconv from 'iconv-lite';

import { createServer } from '../../../../server.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { PIX_ADMIN } from '../../../../src/shared/domain/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const ROLES = PIX_ADMIN.ROLES;

describe('Quest | Acceptance | Application | Combined course Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/combined-courses', function () {
    context('when user is SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });

      it('creates combined courses', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const questId = databaseBuilder.factory.buildQuest().id;
        const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId });

        await databaseBuilder.commit();

        const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*;Identifiant du schéma de parcours*
${organizationId};"{""name"":""Combinix"",""content"":[],""description"":""ma description"", ""illustration"":""mon_illu.svg""}";${userId};${combinedCourseBlueprint.id}`;

        const options = {
          method: 'POST',
          url: '/api/admin/combined-courses',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
    context('when user is not SuperAdmin', function () {
      it('should return 403 status code', async function () {
        // given
        const notAdminUserId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPPORT }).id;
        await databaseBuilder.commit();

        // when
        const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*
100;"{""name"":""Combinix"",""content"":[]}";${notAdminUserId}`;

        const options = {
          method: 'POST',
          url: '/api/admin/combined-courses',
          headers: generateAuthenticatedUserRequestHeaders({ userId: notAdminUserId }),
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);
        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/combined-courses', function () {
    context('when authentication is provided', function () {
      it('should return the combined course requested by code', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;

        const { userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
          code: 'SOMETHING',
          name: 'Mon parcours',
          organizationId,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/?filter[code]=${combinedCourse.code}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(Number(response.result.data.id)).to.equal(combinedCourse.id);
        expect(response.result.data.attributes.name).to.equal('Mon parcours');
      });
    });

    context('when authentication is not provided', function () {
      it('should return the combined course requested by code', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;

        const combinedCourse = databaseBuilder.factory.buildCombinedCourse({
          code: 'SOMETHING',
          name: 'Mon parcours',
          organizationId,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/?filter[code]=${combinedCourse.code}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(Number(response.result.data.id)).to.equal(combinedCourse.id);
        expect(response.result.data.attributes.name).to.equal('Mon parcours');
      });
    });
  });

  describe('PUT /api/combined-course/{code}/start', function () {
    it('should create a participation', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      databaseBuilder.factory.buildCombinedCourse({ name: 'MA QUETE', organizationId, code: 'COMBINIX2' });

      await databaseBuilder.commit();
      const options = {
        method: 'PUT',
        url: '/api/combined-courses/COMBINIX2/start',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 204 answer even if participation already exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        name: 'MA QUETE',
        organizationId,
        code: 'COMBINIX2',
      });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        combinedCourseId,
        organizationLearnerId: organizationLearner.id,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'PUT',
        url: '/api/combined-courses/COMBINIX2/start',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/combined-courses/{code}/reassess-status', function () {
    it('should update combined course', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId }).id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINIX1',
        organizationId,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        organizationLearnerId,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        combinedCourseId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/combined-courses/COMBINIX1/reassess-status',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}', function () {
    context('when user has membership in the combined course organization', function () {
      it('should return the combined course details', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          name: 'Mon parcours combiné',
          code: 'PARCOURS123',
          organizationId,
        });
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/${combinedCourseId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/statistics', function () {
    context('when user has membership in the combined course organization', function () {
      it('should return the combined course statistics', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          name: 'Mon parcours combiné',
          code: 'PARCOURS123',
          organizationId,
        });
        const learner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        databaseBuilder.factory.buildOrganizationLearnerParticipation({
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          status: OrganizationLearnerParticipationStatuses.STARTED,
          organizationLearnerId: learner.id,
          combinedCourseId,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/${combinedCourseId}/statistics`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('combined-course-statistics');
      });
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations', function () {
    context('when user has membership in the combined course organization', function () {
      it('should return the combined course participations with details', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          name: 'Mon parcours combiné',
          code: 'PARCOURS123',
          organizationId,
        });
        const learnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        databaseBuilder.factory.buildOrganizationLearnerParticipation({
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          status: OrganizationLearnerParticipationStatuses.STARTED,
          organizationLearnerId: learnerId,
          combinedCourseId,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/${combinedCourseId}/participations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].type).to.equal('combined-course-participations');
      });
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations/{participationId}', function () {
    context('when user has membership in the combined course organization', function () {
      it('should return the participation detail page', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
          name: 'Mon parcours combiné',
          code: 'PARCOURS123',
          organizationId,
        });
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          firstName: 'Paul',
          lastName: 'Azerty',
        });
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        const participationId = databaseBuilder.factory.buildOrganizationLearnerParticipation({
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
          status: OrganizationLearnerParticipationStatuses.STARTED,
          organizationLearnerId: learner.id,
          combinedCourseId,
        }).id;
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/${combinedCourseId}/participations/${participationId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('combined-course-participation-details');
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/combined-courses', function () {
    context('when user belongs to the organization', function () {
      it('should return the list of combined courses for the organization', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        databaseBuilder.factory.buildCombinedCourse({ organizationId, code: 'COMBI1' });
        databaseBuilder.factory.buildCombinedCourse({ organizationId, code: 'COMBI2' });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organizationId}/combined-courses`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
      });
    });
  });

  describe('POST /api/combined-courses', function () {
    context('when user is authenticated and belongs to organization', function () {
      let userId, organizationId;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();
      });

      it('creates combined course', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({
          content: [
            { type: 'evaluation', value: targetProfile.id },
            { type: 'module', value: '27d6ca4f' },
            { type: 'module', value: 'df82ec66' },
          ],
        });
        databaseBuilder.factory.buildCombinedCourseBlueprintShare({
          combinedCourseBlueprintId: combinedCourseBlueprint.id,
          organizationId: organizationId,
        });

        await databaseBuilder.commit();

        const payload = {
          data: {
            type: 'campaign',
            attributes: {
              name: 'Parcours combiné collège',
              type: 'COMBINED_COURSE',
              ['owner-id']: null,
            },
            relationships: {
              'combined-course-blueprint': {
                data: {
                  type: 'combined-course-blueprints',
                  id: `${combinedCourseBlueprint.id}`,
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: `${organizationId}`,
                },
              },
            },
          },
        };

        const options = {
          method: 'POST',
          url: '/api/combined-courses',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.name).to.equal(payload.data.attributes.name);
        expect(response.result.data.attributes.type).to.equal('COMBINED_COURSE');
      });
    });
  });
});
