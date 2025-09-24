import iconv from 'iconv-lite';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { CombinedCourseParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
} from '../../../test-helper.js';

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

        await databaseBuilder.commit();

        const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*
${organizationId};"{""name"":""Combinix"",""successRequirements"":[],""description"":""ma description"", ""illustration"":""mon_illu.svg""}";${userId}`;

        const options = {
          method: 'POST',
          url: '/api/admin/combined-courses',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);

        // then
        const createdQuest = await knex('quests').where('organizationId', organizationId).first();

        expect(response.statusCode).to.equal(204);

        expect(createdQuest.code).not.to.be.null;
        expect(createdQuest.name).to.equal('Combinix');
        expect(createdQuest.description).to.equal('ma description');
        expect(createdQuest.illustration).to.equal('mon_illu.svg');
        expect(createdQuest.successRequirements).to.deep.equal([]);
      });
    });
    context('when user is not SuperAdmin', function () {
      it('should return 403 status code', async function () {
        // given
        const notAdminUserId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPPORT }).id;
        await databaseBuilder.commit();

        // when
        const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*
100;"{""name"":""Combinix"",""successRequirements"":[]}";${notAdminUserId}`;

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
    it('should return the combined course requested by code', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;

      const { userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      const quest = databaseBuilder.factory.buildQuest({ code: 'SOMETHING', name: 'Mon parcours', organizationId });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/combined-courses/?filter[code]=${quest.code}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(Number(response.result.data.id)).to.equal(quest.id);
      expect(response.result.data.attributes.name).to.equal('Mon parcours');
    });

    it('should return 404 when combined course with this code does not exist', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;

      const { userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      const options = {
        method: 'GET',
        url: `/api/combined-courses/?filter[code]=NOTHINGTT`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('PUT /api/combined-course/{code}/start', function () {
    it('should create a participation', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      databaseBuilder.factory.buildQuest({ name: 'MA QUETE', organizationId, code: 'COMBINIX2' });

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
      const questId = databaseBuilder.factory.buildQuest({ name: 'MA QUETE', organizationId, code: 'COMBINIX2' }).id;
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        questId,
        organizationLearnerId: organizationLearner.id,
        status: CombinedCourseParticipationStatuses.COMPLETED,
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
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        code: 'COMBINIX1',
        organizationId,
        successRequirements: [],
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        organizationLearnerId,
        questId,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        status: CombinedCourseParticipationStatuses.STARTED,
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

  describe('GET /api/combined-courses/{questId}', function () {
    context('when user has membership in the combined course organization', function () {
      it('should return the combined course details', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
          name: 'Mon parcours combiné',
          code: 'PARCOURS123',
          organizationId,
          successRequirements: [],
        });
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/combined-courses/${questId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
