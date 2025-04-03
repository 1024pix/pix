import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { createTempFile, expect, removeTempFile, sinon } from '../../../../test-helper.js';

describe('Integration | Quest | Domain | UseCases | create-or-update-quests-in-batch', function () {
  let filePath;

  afterEach(async function () {
    await removeTempFile(filePath);
  });

  it('should save the passed quests in file', async function () {
    // given
    filePath = await createTempFile(
      'test.csv',
      `Quest ID;Json configuration for quest
    ;{"rewardType":"coucou","rewardId":null,"eligibilityRequirements":[],"successRequirements":[]}`,
    );
    const spySave = sinon.spy(repositories.questRepository, 'saveInBatch');
    const spyDelete = sinon.spy(repositories.questRepository, 'deleteByIds');

    // when
    await usecases.createOrUpdateQuestsInBatch({ filePath });

    // then
    expect(spyDelete.called).to.be.false;
    expect(spySave).to.have.been.calledWithExactly({
      quests: [
        new Quest({
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          rewardType: 'coucou',
          rewardId: null,
          eligibilityRequirements: [],
          successRequirements: [],
        }),
      ],
    });
  });

  it('should delete the passed quests in file only when there is a "Oui" in the column, else it will pass it as to update', async function () {
    // given
    filePath = await createTempFile(
      'test.csv',
      `Quest ID;Json configuration for quest;deleteQuest
    3;{"rewardType":"coucou","rewardId":null,"eligibilityRequirements":[],"successRequirements":[]};OUI
    5;{"rewardType":"bonjour","rewardId":null,"eligibilityRequirements":[],"successRequirements":[]};oui
    4;{"rewardType":"salut","rewardId":null,"eligibilityRequirements":[],"successRequirements":[]};Non
    `,
    );
    const spySave = sinon.spy(repositories.questRepository, 'saveInBatch');
    const spyDelete = sinon.spy(repositories.questRepository, 'deleteByIds');

    // when
    await usecases.createOrUpdateQuestsInBatch({ filePath });

    // then
    expect(spySave).to.have.been.calledWithExactly({
      quests: [
        new Quest({
          id: '4',
          createdAt: undefined,
          updatedAt: undefined,
          rewardType: 'salut',
          rewardId: null,
          eligibilityRequirements: [],
          successRequirements: [],
        }),
      ],
    });
    expect(spyDelete).to.have.been.calledWithExactly({
      questIds: ['3', '5'],
    });
  });
});
