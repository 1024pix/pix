import { expect } from 'chai';

import { UserCompetenceScore } from '../../../../../src/shared/domain/models/UserCompetenceScore.ts';
import * as userCompetenceScoreRepository from '../../../../../src/shared/infrastructure/repositories/user-competence-score-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Shared | Infrastructure | Repository | user-competence-score', function () {
  describe('#findByUserIds', function () {
    it('should give the scores of the given users only', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const strangerId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserCompetenceScore({ userId, competenceId: 'recHistoire', pix: 12 });
      databaseBuilder.factory.buildUserCompetenceScore({ userId: otherUserId, competenceId: 'recHistoire', pix: 4 });
      databaseBuilder.factory.buildUserCompetenceScore({ userId: strangerId, competenceId: 'recHistoire', pix: 64 });
      await databaseBuilder.commit();

      // when
      const scores = await userCompetenceScoreRepository.findByUserIds([userId, otherUserId]);

      // then
      expect(scores).to.have.lengthOf(2);
      expect(scores.map((score) => [score.userId, score.pix])).to.have.deep.members([
        [userId, 12],
        [otherUserId, 4],
      ]);
      expect(scores[0]).to.be.instanceOf(UserCompetenceScore);
    });

    it('should return an empty array for no user', async function () {
      // when
      const scores = await userCompetenceScoreRepository.findByUserIds([]);

      // then
      expect(scores).to.deep.equal([]);
    });

    it('should return an empty array if requested user does not exist', async function () {
      // when
      const scores = await userCompetenceScoreRepository.findByUserIds([12]);

      // then
      expect(scores).to.deep.equal([]);
    });
  });

  describe('#save', function () {
    it('should insert the scores of a competence not scored yet', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const updatedAt = new Date('2026-10-08T10:00:00Z');

      // when
      await userCompetenceScoreRepository.save([
        new UserCompetenceScore({ userId, competenceId: 'recHistoire', pix: 12, updatedAt }),
      ]);

      // then
      const rows = await knex('user_competence_scores').where({ userId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.include({ competenceId: 'recHistoire', pix: 12 });
      expect(rows[0].updatedAt).to.deep.equal(updatedAt);
    });

    it('should replace the pix and the date of a competence already scored', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserCompetenceScore({ userId, competenceId: 'recHistoire', pix: 12 });
      databaseBuilder.factory.buildUserCompetenceScore({ userId, competenceId: 'recGeographie', pix: 8 });
      await databaseBuilder.commit();
      const updatedAt = new Date('2026-10-08T10:00:00Z');

      // when
      await userCompetenceScoreRepository.save([
        new UserCompetenceScore({ userId, competenceId: 'recHistoire', pix: 20, updatedAt }),
      ]);

      // then
      const rows = await knex('user_competence_scores').where({ userId }).orderBy('competenceId');
      expect(rows.map(({ competenceId, pix }) => [competenceId, pix])).to.deep.equal([
        ['recGeographie', 8],
        ['recHistoire', 20],
      ]);
      expect(rows[1].updatedAt).to.deep.equal(updatedAt);
    });

    it('should do nothing without scores', async function () {
      // when
      await userCompetenceScoreRepository.save([]);

      // then
      expect(await knex('user_competence_scores')).to.deep.equal([]);
    });
  });
});
