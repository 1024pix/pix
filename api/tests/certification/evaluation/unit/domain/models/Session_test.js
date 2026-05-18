import { expect } from 'chai';
import sinon from 'sinon';

import { Session } from '../../../../../../src/certification/evaluation/domain/models/Session.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation| Unit | domain | models | Session', function () {
  describe('#isNotAccessible', function () {
    it('returns false when session is not finalized or published', function () {
      const session = new Session({
        finalizedAt: null,
        publishedAt: null,
      });
      expect(session.isNotAccessible).to.be.false;
    });

    it('returns true when session is finalized', function () {
      const session = new Session({
        finalizedAt: new Date(),
        publishedAt: null,
      });
      expect(session.isNotAccessible).to.be.true;
    });

    it('returns true when session is published', function () {
      const session = new Session({
        finalizedAt: null,
        publishedAt: new Date(),
      });
      expect(session.isNotAccessible).to.be.true;
    });
  });

  describe('#isFinalized', function () {
    it('returns true when session is finalized', function () {
      const session = new Session({ finalizedAt: new Date() });
      expect(session.isFinalized).to.be.true;
    });

    it('returns false when session is not finalized', function () {
      const session = new Session({ finalizedAt: null });
      expect(session.isFinalized).to.be.false;
    });
  });

  describe('#isPublished', function () {
    it('returns true when session is published', function () {
      const session = new Session({ publishedAt: new Date() });
      expect(session.isPublished).to.be.true;
    });

    it('returns false when session is not published', function () {
      const session = new Session({ publishedAt: null });
      expect(session.isPublished).to.be.false;
    });
  });

  describe('setStartDate', function () {
    let clock;
    const now = new Date('2022-11-28T01:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    context('when a timezone is provided', function () {
      it('updates the date according to the provided timezone', function () {
        const session = domainBuilder.certification.evaluation.buildSession({
          date: '2026-01-01',
        });

        session.setStartDate('America/Catamarca');

        expect(session.date).to.equal('2022-11-27');
      });
    });

    context('when no timezone is provided', function () {
      it('leaves the date as it is', function () {
        const session = domainBuilder.certification.evaluation.buildSession({
          date: '2026-01-01',
        });

        session.setStartDate();

        expect(session.date).to.equal('2026-01-01');
      });
    });

    context('when invalid timezone is provided', function () {
      it('leaves the date as it is', function () {
        const session = domainBuilder.certification.evaluation.buildSession({
          date: '2026-01-01',
        });

        session.setStartDate('choubidou/surlagaronne');

        expect(session.date).to.equal('2026-01-01');
      });
    });
  });
});
