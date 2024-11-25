import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import { QuestResult } from '../../../../../src/quest/domain/models/QuestResult.js';
import * as questResultSerializer from '../../../../../src/quest/infrastructure/serializers/quest-result-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | quest-result', function () {
  it('#serialize', function () {
    // given
    const questResult = new QuestResult({
      id: 1,
      obtained: true,
      reward: new Attestation({ id: 10, key: 'MY_KEY', templateName: 'my-key', createdAt: new Date('2020-10-10') }),
      profileRewardId: 1,
    });

    // when
    const serializedQuestResult = questResultSerializer.serialize(questResult);

    // then
    expect(serializedQuestResult).to.deep.equal({
      data: {
        type: 'quest-results',
        id: '1',
        attributes: {
          obtained: true,
          reward: { id: 10, templateName: 'my-key', key: 'MY_KEY', createdAt: new Date('2020-10-10') },
          'profile-reward-id': 1,
        },
      },
    });
  });
});
