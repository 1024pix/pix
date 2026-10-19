import { expect } from 'chai';

import * as knowledgeStateMigrationRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-migration-repository.ts';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { buildKnowledgeStateMigration, buildUser } = databaseBuilder.factory;

describe('Integration | Shared | Infrastructure | Repository | knowledge-state-migration', function () {
  describe('#isMigrated', function () {
    it('should be true for a user migrated to knowledge states', async function () {
      // given
      const userId = buildUser().id;
      buildKnowledgeStateMigration({ userId });
      await databaseBuilder.commit();

      // when
      const migrated = await knowledgeStateMigrationRepository.isMigrated(userId);

      // then
      expect(migrated).to.equal(true);
    });

    it('should be false for a user not migrated', async function () {
      // given
      const userId = buildUser().id;
      const otherUserId = buildUser().id;
      buildKnowledgeStateMigration({ userId: otherUserId });
      await databaseBuilder.commit();

      // when
      const migrated = await knowledgeStateMigrationRepository.isMigrated(userId);

      // then
      expect(migrated).to.equal(false);
    });

    it('should be false for a user that does not exist', async function () {
      // when
      const migrated = await knowledgeStateMigrationRepository.isMigrated(12);

      // then
      expect(migrated).to.equal(false);
    });
  });

  describe('#findMigratedUserIds', function () {
    it('should give, among the given users, those migrated to knowledge states', async function () {
      // given
      const migratedUserId = buildUser().id;
      const otherUserId = buildUser().id;
      const strangerId = buildUser().id;
      buildKnowledgeStateMigration({ userId: migratedUserId });
      buildKnowledgeStateMigration({ userId: strangerId });
      await databaseBuilder.commit();

      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([
        migratedUserId,
        otherUserId,
      ]);

      // then
      expect(migratedUserIds).to.deep.equal([migratedUserId]);
    });

    it('should give an empty array for no user', async function () {
      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([]);

      // then
      expect(migratedUserIds).to.deep.equal([]);
    });

    it('should give an empty array when none of the users are migrated', async function () {
      // given
      const userId = buildUser().id;
      await databaseBuilder.commit();

      // when
      const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds([userId, 12]);

      // then
      expect(migratedUserIds).to.deep.equal([]);
    });
  });

  describe('#save', function () {
    it('should save the user as migrated, with the report of the migration', async function () {
      // given
      const userId = buildUser().id;
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

    it('should throw when a user is already migrated', async function () {
      // given
      const userId = buildUser().id;
      buildKnowledgeStateMigration({ userId });
      await databaseBuilder.commit();

      // when
      const error = await knowledgeStateMigrationRepository.save(userId, {}).catch((error) => error);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.include('knowledge_state_migrations_pkey');
    });
  });
});
