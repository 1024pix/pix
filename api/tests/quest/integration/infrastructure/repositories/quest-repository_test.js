import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import * as questRepository from '../../../../../src/quest/infrastructure/repositories/quest-repository.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Quest | Integration | Repository | quest', function () {
  describe('#saveInBatch', function () {
    it('should save quests', async function () {
      const { id: rewardId } = databaseBuilder.factory.buildAttestation();
      const questInDatabase = databaseBuilder.factory.buildQuest({
        createdAt: new Date('2020-01-01T00:00:00Z'),
        updatedAt: new Date('2020-01-01T00:00:00Z'),
        rewardId,
        successRequirements: ['coucou'],
      });
      databaseBuilder.factory.buildQuest({
        createdAt: new Date('2021-02-02T00:00:00Z'),
        updatedAt: new Date('2021-02-02T00:00:00Z'),
        rewardId,
      });
      await databaseBuilder.commit();
      await databaseBuilder.fixSequences();

      const expectedNewQuest = new Quest({
        id: undefined,
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [],
        successRequirements: { success: 'success' },
      });

      // when
      await questRepository.saveInBatch({
        quests: [expectedNewQuest, new Quest(questInDatabase)],
      });

      // then
      const [firstQuest, secondQuest, thirdQuest] = await knex('quests').orderBy('id');
      expect(firstQuest.updatedAt).to.not.deep.equal(new Date('2020-01-01T00:00:00Z'));
      expect(secondQuest.updatedAt).to.deep.equal(new Date('2021-02-02T00:00:00Z'));
      sinon.assert.match(
        new Quest(thirdQuest),
        sinon.match(
          new Quest({
            ...expectedNewQuest,
            eligibilityRequirements: expectedNewQuest.eligibilityRequirements,
            id: sinon.match.number,
            createdAt: sinon.match.date,
            updatedAt: sinon.match.date,
          }),
        ),
      );
    });
  });

  describe('#findAll', function () {
    it('should return all quests', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: [],
        successRequirements: { titi: 'tutu' },
      });
      await databaseBuilder.commit();

      // when
      const quests = await questRepository.findAll();

      // then
      expect(quests[0]).to.be.an.instanceof(Quest);
      expect(quests).to.have.lengthOf(3);
    });
  });

  describe('#deleteByIds', function () {
    it('should delete quest given ids', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      await databaseBuilder.commit();
      await databaseBuilder.fixSequences();

      // when
      await questRepository.deleteByIds({ questIds: ['1', 3] });

      const quests = await questRepository.findAll();

      // then
      expect(quests).to.have.lengthOf(1);
      expect(quests[0].id).to.equal(2);
    });
  });
});
