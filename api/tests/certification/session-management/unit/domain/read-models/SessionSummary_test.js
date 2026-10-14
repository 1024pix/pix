import { expect } from 'chai';
import sinon from 'sinon';

import { SessionSummary } from '../../../../../../src/certification/session-management/domain/read-models/SessionSummary.js';

describe('Unit | Domain | Read-Models | SessionSummary', function () {
  describe('#static from', function () {
    context('when a session has not expired', function () {
      beforeEach(function () {
        sinon.useFakeTimers({ now: new Date('2020-01-01T17:00:00Z'), toFake: ['Date'] });
      });

      context('when both finalizedAt and publishedAt are null', function () {
        it('should build a CREATED session summary', function () {
          // given
          const args = {
            id: 1,
            address: 'ici',
            room: 'la-bas',
            date: '2020-01-01',
            time: '16:00:00',
            examiner: 'Moi',
            enrolledCandidatesCount: 5,
            effectiveCandidatesCount: 4,
            finalizedAt: null,
            publishedAt: null,
          };

          // when
          const sessionSummary = SessionSummary.from(args);

          // then
          expect(sessionSummary.status).to.equal(SessionSummary.statuses.CREATED);
        });
      });

      context('when finalizedAt is not null', function () {
        it('should build a FINALIZED session summary', function () {
          // given
          const args = {
            id: 1,
            address: 'ici',
            room: 'la-bas',
            date: '2020-01-01',
            time: '16:00:00',
            examiner: 'Moi',
            enrolledCandidatesCount: 5,
            effectiveCandidatesCount: 4,
            finalizedAt: new Date('2020-01-04'),
            publishedAt: null,
          };

          // when
          const sessionSummary = SessionSummary.from(args);

          // then
          expect(sessionSummary.status).to.equal(SessionSummary.statuses.FINALIZED);
        });
      });

      context('when publishedAt is not null', function () {
        it('should build a PROCESSED session summary', function () {
          // given
          const args = {
            id: 1,
            address: 'ici',
            room: 'la-bas',
            date: '2020-01-01',
            time: '16:00:00',
            examiner: 'Moi',
            enrolledCandidatesCount: 5,
            effectiveCandidatesCount: 4,
            finalizedAt: null,
            publishedAt: new Date('2020-02-04'),
          };

          // when
          const sessionSummary = SessionSummary.from(args);

          // then
          expect(sessionSummary.status).to.equal(SessionSummary.statuses.PROCESSED);
        });
      });

      context('when both finalizedAt and publishedAt are not null', function () {
        it('should build a PROCESSED session summary', function () {
          // given
          const args = {
            id: 1,
            address: 'ici',
            room: 'la-bas',
            date: '2020-01-01',
            time: '16:00:00',
            examiner: 'Moi',
            enrolledCandidatesCount: 5,
            effectiveCandidatesCount: 4,
            finalizedAt: new Date('2020-01-04'),
            publishedAt: new Date('2020-02-04'),
          };

          // when
          const sessionSummary = SessionSummary.from(args);

          // then
          expect(sessionSummary.status).to.equal(SessionSummary.statuses.PROCESSED);
        });
      });
    });

    context('when a session expires', function () {
      it('should build a TO_FINALIZE session summary', function () {
        // given
        sinon.useFakeTimers({ now: new Date('2020-02-01T17:00:00Z'), toFake: ['Date'] });

        const args = {
          id: 1,
          address: 'ici',
          room: 'la-bas',
          date: '2020-01-01',
          time: '16:00:00',
          examiner: 'Moi',
          enrolledCandidatesCount: 5,
          effectiveCandidatesCount: 4,
          finalizedAt: null,
          publishedAt: null,
        };

        // when
        const sessionSummary = SessionSummary.from(args);

        // then
        expect(sessionSummary.status).to.equal(SessionSummary.statuses.TO_FINALIZE);
      });
    });
  });
});
