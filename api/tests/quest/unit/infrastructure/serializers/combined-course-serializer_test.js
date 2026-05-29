import sinon from 'sinon';

import { CombinedCourseStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseItem.js';
import { CombinedCourseRewardStatuses } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseReward.js';
import * as combinedCourseSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-serializer.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course', function () {
  it('#serialize', async function () {
    // given
    sinon.stub(cryptoService, 'encrypt');
    cryptoService.encrypt.withArgs('/parcours/COMBINIX1').resolves('encryptedCombinedCourseUrl');
    const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
      combinedCourseItems: [{ campaignId: 1 }, { moduleId: 7 }],
      rewardId: 456,
      rewardType: REWARD_TYPES.ATTESTATION,
    });
    await combinedCourseDetails.setEncryptedUrl();
    const obtainedAt = new Date();
    const reward = {
      id: 456,
      key: 'key',
      label: 'rewardLabel',
      obtainedAt,
      templateName: 'template-name',
    };

    combinedCourseDetails.setDataAndGenerateItems({ reward });
    // when
    const serializedCombinedCourse = combinedCourseSerializer.serialize(combinedCourseDetails);

    // then
    expect(serializedCombinedCourse).to.deep.equal({
      included: [
        {
          type: 'combined-course-items',
          id: '1',
          attributes: {
            title: 'diagnostique1',
            reference: 'ABCDIAG1',
            type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
            redirection: undefined,
            'is-completed': false,
            'is-locked': false,
            'mastery-rate': null,
            'validated-stages-count': null,
            'total-stages-count': null,
            duration: undefined,
            image: undefined,
          },
        },
        {
          type: 'combined-course-items',
          id: '7',
          attributes: {
            title: 'title7',
            reference: 'slug7',
            type: COMBINED_COURSE_ITEM_TYPES.MODULE,
            redirection: 'encryptedCombinedCourseUrl',
            'is-completed': false,
            'mastery-rate': null,
            'validated-stages-count': null,
            'total-stages-count': null,
            'is-locked': true,
            duration: 10,
            image: 'emile7',
            'short-id': 'short-7',
          },
        },
        {
          type: 'combined-course-rewards',
          id: '456',
          attributes: {
            status: CombinedCourseRewardStatuses.OBTAINED,
            type: REWARD_TYPES.ATTESTATION,
            label: 'rewardLabel',
            'template-name': 'template-name',
            data: { id: 456, key: 'key', label: 'rewardLabel', obtainedAt, templateName: 'template-name' },
          },
        },
      ],
      data: {
        type: 'combined-courses',
        id: '1',
        attributes: {
          name: 'Mon parcours',
          code: 'COMBINIX1',
          'organization-id': 3,
          status: CombinedCourseStatuses.NOT_STARTED,
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          illustration: '/illustrations/image.svg',
        },
        relationships: {
          items: {
            data: [
              { id: '1', type: 'combined-course-items' },
              { id: '7', type: 'combined-course-items' },
            ],
          },
          reward: {
            data: {
              type: 'combined-course-rewards',
              id: '456',
            },
          },
        },
      },
    });
  });
});
