import { configurationRepositories } from '../../../../../../src/certification/configuration/infrastructure/repositories/index.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | sessions-repository', function () {
  describe('findStaleV2Sessions', function () {
    it('should return staled session ids', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      }).id;
      const sessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const results = await configurationRepositories.sessionsRepository.findStaleV2Sessions({
        centerId: certificationCenterId,
      });

      // then
      expect(results).to.deep.equal({
        sessionIds: [sessionId],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });

    it('should not return active session ids', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      }).id;
      const activeSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({ sessionId: activeSessionId });
      const inactiveSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const results = await configurationRepositories.sessionsRepository.findStaleV2Sessions({
        centerId: certificationCenterId,
      });

      // then
      expect(results).to.deep.equal({
        sessionIds: [inactiveSessionId],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });

    context('when no stale sessions', function () {
      it('should return an empty array', async function () {
        // given
        const centerId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: false }).id;
        await databaseBuilder.commit();

        // when
        const results = await configurationRepositories.sessionsRepository.findStaleV2Sessions({ centerId });

        // then
        expect(results).to.deep.equal({
          sessionIds: [],
          pagination: {
            page: 1,
            pageCount: 0,
            pageSize: 10,
            rowCount: 0,
          },
        });
      });
    });
  });

  describe('deleteUnstartedSession', function () {
    it('should delete session', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      }).id;
      const sessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      await configurationRepositories.sessionsRepository.deleteUnstartedSession({ sessionId });

      // then
      const result = await knex('sessions').where({ id: sessionId }).first();
      expect(result).to.be.undefined;
    });

    context('when session has started', function () {
      it('should not throw an error', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
        }).id;
        const sessionId = databaseBuilder.factory.buildSession({
          version: 2,
          certificationCenterId,
        }).id;
        databaseBuilder.factory.buildCertificationCourse({ sessionId });
        await databaseBuilder.commit();

        // when
        await configurationRepositories.sessionsRepository.deleteUnstartedSession({ sessionId });

        // then
        const result = await knex('sessions').where({ id: sessionId }).first();
        expect(result).not.to.be.undefined;
      });
    });
  });

  describe('updateV2SessionsWithNoCourses', function () {
    it('should update v2 sessions with no courses of v3 centers', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
      }).id;
      const activeSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({ sessionId: activeSessionId });
      const inactiveSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const count = await configurationRepositories.sessionsRepository.updateV2SessionsWithNoCourses();

      // then
      expect(count).to.equal(1);
      const sessions = await knex('sessions').select('id', 'version').orderBy('version');
      expect(sessions).to.deep.equal([
        { id: activeSessionId, version: 2 },
        { id: inactiveSessionId, version: 3 },
      ]);
    });

    it('should not update v2 sessions with no courses of v2 centers', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      }).id;
      const activeSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({ sessionId: activeSessionId });
      const inactiveSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const count = await configurationRepositories.sessionsRepository.updateV2SessionsWithNoCourses();

      // then
      expect(count).to.equal(0);
      const sessions = await knex('sessions').select('id', 'version').orderBy('version');
      expect(sessions).to.deep.equal([
        { id: activeSessionId, version: 2 },
        { id: inactiveSessionId, version: 2 },
      ]);
    });
  });

  describe('findV2SessionIdsWithNoCourses', function () {
    it('should return v2 session ids with no courses of v3 centers', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
      }).id;
      const activeSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({ sessionId: activeSessionId });
      const inactiveSessionId = databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId,
      }).id;
      const v2CertificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        isV2Pilot: true,
      }).id;
      databaseBuilder.factory.buildSession({
        version: 2,
        certificationCenterId: v2CertificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const sessionIds = await configurationRepositories.sessionsRepository.findV2SessionIdsWithNoCourses();

      expect(sessionIds).to.deep.equal([inactiveSessionId]);
    });
  });
});
