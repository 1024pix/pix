const { expect } = require('../../../test-helper');
const SessionSummary = require('../../../../lib/domain/read-models/SessionSummary');

describe('Unit | Domain | Read-Models | SessionSummary', () => {

  describe('#static from', () => {

    context('when both finalizedAt and publishedAt are null', () => {

      it('should build a CREATED session summary', () => {
        // given
        const args = {
          id: 1,
          address: 'ici',
          room: 'la-bas',
          date: '2020-01-01',
          time: '16:00',
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

    context('when finalizedAt is not null', () => {

      it('should build a FINALIZED session summary', () => {
        // given
        const args = {
          id: 1,
          address: 'ici',
          room: 'la-bas',
          date: '2020-01-01',
          time: '16:00',
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

    context('when publishedAt is not null', () => {

      it('should build a PROCESSED session summary', () => {
        // given
        const args = {
          id: 1,
          address: 'ici',
          room: 'la-bas',
          date: '2020-01-01',
          time: '16:00',
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

    context('when both finalizedAt and publishedAt are not null', () => {

      it('should build a PROCESSED session summary', () => {
        // given
        const args = {
          id: 1,
          address: 'ici',
          room: 'la-bas',
          date: '2020-01-01',
          time: '16:00',
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
});
