import sinon from 'sinon';

import { UserModuleStatus } from '../../../../../src/devcomp/domain/models/module/UserModuleStatus.js';
import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { getUserModuleStatuses } from '../../../../../src/devcomp/domain/usecases/get-user-module-statuses.js';

describe('Unit | Devcomp | Domain | UseCases | get-user-module-statuses', function () {
  const now = new Date('2025-07-02T14:00:00Z');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should return a list of UserModuleStatuses', async function () {
    // given
    const firstModuleIdWithNoPassagesRelated = 'caf66fbe-285f-46b7-95f1-e18282d41a48';
    const secondModuleId = '6ec3944f-5eb6-435a-9838-b5d0b033138b';
    const thirdModuleId = 'a7b43070-bf13-44e3-b38d-4eeca99a014d';
    const moduleIds = [firstModuleIdWithNoPassagesRelated, secondModuleId, thirdModuleId];

    const userId = '1';

    const inProgressPassage = new Passage({
      id: 1,
      moduleId: secondModuleId,
      userId,
      createdAt: now,
      updatedAt: now,
      terminatedAt: null,
    });

    const terminatedPassage = new Passage({
      id: 1,
      moduleId: thirdModuleId,
      userId,
      createdAt: now,
      updatedAt: now,
      terminatedAt: now,
    });

    const passageRepository = {
      findAllByUserIdAndModuleIds: sinon.stub(),
    };
    passageRepository.findAllByUserIdAndModuleIds
      .withArgs({ userId, moduleIds })
      .resolves([inProgressPassage, terminatedPassage]);

    // when
    const result = await getUserModuleStatuses({ userId, moduleIds, passageRepository });

    // then
    const expectedUserModuleStatuses = [
      new UserModuleStatus({ userId, moduleId: firstModuleIdWithNoPassagesRelated, passages: [] }),
      new UserModuleStatus({ userId, moduleId: secondModuleId, passages: [inProgressPassage] }),
      new UserModuleStatus({ userId, moduleId: thirdModuleId, passages: [terminatedPassage] }),
    ];
    expect(result).to.deep.equal(expectedUserModuleStatuses);
    expect(result[0].status).to.equal('NOT_STARTED');
    expect(result[1].status).to.equal('IN_PROGRESS');
    expect(result[2].status).to.equal('COMPLETED');
  });
});
