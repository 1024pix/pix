import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | Scorecard model', function (hooks) {
  let scorecard;

  setupTest(hooks);

  hooks.beforeEach(function () {
    scorecard = run(() => this.owner.lookup('service:store').createRecord('scorecard'));
  });

  module('capedPercentageAheadOfNextLevel', function () {
    [
      { percentageAheadOfNextLevel: 10, expectedCapedPercentageAheadOfNextLevel: 10 },
      { percentageAheadOfNextLevel: 95, expectedCapedPercentageAheadOfNextLevel: 95 },
      { percentageAheadOfNextLevel: 98, expectedCapedPercentageAheadOfNextLevel: 95 },
    ].forEach((data) => {
      test(`should return ${data.expectedCapedPercentageAheadOfNextLevel} when percentageScoreAheadOfNextLevel is ${data.percentageAheadOfNextLevel}`, function (assert) {
        // given
        scorecard.percentageAheadOfNextLevel = data.percentageAheadOfNextLevel;

        // when
        const capedPercentageAheadOfNextLevel = scorecard.capedPercentageAheadOfNextLevel;

        // then
        assert.strictEqual(capedPercentageAheadOfNextLevel, data.expectedCapedPercentageAheadOfNextLevel);
      });
    });
  });
});
