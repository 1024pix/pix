const SessionJuryComment = require('../../../../lib/domain/models/SessionJuryComment');
const { expect } = require('../../../test-helper');
const _ = require('lodash');

const SESSION_JURY_COMMENT_PROPS = [
  'id',
  'comment',
  'authorId',
  'updatedAt',
];

describe('Unit | Domain | Models | SessionJuryComment', function() {
  let comment;

  beforeEach(function() {
    comment = new SessionJuryComment({
      id: 1,
      comment: 'Un commentaire du pôle certif',
      authorId: 2,
      updatedAt: new Date(),
    });
  });

  it('should create an object of the Session type', function() {
    expect(comment).to.be.instanceOf(SessionJuryComment);
  });

  it('should create a session with all the requires properties', function() {
    expect(_.keys(comment)).to.have.deep.members(SESSION_JURY_COMMENT_PROPS);
  });
});
