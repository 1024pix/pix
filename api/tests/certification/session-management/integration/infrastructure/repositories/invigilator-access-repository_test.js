import * as invigilatorAccessRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/invigilator-access-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Repository | invigilator-access-repository', function () {
  describe('#create', function () {
    it('should save an invigilator access', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await invigilatorAccessRepository.create({ sessionId, userId });

      // then
      const invigilatorAccessInDB = await knex.from('invigilator_accesses').first();
      expect(invigilatorAccessInDB.sessionId).to.equal(sessionId);
      expect(invigilatorAccessInDB.userId).to.equal(userId);
    });
  });

  describe('#isUserInvigilatorForSession', function () {
    it('should return true if user is invigilating the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildInvigilatorAccess({ sessionId, userId });
      await databaseBuilder.commit();

      // when
      const isUserInvigilatorForSession = await invigilatorAccessRepository.isUserInvigilatorForSession({
        sessionId,
        userId,
      });

      // then
      expect(isUserInvigilatorForSession).to.be.true;
    });

    it('should return false if user is not invigilating the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildInvigilatorAccess({ sessionId, userId });
      await databaseBuilder.commit();

      // when
      const isUserInvigilatorForSession = await invigilatorAccessRepository.isUserInvigilatorForSession({
        sessionId: 123,
        userId: 456,
      });

      // then
      expect(isUserInvigilatorForSession).to.be.false;
    });
  });

  describe('#isUserInvigilatorForSessionCandidate', function () {
    it("should return true if the user is invigilating the candidate's session", async function () {
      // given
      const invigilatorId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildInvigilatorAccess({ sessionId, userId: invigilatorId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      await databaseBuilder.commit();

      // when
      const isUserInvigilatorForSession = await invigilatorAccessRepository.isUserInvigilatorForSessionCandidate({
        certificationCandidateId,
        invigilatorId,
      });

      // then
      expect(isUserInvigilatorForSession).to.be.true;
    });

    it("should return false if the user is not invigilating the candidate's session", async function () {
      // given
      const invigilatorId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildInvigilatorAccess({ sessionId, userId: invigilatorId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
      await databaseBuilder.commit();

      // when
      const isUserInvigilatorForSession = await invigilatorAccessRepository.isUserInvigilatorForSessionCandidate({
        certificationCandidateId,
        invigilatorId,
      });

      // then
      expect(isUserInvigilatorForSession).to.be.false;
    });
  });
});
