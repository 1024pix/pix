import { SessionJuryComment } from '../../../../lib/domain/models/SessionJuryComment.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import _ from 'lodash';

const SESSION_JURY_COMMENT_PROPS = ['id', 'comment', 'authorId', 'updatedAt'];

describe('Unit | Domain | Models | SessionJuryComment', function () {
  let comment;

  beforeEach(function () {
    comment = new SessionJuryComment({
      id: 1,
      comment: 'Un commentaire du pôle certif',
      authorId: 2,
      updatedAt: new Date(),
    });
  });

  it('should create an object of the Session type', function () {
    expect(comment).to.be.instanceOf(SessionJuryComment);
  });

  it('should create a session with all the requires properties', function () {
    expect(_.keys(comment)).to.have.deep.members(SESSION_JURY_COMMENT_PROPS);
  });

  context('#update', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: new Date('2003-04-05T03:04:05Z'), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update the comment', function () {
      // given
      const comment = domainBuilder.buildSessionJuryComment({
        id: 789,
        comment: 'Le commentaire original',
        authorId: 321,
        updatedAt: new Date('2001-02-03T01:02:03Z'),
      });

      // when
      comment.update({
        comment: 'Un autre commentaire',
        authorId: 456,
      });

      // then
      const expectedComment = domainBuilder.buildSessionJuryComment({
        id: 789,
        comment: 'Un autre commentaire',
        authorId: 456,
        updatedAt: new Date('2003-04-05T03:04:05Z'),
      });
      expect(comment).to.deepEqualInstance(expectedComment);
    });
  });
});
