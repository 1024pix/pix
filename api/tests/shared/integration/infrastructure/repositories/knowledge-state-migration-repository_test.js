import { expect } from 'chai';

import * as knowledgeStateMigrationRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-migration-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Shared | Infrastructure | Repository | knowledge-state-migration', function () {
  describe('#findMigratedUserIds', function () {
    it('should give, among the given users, those migrated to knowledge states', async function () {
      // given
      const migratedUserId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const strangerId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeStateMigration({ userId: migratedUserId });
      databaseBuilder.factory.buildKnowledgeStateMigration({ userId: strangerId });
      await databaseBuilder.commit();

      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([
        migratedUserId,
        otherUserId,
      ]);

      // then
      expect(migratedUserIds).to.deep.equal(new Set([migratedUserId]));
    });

    it('should give an empty set for no user', async function () {
      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([]);

      // then
      expect(migratedUserIds).to.deep.equal(new Set());
    });

    it('should give an empty set when none of the users is migrated', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([userId, 12]);

      // then
      expect(migratedUserIds).to.deep.equal(new Set());
    });
  });

  describe('#save', function () {
    it('should mark the user as migrated, with the report of the migration', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const report = { knowledgeElementCount: 12, knowledgeStateCount: 3, unknownSkillIds: ['skill_gone'] };

      // when
      await knowledgeStateMigrationRepository.save(userId, report);

      // then
      const rows = await knex('knowledge_state_migrations').where({ userId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0].report).to.deep.equal(report);
      expect(rows[0].migratedAt).to.be.instanceOf(Date);
    });

    it('should refuse to mark a user already migrated', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeStateMigration({ userId });
      await databaseBuilder.commit();

      // when
      const error = await knowledgeStateMigrationRepository.save(userId, {}).catch((error) => error);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.include('knowledge_state_migrations_pkey');
    });
  });
});
