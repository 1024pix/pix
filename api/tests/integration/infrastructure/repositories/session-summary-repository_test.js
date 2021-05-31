const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const sessionSummaryRepository = require('../../../../lib/infrastructure/repositories/session-summary-repository');
const SessionSummary = require('../../../../lib/domain/read-models/SessionSummary');
const _ = require('lodash');

describe('Integration | Repository | Session Summary', () => {

  describe('#findPaginatedByCertificationCenterId', () => {
    let page;
    let certificationCenterId;

    beforeEach(async () => {
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      await databaseBuilder.commit();
      page = { number: 1, size: 4 };
    });

    context('when the given certification center has no session', () => {

      it('should return an empty array', async () => {
        // given
        const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildSession({ certificationCenterId: otherCertificationCenterId });
        await databaseBuilder.commit();

        // when
        const { models: sessionSummaries, meta } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

        // then
        expect(sessionSummaries).to.deep.equal([]);
        expect(meta.hasSessions).to.be.false;
      });
    });

    context('when the given certification center has sessions', () => {

      it('should return a session summary with all attributes', async () => {
        // given
        databaseBuilder.factory.buildSession({
          id: 456,
          address: 'ici',
          room: 'labas',
          date: '2020-01-02',
          time: '17:00:00',
          examiner: 'Moi',
          finalizedAt: new Date('2021-01-02'),
          publishedAt: null,
          certificationCenterId,
        });
        await databaseBuilder.commit();

        // when
        const { models: sessionSummaries } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

        // then
        const expectedSessionSummary = domainBuilder.buildSessionSummary.finalized({
          id: 456,
          address: 'ici',
          room: 'labas',
          date: '2020-01-02',
          time: '17:00:00',
          examiner: 'Moi',
          enrolledCandidatesCount: 0,
          effectiveCandidatesCount: 0,
        });
        expect(sessionSummaries[0]).to.be.instanceof(SessionSummary);
        expect(sessionSummaries[0]).to.deep.equal(expectedSessionSummary);
      });

      it('should return hasSessions to true if the certification center has at least one session', async () => {
        // given
        databaseBuilder.factory.buildSession({ certificationCenterId });
        await databaseBuilder.commit();

        // when
        const { meta } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

        // then
        expect(meta.hasSessions).to.be.true;
      });

      it('should sort sessions by descending date and time, and finally by ID ascending', async () => {
        // given
        databaseBuilder.factory.buildSession({ id: 1, certificationCenterId, date: '2020-01-01', time: '18:00:00' }).id;
        databaseBuilder.factory.buildSession({ id: 2, certificationCenterId, date: '2020-01-01', time: '15:00:00' }).id;
        databaseBuilder.factory.buildSession({ id: 3, certificationCenterId, date: '2021-01-01' }).id;
        databaseBuilder.factory.buildSession({ id: 4, certificationCenterId, date: '2020-01-01', time: '15:00:00' }).id;
        await databaseBuilder.commit();

        // when
        const { models: sessionSummaries } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

        // then
        expect(sessionSummaries).to.have.lengthOf(4);
        expect(_.map(sessionSummaries, 'id')).to.deep.equal([3, 1, 2, 4]);
      });

      context('when sessions have candidates', async () => {

        it('should return correct enrolled candidates count and effective candidates count', async () => {
          // given
          const sessionA = databaseBuilder.factory.buildSession({ certificationCenterId, createdAt: new Date('2019-01-01'), finalizedAt: new Date('2020-01-01') });
          const sessionB = databaseBuilder.factory.buildSession({ certificationCenterId, createdAt: new Date('2018-01-01'), publishedAt: new Date('2020-02-01') });
          _buildEnrolledOnlyCandidate(sessionA.id);
          _buildEnrolledOnlyCandidate(sessionB.id);
          _buildEnrolledOnlyCandidate(sessionB.id);
          _buildEnrolledAndEffectiveCandidate(sessionB.id);
          await databaseBuilder.commit();

          // when
          const { models: sessionSummaries } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

          // then
          const expectedSessionA = domainBuilder.buildSessionSummary.finalized({
            ...sessionA,
            enrolledCandidatesCount: 1,
            effectiveCandidatesCount: 0,
          });
          const expectedSessionB = domainBuilder.buildSessionSummary.processed({
            ...sessionB,
            enrolledCandidatesCount: 3,
            effectiveCandidatesCount: 1,
          });
          expect(sessionSummaries[0]).to.deep.equal(expectedSessionA);
          expect(sessionSummaries[1]).to.deep.equal(expectedSessionB);
        });
      });

      context('when session does not have candidates at all', async () => {

        it('should return 0 as enrolled and effective candidates count', async () => {
          // given
          databaseBuilder.factory.buildSession({ certificationCenterId });
          await databaseBuilder.commit();

          // when
          const { models: sessionSummaries } = await sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });

          // then
          expect(sessionSummaries[0]).to.include({ enrolledCandidatesCount: 0, effectiveCandidatesCount: 0 });
        });
      });
    });
  });
});

function _buildEnrolledOnlyCandidate(sessionId) {
  databaseBuilder.factory.buildCertificationCandidate({ sessionId });
}

function _buildEnrolledAndEffectiveCandidate(sessionId) {
  const userId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId });
  databaseBuilder.factory.buildCertificationCourse({ userId, sessionId });
}
