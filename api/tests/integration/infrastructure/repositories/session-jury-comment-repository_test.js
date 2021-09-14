const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const sessionJuryCommentRepository = require('../../../../lib/infrastructure/repositories/session-jury-comment-repository');

describe('Integration | Infrastructure | Repository | session-jury-comment-repository', function() {

  describe('#get', function() {

    context('when there is a SessionJuryComment for the given id', function() {

      it('should return the SessionJuryComment', async function() {
        // given
        const juryComment = 'pas interessant';
        const id = 9999;
        const date = new Date('2018-01-12T09:29:16Z');
        const user = databaseBuilder.factory.buildUser();
        const session = databaseBuilder.factory.buildSession({
          id,
          juryComment,
          juryCommentAuthorId: user.id,
          juryCommentedAt: date,
        });
        await databaseBuilder.commit();

        // when
        const sessionJuryComment = await sessionJuryCommentRepository.get(session.id);

        // then
        const expectedSessionJuryComment = domainBuilder.buildSessionJuryComment({
          id,
          updatedAt: date,
          authorId: user.id,
          comment: juryComment,
        });
        expect(sessionJuryComment).to.deepEqualInstance(expectedSessionJuryComment);
      });

      it('should return the SessionJuryComment even if there are no comment in the given session', async function() {
        // given
        const session = databaseBuilder.factory.buildSession({
          id: 123,
          juryComment: null,
          juryCommentAuthorId: null,
          juryCommentedAt: null,
        });
        await databaseBuilder.commit();

        // when
        const sessionJuryComment = await sessionJuryCommentRepository.get(session.id);

        // then
        const expectedSessionJuryComment = domainBuilder.buildSessionJuryComment({
          id: 123,
          updatedAt: null,
          authorId: null,
          comment: null,
        });
        expect(sessionJuryComment).to.deepEqualInstance(expectedSessionJuryComment);
      });
    });

    context('when there are no SessionJuryComment for the given id', function() {

      it('should throw a NotFoundError', async function() {
        // given
        databaseBuilder.factory.buildSession({ id: 123 });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(sessionJuryCommentRepository.get)(456);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('La session 456 n\'existe pas ou son accès est restreint.');
      });
    });
  });
});
