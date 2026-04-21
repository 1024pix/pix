import sinon from 'sinon';

import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { createTempFile, removeTempFile } from '../../../../tooling/test-utils/file.js';

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
    ;{"rewardType":"attestations","rewardId":1,"eligibilityRequirements":[],"successRequirements":[]}`,
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
          rewardType: 'attestations',
          rewardId: 1,
          eligibilityRequirements: [],
          successRequirements: [],
        }),
      ],
    });
  });

  it('should not delete the passed quests in file if they correspond to a combined course', async function () {
    // given
    const id = databaseBuilder.factory.buildCombinedCourse().id;
    await databaseBuilder.commit();

    filePath = await createTempFile(
      'test.csv',
      `Quest ID;Json configuration for quest;deleteQuest
    ${id};{"rewardType":"","rewardId":,"eligibilityRequirements":[],"successRequirements":[]};OUI

    `,
    );
    const spyDelete = sinon.spy(repositories.questRepository, 'deleteByIds');

    // when
    await usecases.createOrUpdateQuestsInBatch({ filePath });

    // then
    expect(spyDelete).to.not.have.been.called;
  });
  it('should not update the passed quests in file if they correspond to a combined course', async function () {
    // given
    const id = databaseBuilder.factory.buildCombinedCourse().id;
    await databaseBuilder.commit();

    filePath = await createTempFile(
      'test.csv',
      `Quest ID;Json configuration for quest;deleteQuest
    ${id};{"rewardType":"","rewardId":,"eligibilityRequirements":[],"successRequirements":[]};NON

    `,
    );
    const saveDelete = sinon.spy(repositories.questRepository, 'saveInBatch');

    // when
    await usecases.createOrUpdateQuestsInBatch({ filePath });

    // then
    expect(saveDelete).to.not.have.been.called;
  });
  it('should delete the passed quests in file only when there is a "Oui" in the column, else it will pass it as to update', async function () {
    // given
    filePath = await createTempFile(
      'test.csv',
      `Quest ID;Json configuration for quest;deleteQuest
    3;{"rewardType":"attestations","rewardId":1,"eligibilityRequirements":[],"successRequirements":[]};OUI
    5;{"rewardType":"attestations","rewardId":2,"eligibilityRequirements":[],"successRequirements":[]};oui
    4;{"rewardType":"attestations","rewardId":3,"eligibilityRequirements":[],"successRequirements":[]};Non
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
          rewardType: 'attestations',
          rewardId: 3,
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
