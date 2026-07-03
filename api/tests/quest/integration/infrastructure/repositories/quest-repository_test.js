import sinon from 'sinon';

import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { Quest } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import * as questRepository from '../../../../../src/quest/infrastructure/repositories/quest-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | quest', function () {
  describe('#save', function () {
    it('should save quest and return its id', async function () {
      // given
      const quest = new Quest({
        id: 1,
        createdAt: new Date(),
        updatedAt: null,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 1,
        eligibilityRequirements: [],
        successRequirements: [],
      });

      // when
      const result = await questRepository.save({ quest });

      // then
      expect(result).to.equal(quest.id);
    });

    it('should update quest if it already exists in db', async function () {
      // given
      const oldRewardId = 1;
      const newRewardId = 2;
      const createdAt = new Date();

      const questInDatabase = databaseBuilder.factory.buildQuest({
        id: 1,
        createdAt,
        updatedAt: createdAt,
        rewardId: oldRewardId,
        eligibilityRequirements: [],
        successRequirements: [],
      });

      const newQuest = new Quest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: newRewardId,
        eligibilityRequirements: [],
        successRequirements: [],
      });

      await databaseBuilder.commit();

      // when
      const result = await questRepository.save({ quest: newQuest });

      const resultQuest = await knex('quests').where('id', questInDatabase.id).first();

      // then
      expect(result).to.equal(questInDatabase.id);
      expect(resultQuest.createdAt).to.be.instanceOf(Date);
      expect(resultQuest.createdAt.toString()).to.equal(createdAt.toString());
      expect(resultQuest.updatedAt).to.not.equal(questInDatabase.updatedAt);
      expect(resultQuest.rewardId).to.equal(newRewardId);
    });
  });

  describe('#saveInBatch', function () {
    it('should save quests and return their ids', async function () {
      const createdAt = new Date('2020-01-01T00:00:00Z');
      const createdAt2 = new Date('2020-01-01T00:00:00Z');

      const { id: rewardId } = databaseBuilder.factory.buildAttestation();
      const questInDatabase = databaseBuilder.factory.buildQuest({
        createdAt,
        updatedAt: createdAt,
        rewardId,
        successRequirements: [],
      });
      databaseBuilder.factory.buildQuest({
        createdAt: createdAt2,
        updatedAt: createdAt2,
        rewardId,
      });
      await databaseBuilder.commit();
      await databaseBuilder.fixSequences();

      const expectedNewQuest = new Quest({
        id: undefined,
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [],
        successRequirements: [],
      });

      // when
      const result = await questRepository.saveInBatch({
        quests: [expectedNewQuest, new Quest(questInDatabase)],
      });

      // then
      const [updatedQuest, notUpdatedQuest, createdQuest] = await knex('quests').orderBy('id');

      expect(updatedQuest.updatedAt).to.not.deep.equal(createdAt);
      expect(notUpdatedQuest.updatedAt).to.deep.equal(createdAt2);
      sinon.assert.match(
        new Quest(createdQuest),
        sinon.match(
          new Quest({
            ...expectedNewQuest,
            eligibilityRequirements: expectedNewQuest.eligibilityRequirements,
            successRequirements: expectedNewQuest.successRequirements,
            organizationId: null,
            code: null,
            id: sinon.match.number,
            createdAt: sinon.match.date,
            updatedAt: sinon.match.date,
          }),
        ),
      );
      expect(result[0]).to.equal(createdQuest.id);
    });
  });

  describe('#findAllWithReward', function () {
    it('it should return all quests with reward including those linked to combined courses', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      const questToExclude = databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: null,
        rewardId: null,
        eligibilityRequirements: [],
        successRequirements: [],
      });

      databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: 1 });

      await databaseBuilder.commit();

      // when
      const quests = await questRepository.findAllWithReward({ includeCombinedCourses: true });
      const questIds = quests.map((quest) => quest.id);

      // then
      expect(quests[0]).to.be.an.instanceof(Quest);
      expect(quests).to.have.lengthOf(2);
      expect(questIds).to.not.include(questToExclude.id);
    });
    it('should return the quests with reward id, not linked to combined courses, when param includeCombinedCourses is false', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: 1 });

      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: null,
        rewardId: null,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      await databaseBuilder.commit();

      // when
      const quests = await questRepository.findAllWithReward({ includeCombinedCourses: false });

      // then
      expect(quests[0]).to.be.an.instanceof(Quest);
      expect(quests).to.have.lengthOf(1);
      expect(quests[0].id).to.equal(2);
    });
  });

  describe('#findById', function () {
    it('should return a quest if quest exist', async function () {
      // given
      const questId = 1;
      databaseBuilder.factory.buildQuest({ id: questId });
      await databaseBuilder.commit();

      // when
      const quest = await questRepository.findById({ questId });

      // then
      expect(quest).to.be.an.instanceof(Quest);
      expect(quest.id).to.equal(1);
    });

    it('should return null if quest does not exist', async function () {
      // given
      const questId = 1;

      // when
      const quest = await questRepository.findById({ questId });

      // then
      expect(quest).to.be.null;
    });
  });

  describe('#deleteByIds', function () {
    it('should delete quest given ids', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      await databaseBuilder.commit();
      await databaseBuilder.fixSequences();

      // when
      await questRepository.deleteByIds({ questIds: ['1', 3] });

      const quests = await questRepository.findAllWithReward({ includeCombinedCourses: true });

      // then
      expect(quests).to.have.lengthOf(1);
      expect(quests[0].id).to.equal(2);
    });
  });
});
