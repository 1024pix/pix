import { expect, databaseBuilder, knex, catchErr } from '../../../../test-helper';
import finalizedSessionRepository from '../../../../../lib/infrastructure/repositories/sessions/finalized-session-repository';
import FinalizedSession from '../../../../../lib/domain/models/FinalizedSession';
import { NotFoundError } from '../../../../../lib/domain/errors';

describe('Integration | Repository | Finalized-session', function () {
  describe('#save', function () {
    afterEach(async function () {
      await knex('finalized-sessions').delete();
    });

    context('When the session does not exist', function () {
      it('saves a finalized session', async function () {
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
        const savedSession = await finalizedSessionRepository.get({ sessionId: 1234 });
        expect(savedSession).to.be.an.instanceof(FinalizedSession);
        expect(savedSession).to.deep.equal({
          sessionId: 1234,
          finalizedAt: new Date('2021-02-01T11:48:00Z'),
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-01',
          sessionTime: '14:00:00',
          isPublishable: true,
          publishedAt: null,
          assignedCertificationOfficerName: null,
        });
      });
    });

    context('When the session does exist', function () {
      it('is idempotent', function (done) {
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
        expect(async () => {
          await finalizedSessionRepository.save(finalizedSession);
          await finalizedSessionRepository.save(finalizedSession);
          done();
        }).not.to.throw();
      });

      it('updates a finalized session', async function () {
        // given
        databaseBuilder.factory.buildFinalizedSession({
          sessionId: 1235,
          isPublishable: true,
          finalizedAt: new Date('2021-02-01T11:48:00Z'),
          certificationCenterName: 'A certification center name',
          date: '2021-01-01',
          time: '14:00:00',
        });

        await databaseBuilder.commit();
        const sessionToBeUpdated = await finalizedSessionRepository.get({ sessionId: 1235 });
        sessionToBeUpdated.assignCertificationOfficer({ certificationOfficerName: 'David Gilmour' });

        // when
        await finalizedSessionRepository.save(sessionToBeUpdated);

        // then
        const result = await finalizedSessionRepository.get({ sessionId: 1235 });
        expect(result).to.deep.equal({
          sessionId: 1235,
          finalizedAt: new Date('2021-02-01T11:48:00Z'),
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-01',
          sessionTime: '14:00:00',
          isPublishable: false,
          publishedAt: null,
          assignedCertificationOfficerName: 'David Gilmour',
        });
      });
    });
  });

  describe('#get', function () {
    afterEach(function () {
      return knex('finalized-sessions').delete();
    });

    context('When the session does exist', function () {
      it('retrieves a finalized session', async function () {
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
          assignedCertificationOfficerName: null,
        });
      });
    });

    context('When the session does not exist', function () {
      it('throws a not found error', async function () {
        // when
        const error = await catchErr(finalizedSessionRepository.get)({ sessionId: 404 });
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findFinalizedSessionsToPublish', function () {
    context('when there are publishable sessions', function () {
      it('finds a list of publishable finalized session order by finalization date', async function () {
        // given
        const publishableFinalizedSession1 = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: true,
          publishedAt: null,
          finalizedAt: new Date('2020-01-01'),
        });
        const publishableFinalizedSession2 = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: true,
          publishedAt: null,
          finalizedAt: new Date('2019-01-01'),
        });
        const publishableFinalizedSession3 = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: true,
          publishedAt: null,
          finalizedAt: new Date('2021-01-01'),
        });

        databaseBuilder.factory.buildFinalizedSession({
          isPublishable: true,
          publishedAt: null,
          finalizedAt: new Date('2020-01-01'),
          assignedCertificationOfficerName: 'Ruppert Giles',
        });
        databaseBuilder.factory.buildFinalizedSession({ isPublishable: false, publishedAt: null });
        databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: '2021-01-01' });

        await databaseBuilder.commit();

        // when
        const result = await finalizedSessionRepository.findFinalizedSessionsToPublish();

        // then
        expect(result).to.have.lengthOf(3);
        expect(result).to.have.deep.ordered.members([
          {
            sessionId: publishableFinalizedSession2.sessionId,
            finalizedAt: publishableFinalizedSession2.finalizedAt,
            certificationCenterName: publishableFinalizedSession2.certificationCenterName,
            sessionDate: publishableFinalizedSession2.date,
            sessionTime: publishableFinalizedSession2.time,
            isPublishable: publishableFinalizedSession2.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
          {
            sessionId: publishableFinalizedSession1.sessionId,
            finalizedAt: publishableFinalizedSession1.finalizedAt,
            certificationCenterName: publishableFinalizedSession1.certificationCenterName,
            sessionDate: publishableFinalizedSession1.date,
            sessionTime: publishableFinalizedSession1.time,
            isPublishable: publishableFinalizedSession1.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
          {
            sessionId: publishableFinalizedSession3.sessionId,
            finalizedAt: publishableFinalizedSession3.finalizedAt,
            certificationCenterName: publishableFinalizedSession3.certificationCenterName,
            sessionDate: publishableFinalizedSession3.date,
            sessionTime: publishableFinalizedSession3.time,
            isPublishable: publishableFinalizedSession3.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
        ]);
      });
    });

    context('when there are no publishable sessions', function () {
      it('returns an empty array', async function () {
        // given / when
        const result = await finalizedSessionRepository.findFinalizedSessionsToPublish();

        // then
        expect(result).to.have.lengthOf(0);
      });
    });
  });

  describe('#findFinalizedSessionsWithRequiredAction', function () {
    context('when there are finalized sessions with required action', function () {
      it('finds a list of finalized session with required action ordered by finalization date', async function () {
        // given
        const secondFinalizedSession = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: false,
          publishedAt: null,
          finalizedAt: new Date('2020-01-01'),
        });
        const firstFinalizedSession = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: false,
          publishedAt: null,
          finalizedAt: new Date('2019-01-01'),
        });
        const thirdFinalizedSession = databaseBuilder.factory.buildFinalizedSession({
          isPublishable: false,
          publishedAt: null,
          finalizedAt: new Date('2021-01-01'),
        });

        databaseBuilder.factory.buildFinalizedSession({ isPublishable: true, publishedAt: null });
        databaseBuilder.factory.buildFinalizedSession({ isPublishable: false, publishedAt: '2021-01-01' });

        await databaseBuilder.commit();

        // when
        const result = await finalizedSessionRepository.findFinalizedSessionsWithRequiredAction();

        // then
        expect(result).to.have.lengthOf(3);
        expect(result).to.have.deep.ordered.members([
          {
            sessionId: firstFinalizedSession.sessionId,
            finalizedAt: firstFinalizedSession.finalizedAt,
            certificationCenterName: firstFinalizedSession.certificationCenterName,
            sessionDate: firstFinalizedSession.date,
            sessionTime: firstFinalizedSession.time,
            isPublishable: firstFinalizedSession.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
          {
            sessionId: secondFinalizedSession.sessionId,
            finalizedAt: secondFinalizedSession.finalizedAt,
            certificationCenterName: secondFinalizedSession.certificationCenterName,
            sessionDate: secondFinalizedSession.date,
            sessionTime: secondFinalizedSession.time,
            isPublishable: secondFinalizedSession.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
          {
            sessionId: thirdFinalizedSession.sessionId,
            finalizedAt: thirdFinalizedSession.finalizedAt,
            certificationCenterName: thirdFinalizedSession.certificationCenterName,
            sessionDate: thirdFinalizedSession.date,
            sessionTime: thirdFinalizedSession.time,
            isPublishable: thirdFinalizedSession.isPublishable,
            publishedAt: null,
            assignedCertificationOfficerName: null,
          },
        ]);
      });
    });

    context('when there are no publishable sessions', function () {
      it('returns an empty array', async function () {
        // given / when
        const result = await finalizedSessionRepository.findFinalizedSessionsWithRequiredAction();

        // then
        expect(result).to.have.lengthOf(0);
      });
    });
  });
});
