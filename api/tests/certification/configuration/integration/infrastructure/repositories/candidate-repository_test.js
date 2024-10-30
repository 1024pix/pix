import { Candidate } from '../../../../../../src/certification/configuration/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/candidate-repository.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | candidate-repository', function () {
  describe('findCandidateWithoutReconciledAt', function () {
    it('should find candidate with a course and no reconciledAt', async function () {
      // given
      const courseDate = new Date();
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: courseDate });
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
        reconciledAt: null,
      }).id;
      await databaseBuilder.commit();
      // this is necessary to introduce the problem we want to find in the current database
      await knex('certification-candidates').update({ reconciledAt: null }).where({ userId });

      // when
      const results = await candidateRepository.findCandidateWithoutReconciledAt();

      // then
      expect(results).to.deep.equal([new Candidate({ id: candidateId, reconciledAt: courseDate })]);
    });

    it('should find candidate with no course and no reconciledAt', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession({ userId }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
        reconciledAt: null,
      });
      await databaseBuilder.commit();
      // this is necessary to introduce the problem we want to find in the current database
      await knex('certification-candidates').update({ reconciledAt: null }).where({ userId });

      // when
      const results = await candidateRepository.findCandidateWithoutReconciledAt();

      // then
      expect(results).to.be.empty;
    });

    it('should not find candidate with a course and already a reconciledAt', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession({ userId }).id;
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: new Date() });
      databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
        reconciledAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const results = await candidateRepository.findCandidateWithoutReconciledAt();

      // then
      expect(results).to.be.empty;
    });
  });

  describe('update', function () {
    it('should update reconciledAt when modified', async function () {
      // given
      const oldReconciledDate = new Date('2024-01-01');
      const newReconciledDate = new Date('2024-10-29');
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession({ userId }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
        reconciledAt: oldReconciledDate,
      }).id;
      await databaseBuilder.commit();

      // when
      const rowChanged = await candidateRepository.update({
        candidate: new Candidate({ id: candidateId, reconciledAt: newReconciledDate }),
      });

      // then
      expect(rowChanged).to.equal(1);
      const reconciledAt = await knex('certification-candidates').pluck('reconciledAt').where({ id: candidateId });
      expect(reconciledAt[0]).to.deep.equal(newReconciledDate);
    });
  });
});
