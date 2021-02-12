const { expect, databaseBuilder, knex } = require('../../../test-helper');
const finalizedSessionRepository = require('../../../../lib/infrastructure/repositories/finalized-session-repository');
const FinalizedSession = require('../../../../lib/domain/models/FinalizedSession');

describe('Integration | Repository | Finalized-session', () => {

  describe('#save', () => {

    afterEach(() => {
      return knex('finalized-sessions').delete();
    });

    it('saves a finalized session', async () => {
      // given
      const finalizedSession = new FinalizedSession({
        sessionId: 1234,
        finalizedAt: new Date('2021-02-01T11:48:00Z'),
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-01',
        sessionTime: '14:00:00',
        isPublishable: true,
      });

      // when
      await finalizedSessionRepository.save(finalizedSession);

      // then
      const result = await knex('finalized-sessions');
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.deep.equal({
        sessionId: 1234,
        finalizedAt: new Date('2021-02-01T11:48:00Z'),
        certificationCenterName: 'A certification center name',
        date: '2021-01-01',
        time: '14:00:00',
        isPublishable: true,
        publishedAt: null,
      });
    });
  });

  describe('#get', () => {

    afterEach(() => {
      return knex('finalized-sessions').delete();
    });

    it('retrieves a finalized session', async () => {
      // given
      const finalizedSession = databaseBuilder.factory.buildFinalizedSession({ sessionId: 1234 });
      await databaseBuilder.commit();

      // when
      const result = await finalizedSessionRepository.get({ sessionId: finalizedSession.sessionId });

      // then
      expect(result).to.deep.equal({
        sessionId: finalizedSession.sessionId,
        finalizedAt: finalizedSession.finalizedAt,
        certificationCenterName: finalizedSession.certificationCenterName,
        sessionDate: finalizedSession.date,
        sessionTime: finalizedSession.time,
        isPublishable: finalizedSession.isPublishable,
        publishedAt: null,
      });
    });
  });

  describe('#updatePublishedAt', () => {

    afterEach(() => {
      return knex('finalized-sessions').delete();
    });

    it('should update the publication date of a finalized session', async () => {
      // given
      const publishedAt = new Date('2021-01-01');
      const finalizedSession = databaseBuilder.factory.buildFinalizedSession({ sessionId: 1234 });
      await databaseBuilder.commit();

      // when
      await finalizedSessionRepository.updatePublishedAt({
        sessionId: finalizedSession.sessionId,
        publishedAt,
      });

      // then
      const { publishedAt: actualPublishedAt } = await knex.select('publishedAt').from('finalized-sessions').where({ sessionId: 1234 }).first();
      expect(actualPublishedAt).to.deep.equal(publishedAt);
    });

    it('should not throw when trying to setup publishedAt date on non-existent finalized session', async () => {
      // given
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 1234 });
      await databaseBuilder.commit();

      // when
      const promise = finalizedSessionRepository.updatePublishedAt({
        sessionId: 7894,
        publishedAt: new Date(),
      });

      // then
      return expect(promise).to.be.fulfilled;
    });
  });

  describe('#findFinalizedSessionsToPublish', () => {

    afterEach(() => {
      return knex('finalized-sessions').delete();
    });

    context('when there are publishable sessions', () => {

      it('finds a list of publishable finalized session', async () => {
        // given
        const publishableFinalizedSession1 = databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: null });
        const publishableFinalizedSession2 = databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: null });
        const publishableFinalizedSession3 = databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: null });

        databaseBuilder.factory.buildFinalizedSession({ isPublishable: false, publishedAt: null }),
        databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: '2021-01-01' }),

        await databaseBuilder.commit();

        // when
        const result = await finalizedSessionRepository.findFinalizedSessionsToPublish();

        // then
        expect(result).to.have.lengthOf(3);
        expect(result).to.deep.equal([
          {
            sessionId: publishableFinalizedSession1.sessionId,
            finalizedAt: publishableFinalizedSession1.finalizedAt,
            certificationCenterName: publishableFinalizedSession1.certificationCenterName,
            sessionDate: publishableFinalizedSession1.date,
            sessionTime: publishableFinalizedSession1.time,
            isPublishable: publishableFinalizedSession1.isPublishable,
            publishedAt: null,
          },
          {
            sessionId: publishableFinalizedSession2.sessionId,
            finalizedAt: publishableFinalizedSession2.finalizedAt,
            certificationCenterName: publishableFinalizedSession2.certificationCenterName,
            sessionDate: publishableFinalizedSession2.date,
            sessionTime: publishableFinalizedSession2.time,
            isPublishable: publishableFinalizedSession2.isPublishable,
            publishedAt: null,
          },
          {
            sessionId: publishableFinalizedSession3.sessionId,
            finalizedAt: publishableFinalizedSession3.finalizedAt,
            certificationCenterName: publishableFinalizedSession3.certificationCenterName,
            sessionDate: publishableFinalizedSession3.date,
            sessionTime: publishableFinalizedSession3.time,
            isPublishable: publishableFinalizedSession3.isPublishable,
            publishedAt: null,
          },
        ]);
      });
    });

    context('when there are no publishable sessions', () => {

      it('returns an empty array', async () => {
        // given / when
        const result = await finalizedSessionRepository.findFinalizedSessionsToPublish();

        // then
        expect(result).to.have.lengthOf(0);
      });
    });
  });
});
