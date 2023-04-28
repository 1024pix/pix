import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | chai-custom-helpers | deepEqualInstance', function () {
  it('should fail assertion when both objects are not of the same instance', function () {
    // given
    const answer = domainBuilder.buildAnswer();
    const campaign = domainBuilder.buildCampaign();
    const answerDTO = { ...answer };

    // when / then
    global.chaiErr(function () {
      expect(campaign).to.deepEqualInstance(answer);
    }, "expected 'Campaign' to equal 'Answer'");
    global.chaiErr(function () {
      expect(answerDTO).to.deepEqualInstance(answer);
    }, "expected 'Object' to equal 'Answer'");
  });

  it('should fail assertion when both objects have not the same content', function () {
    // given
    const training = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [1000, 1001],
      duration: {
        hours: 5,
      },
    });
    const otherTraining1 = domainBuilder.buildTraining({
      title: 'trainingTitle2',
      targetProfileIds: [1000, 1001],
      duration: {
        hours: 5,
      },
    });
    const otherTraining2 = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [2222, 1001],
      duration: {
        hours: 5,
      },
    });
    const otherTraining3 = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [2222, 1001],
      duration: {
        hours: 3,
      },
    });
    const otherTraining4 = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [2222, 1001],
      duration: {
        minutes: 8,
        hours: 5,
      },
    });

    // when/then
    for (const otherTraining of [otherTraining1, otherTraining2, otherTraining3, otherTraining4]) {
      global.chaiErr(
        function () {
          expect(otherTraining).to.deepEqualInstance(training);
        },
        {
          actual: otherTraining,
          expected: training,
          operator: 'deepStrictEqual',
        }
      );
    }
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', function () {
    // given
    const training = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [1000, 1001],
      duration: {
        hours: 5,
      },
    });
    const sameTraining = domainBuilder.buildTraining({
      title: 'trainingTitle1',
      targetProfileIds: [1000, 1001],
      duration: {
        hours: 5,
      },
    });

    // then
    expect(training).to.deepEqualInstance(training);
    expect(training).to.deepEqualInstance(sameTraining);
  });
});
