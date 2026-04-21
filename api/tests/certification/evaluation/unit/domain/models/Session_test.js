import { expect } from 'chai';

import { Session } from '../../../../../../src/certification/evaluation/domain/models/Session.js';

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

  describe('#updateDate', function () {
    it('sets the date property to a YYYY-MM-DD string based on provided timestamp', function () {
      const dateTime = new Date('2026-05-04');
      const session = new Session({});

      session.updateDate(dateTime);

      expect(session.date).to.equal('2026-05-04');
    });

    it('correctly pads single digit months and days', function () {
      const dateTime = new Date('2026-01-02');
      const session = new Session({});

      session.updateDate(dateTime);

      expect(session.date).to.equal('2026-01-02');
    });
  });
});
