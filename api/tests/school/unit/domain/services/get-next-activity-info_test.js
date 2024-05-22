import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { ActivityInfo } from '../../../../../src/school/domain/models/ActivityInfo.js';
import {
  END_OF_MISSION,
  getNextActivityInfo,
} from '../../../../../src/school/domain/services/get-next-activity-info.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Pix Junior | get next activity info', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    {
      activities: [],
      stepCount: 2,
      expectedActivityInfo: '0:VALIDATION',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED'],
      stepCount: 1,
      expectedActivityInfo: '-:CHALLENGE',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED'],
      stepCount: 2,
      expectedActivityInfo: '1:VALIDATION',
    },
    {
      activities: ['0:VALIDATION:FAILED'],
      stepCount: 1,
      expectedActivityInfo: '0:TRAINING',
    },
    {
      activities: ['0:VALIDATION:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: '0:TRAINING',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:FAILED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SUCCEEDED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED'],
      stepCount: 1,
      expectedActivityInfo: '0:VALIDATION',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED'],
      stepCount: 1,
      expectedActivityInfo: '0:TUTORIAL',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '1:VALIDATION:FAILED', '1:TRAINING:SUCCEEDED'],
      stepCount: 2,
      expectedActivityInfo: '1:VALIDATION',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '1:VALIDATION:FAILED', '1:TRAINING:FAILED'],
      stepCount: 2,
      expectedActivityInfo: '1:TUTORIAL',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED'],
      stepCount: 1,
      expectedActivityInfo: '0:TRAINING',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:FAILED'],
      stepCount: 1,
      expectedActivityInfo: '0:TRAINING',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:FAILED'],
      stepCount: 1,
      expectedActivityInfo: '0:TUTORIAL',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: '0:TUTORIAL',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: '0:TRAINING',
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '1:VALIDATION:FAILED', '1:TRAINING:FAILED', '1:TUTORIAL:SUCCEEDED'],
      stepCount: 2,
      expectedActivityInfo: '1:TRAINING',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED', '0:TRAINING:SUCCEEDED'],
      stepCount: 1,
      expectedActivityInfo: '0:VALIDATION',
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SUCCEEDED',
      ],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SUCCEEDED',
        '1:VALIDATION:SUCCEEDED',
      ],
      stepCount: 2,
      expectedActivityInfo: '-:CHALLENGE',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED', '0:TRAINING:FAILED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SUCCEEDED', '1:VALIDATION:FAILED'],
      stepCount: 2,
      expectedActivityInfo: '1:TRAINING',
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SUCCEEDED', '-:CHALLENGE:FAILED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED', '0:TRAINING:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SKIPPED'],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:FAILED',
      ],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SKIPPED',
      ],
      stepCount: 1,
      expectedActivityInfo: END_OF_MISSION,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SUCCEEDED',
      ],
      stepCount: 2,
      expectedActivityInfo: '1:VALIDATION',
    },
  ].forEach(({ activities, stepCount, expectedActivityInfo }) => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    context(`when activities flow is ${JSON.stringify(activities)} in a ${stepCount} steps mission`, function () {
      it(`should return ${expectedActivityInfo.toString()}`, function () {
        const result = getNextActivityInfo({ activities: buildActivities(activities), stepCount });

        expect(result).to.deep.equal(activityInfo(expectedActivityInfo));
      });
    });
  });

  function activityInfo(activityInfo) {
    if (END_OF_MISSION === activityInfo) return activityInfo;

    const [stepIndex, level] = activityInfo.split(':');
    return new ActivityInfo({
      stepIndex: isNaN(Number(stepIndex)) ? undefined : Number(stepIndex),
      level: Activity.levels[level],
    });
  }
});

function buildActivities(activities) {
  return activities.map((activity, index) => {
    const [stepIndex, level, status] = activity.split(':');
    return domainBuilder.buildActivity({
      stepIndex: stepIndex ? Number(stepIndex) : undefined,
      level: Activity.levels[level],
      status: Activity.status[status],
      createdAt: new Date(`2024-01-${index + 1}`),
    });
  });
}
