const { expect, databaseBuilder } = require('../../../test-helper');
const finalizedSessionRepository = require('../../../../lib/infrastructure/repositories/finalized-session-repository');
const { knex } = require('../../../../db/knex-database-connection');
const FinalizedSession = require('../../../../lib/domain/models/FinalizedSession');

describe('Integration | Repository | Finalized-session', () => {
  describe('#save', () => {

    afterEach(() => {
      return knex('finalized-sessions').delete();
    });

    it('Saves a finalized session', async () => {
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

    it('Retrieves a finalized session', async () => {
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
      const result = await finalizedSessionRepository.updatePublishedAt({
        sessionId: finalizedSession.sessionId,
        publishedAt,
      });

      // then
      expect(result).to.deep.equal({
        sessionId: finalizedSession.sessionId,
        finalizedAt: finalizedSession.finalizedAt,
        certificationCenterName: finalizedSession.certificationCenterName,
        sessionDate: finalizedSession.date,
        sessionTime: finalizedSession.time,
        isPublishable: finalizedSession.isPublishable,
        publishedAt,
      });
    });
  });
});
