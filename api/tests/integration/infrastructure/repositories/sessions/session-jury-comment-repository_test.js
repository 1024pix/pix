import { expect, databaseBuilder, domainBuilder, catchErr } from '../../../../test-helper';
import { NotFoundError } from '../../../../../lib/domain/errors';
import sessionJuryCommentRepository from '../../../../../lib/infrastructure/repositories/sessions/session-jury-comment-repository';

describe('Integration | Infrastructure | Repository | session-jury-comment-repository', function () {
  context('#get', function () {
    context('when there is a SessionJuryComment for the given id', function () {
      it('should return the SessionJuryComment', async function () {
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

      it('should return the SessionJuryComment even if there are no comment in the given session', async function () {
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

    context('when there are no SessionJuryComment for the given id', function () {
      it('should throw a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildSession({ id: 123 });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(sessionJuryCommentRepository.get)(456);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session 456 n'existe pas ou son accès est restreint.");
      });
    });
  });

  context('#save', function () {
    context('when the session exists', function () {
      it('should update the session comment', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildUser({ id: 789 });
        databaseBuilder.factory.buildSession({
          id: 123,
          juryComment: 'commentaire initial',
          juryCommentAuthorId: 456,
          juryCommentedAt: new Date('2018-01-12T09:29:16Z'),
        });
        await databaseBuilder.commit();
        const sessionJuryCommentToSave = domainBuilder.buildSessionJuryComment({
          id: 123,
          updatedAt: new Date('2020-01-12T10:29:16Z'),
          authorId: 789,
          comment: 'commentaire final',
        });

        // when
        await sessionJuryCommentRepository.save(sessionJuryCommentToSave);

        // then
        const expectedSessionJuryComment = await sessionJuryCommentRepository.get(123);
        expect(sessionJuryCommentToSave).to.deepEqualInstance(expectedSessionJuryComment);
      });
    });

    context('when the session does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildUser({ id: 789 });
        databaseBuilder.factory.buildSession({
          id: 123,
          juryComment: 'commentaire initial',
          juryCommentAuthorId: 456,
          juryCommentedAt: new Date('2018-01-12T09:29:16Z'),
        });
        await databaseBuilder.commit();
        const sessionJuryCommentToSave = domainBuilder.buildSessionJuryComment({
          id: 456,
          updatedAt: new Date('2020-01-12T10:29:16Z'),
          authorId: 789,
          comment: 'commentaire final',
        });

        // when
        const error = await catchErr(sessionJuryCommentRepository.save)(sessionJuryCommentToSave);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session 456 n'existe pas ou son accès est restreint.");
      });
    });
  });

  context('#delete', function () {
    context('when the session exists', function () {
      it('should remove the session comment', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildSession({
          id: 123,
          juryComment: 'Commentaire à supprimer',
          juryCommentAuthorId: 456,
          juryCommentedAt: new Date('2018-01-12T09:29:16Z'),
        });
        await databaseBuilder.commit();
        const expectedSessionJuryComment = domainBuilder.buildSessionJuryComment({
          id: 123,
          comment: null,
          authorId: null,
          updatedAt: null,
        });

        // when
        await sessionJuryCommentRepository.delete(123);

        // then
        const deletedSessionJuryComment = await sessionJuryCommentRepository.get(123);
        expect(deletedSessionJuryComment).to.deepEqualInstance(expectedSessionJuryComment);
      });
    });

    context('when the session does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildUser({ id: 789 });
        databaseBuilder.factory.buildSession({
          id: 123,
          juryComment: 'commentaire initial',
          juryCommentAuthorId: 456,
          juryCommentedAt: new Date('2018-01-12T09:29:16Z'),
        });
        await databaseBuilder.commit();
        const sessionJuryCommentToSave = domainBuilder.buildSessionJuryComment({
          id: 456,
          updatedAt: new Date('2020-01-12T10:29:16Z'),
          authorId: 789,
          comment: 'commentaire final',
        });

        // when
        const error = await catchErr(sessionJuryCommentRepository.save)(sessionJuryCommentToSave);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session 456 n'existe pas ou son accès est restreint.");
      });
    });
  });
});
