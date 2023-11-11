import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import * as supervisorAccessRepository from '../../../../lib/infrastructure/repositories/supervisor-access-repository.js';

describe('Integration | Repository | supervisor-access-repository', function () {
  describe('#create', function () {
    it('should save a supervisor access', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await supervisorAccessRepository.create({ sessionId, userId });

      // then
      const supervisorAccessInDB = await knex.from('supervisor-accesses').first();
      expect(supervisorAccessInDB.sessionId).to.equal(sessionId);
      expect(supervisorAccessInDB.userId).to.equal(userId);
    });
  });

  describe('#isUserSupervisorForSession', function () {
    it('should return true if user is supervising the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId, userId });
      await databaseBuilder.commit();

      // when
      const isUserSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSession({
        sessionId,
        userId,
      });

      // then
      expect(isUserSupervisorForSession).to.be.true;
    });

    it('should return false if user is not supervising the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId, userId });
      await databaseBuilder.commit();

      // when
      const isUserSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSession({
        sessionId: 123,
        userId: 456,
      });

      // then
      expect(isUserSupervisorForSession).to.be.false;
    });
  });

  describe('#isUserSupervisorForSessionCandidate', function () {
    it("should return true if the user is supervising the candidate's session", async function () {
      // given
      const supervisorId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId, userId: supervisorId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      await databaseBuilder.commit();

      // when
      const isUserSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSessionCandidate({
        certificationCandidateId,
        supervisorId,
      });

      // then
      expect(isUserSupervisorForSession).to.be.true;
    });

    it("should return false if the user is not supervising the candidate's session", async function () {
      // given
      const supervisorId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId, userId: supervisorId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
      await databaseBuilder.commit();

      // when
      const isUserSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSessionCandidate({
        certificationCandidateId,
        supervisorId,
      });

      // then
      expect(isUserSupervisorForSession).to.be.false;
    });
  });

  describe('#sessionHasSupervisorAccess', function () {
    it('should return true if session has at least one supervisor access', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId, userId });
      await databaseBuilder.commit();

      // when
      const sessionHasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({
        sessionId,
      });

      // then
      expect(sessionHasSupervisorAccess).to.be.true;
    });

    it('should return false if session has no supervisor access', async function () {
      // given
      const sessionWithSupervisor = databaseBuilder.factory.buildSession();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildSupervisorAccess({ sessionId: sessionWithSupervisor.id, userId });
      const sessionWithoutSupervisor = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const sessionHasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({
        sessionId: sessionWithoutSupervisor.id,
      });

      // then
      expect(sessionHasSupervisorAccess).to.be.false;
    });
  });
});
