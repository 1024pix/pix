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
});
