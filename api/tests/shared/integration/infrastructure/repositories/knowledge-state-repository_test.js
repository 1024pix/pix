import { expect } from 'chai';

import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.ts';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Shared | Infrastructure | Repository | knowledge-state', function () {
  describe('#findByUserIds', function () {
    it('should give the knowledge states of the given users only', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const strangerId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3 });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_file', floor: 1 });
      databaseBuilder.factory.buildKnowledgeState({ userId: otherUserId, tubeId: 'tube_web', floor: 2 });
      databaseBuilder.factory.buildKnowledgeState({ userId: strangerId, tubeId: 'tube_web', floor: 5 });
      await databaseBuilder.commit();

      // when
      const knowledgeStates = await knowledgeStateRepository.findByUserIds([userId, otherUserId]);

      // then
      expect(knowledgeStates).to.have.lengthOf(3);
      expect(
        knowledgeStates.map((knowledgeState) => [knowledgeState.userId, knowledgeState.tubeId, knowledgeState.floor]),
      ).to.have.deep.members([
        [userId, 'tube_web', 3],
        [userId, 'tube_file', 1],
        [otherUserId, 'tube_web', 2],
      ]);
      expect(knowledgeStates[0]).to.be.instanceOf(KnowledgeState);
    });

    it('should give every field of a knowledge state', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const updatedAt = new Date('2026-10-08T10:00:00Z');
      const ceilingAt = new Date('2026-10-01T10:00:00Z');
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 3,
        ceiling: 5,
        ceilingAt,
        directLevels: [3, 5],
        updatedAt,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeStates = await knowledgeStateRepository.findByUserIds([userId]);

      // then
      expect(knowledgeStates).to.deep.equal([
        new KnowledgeState({
          userId,
          tubeId: 'tube_web',
          floor: 3,
          ceiling: 5,
          ceilingAt,
          directLevels: [3, 5],
          updatedAt,
        }),
      ]);
    });

    it('should return an empty array for no user', async function () {
      // when
      const knowledgeStates = await knowledgeStateRepository.findByUserIds([]);

      // then
      expect(knowledgeStates).to.deep.equal([]);
    });

    it('should return an empty array if requested user does not exist', async function () {
      // when
      const knowledgeStates = await knowledgeStateRepository.findByUserIds([12]);

      // then
      expect(knowledgeStates).to.deep.equal([]);
    });
  });

  describe('#save', function () {
    it('should insert the knowledge state of a tube the user never met', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const updatedAt = new Date('2026-10-08T10:00:00Z');

      // when
      await knowledgeStateRepository.save([
        new KnowledgeState({ userId, tubeId: 'tube_web', floor: 2, ceiling: 4, directLevels: [2, 4], updatedAt }),
      ]);

      // then
      const rows = await knex('knowledge_states').where({ userId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.deep.include({ tubeId: 'tube_web', floor: 2, ceiling: 4, directLevels: [2, 4] });
      expect(rows[0].updatedAt).to.deep.equal(updatedAt);
      expect(rows[0].ceilingAt).to.deep.equal(updatedAt);
    });

    it('should replace the knowledge state of a tube the user already met', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tube_web',
        floor: 2,
        ceiling: 4,
        ceilingAt: new Date('2026-10-01T10:00:00Z'),
        directLevels: [2, 4],
      });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_file', floor: 1, directLevels: [1] });
      await databaseBuilder.commit();
      const updatedAt = new Date('2026-10-08T10:00:00Z');

      // when
      await knowledgeStateRepository.save([
        new KnowledgeState({ userId, tubeId: 'tube_web', floor: 4, ceiling: null, directLevels: [2, 4], updatedAt }),
      ]);

      // then
      const rows = await knex('knowledge_states').where({ userId }).orderBy('tubeId');
      expect(rows.map(({ tubeId, floor, ceiling, ceilingAt }) => [tubeId, floor, ceiling, ceilingAt])).to.deep.equal([
        ['tube_file', 1, null, null],
        ['tube_web', 4, null, null],
      ]);
      expect(rows[1].updatedAt).to.deep.equal(updatedAt);
    });

    it('should leave the same tube of another user as it is', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeState({ userId: otherUserId, tubeId: 'tube_web', floor: 2 });
      await databaseBuilder.commit();

      // when
      await knowledgeStateRepository.save([new KnowledgeState({ userId, tubeId: 'tube_web', floor: 5 })]);

      // then
      const rows = await knex('knowledge_states').orderBy('userId');
      expect(rows.map(({ userId, floor }) => [userId, floor])).to.deep.equal([
        [userId, 5],
        [otherUserId, 2],
      ]);
    });

    it('should do nothing without knowledge states', async function () {
      // when
      await knowledgeStateRepository.save([]);

      // then
      expect(await knex('knowledge_states')).to.deep.equal([]);
    });
  });

  describe('#remove', function () {
    it('should delete the given tubes of the user only', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3 });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_file', floor: 1 });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_mail', floor: 2 });
      databaseBuilder.factory.buildKnowledgeState({ userId: otherUserId, tubeId: 'tube_web', floor: 2 });
      await databaseBuilder.commit();

      // when
      await knowledgeStateRepository.remove(userId, ['tube_web', 'tube_mail']);

      // then
      const rows = await knex('knowledge_states').orderBy('userId');
      expect(rows.map(({ userId, tubeId }) => [userId, tubeId])).to.deep.equal([
        [userId, 'tube_file'],
        [otherUserId, 'tube_web'],
      ]);
    });

    it('should do nothing without tubes', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'tube_web', floor: 3 });
      await databaseBuilder.commit();

      // when
      await knowledgeStateRepository.remove(userId, []);

      // then
      expect(await knex('knowledge_states')).to.have.lengthOf(1);
    });
  });
});
