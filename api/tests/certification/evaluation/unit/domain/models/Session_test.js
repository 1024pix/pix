import { expect } from 'chai';

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

  describe('#updateDateAndTime', function () {
    it('sets the new date and time properties based on provided timestamp', function () {
      const session = domainBuilder.certification.evaluation.buildSession({
        date: '2026-01-01',
        time: '12:00:00',
        hasStarted: false,
      });

      // eslint-disable-next-line no-restricted-syntax
      session.updateDateAndTime(new Date('2026-05-04T05:09:02.674+02:00'));

      expect(session.date).to.equal('2026-05-04');
      expect(session.time).to.equal('05:09:00');
    });
  });
});
