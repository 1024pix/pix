import { expect } from 'chai';

import { Session } from '../../../../../../src/certification/evaluation/domain/models/Session.js';

describe('Certification | Evaluation| Unit | domain | models | Session', function () {
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
});
