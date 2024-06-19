import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { getMissionResult, results } from '../../../../../src/school/domain/services/get-mission-result.js';
import { domainBuilder, expect } from '../../../../test-helper.js';
const { EXCEEDED, REACHED, NOT_REACHED, PARTIALLY_REACHED } = results;

describe('Unit | Domain | Pix Junior | get mission resultt', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:FAILED'],
      expectedMissionResult: REACHED,
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SUCCEEDED'],
      expectedMissionResult: EXCEEDED,
    },
    {
      activities: ['0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SKIPPED'],
      expectedMissionResult: REACHED,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SUCCEEDED',
      ],
      expectedMissionResult: REACHED,
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
      expectedMissionResult: REACHED,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED', '0:TRAINING:FAILED'],
      expectedMissionResult: NOT_REACHED,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SUCCEEDED', '-:CHALLENGE:FAILED'],
      expectedMissionResult: REACHED,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:FAILED', '0:TUTORIAL:SUCCEEDED', '0:TRAINING:SKIPPED'],
      expectedMissionResult: NOT_REACHED,
    },
    {
      activities: ['0:VALIDATION:FAILED', '0:TRAINING:SUCCEEDED', '0:VALIDATION:SUCCEEDED', '-:CHALLENGE:SKIPPED'],
      expectedMissionResult: REACHED,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:FAILED',
      ],
      expectedMissionResult: NOT_REACHED,
    },
    {
      activities: [
        '0:VALIDATION:FAILED',
        '0:TRAINING:FAILED',
        '0:TUTORIAL:SUCCEEDED',
        '0:TRAINING:SUCCEEDED',
        '0:VALIDATION:SKIPPED',
      ],
      expectedMissionResult: NOT_REACHED,
    },
    {
      activities: [
        '0:VALIDATION:SUCCEEDED',
        '1:VALIDATION:FAILED',
        '1:TRAINING:FAILED',
        '1:TUTORIAL:SUCCEEDED',
        '1:TRAINING:SUCCEEDED',
        '1:VALIDATION:SKIPPED',
      ],
      expectedMissionResult: PARTIALLY_REACHED,
    },
  ].forEach(({ activities, expectedMissionResult }) => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    context(`when activities flow is ${JSON.stringify(activities)}`, function () {
      it(`should return ${expectedMissionResult}`, function () {
        const result = getMissionResult({ activities: buildActivities(activities) });

        expect(result).to.deep.equal(expectedMissionResult);
      });
    });
  });
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
