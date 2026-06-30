import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import scorecardAriaLabel from 'mon-pix/helpers/scorecard-aria-label';
import { module, test } from 'qunit';

module('Integration | Helper | scorecard-aria-label', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr');

  test('should return that competence is not started', async function (assert) {
    // given
    const scorecard = EmberObject.create({
      isNotStarted: true,
    });

    // when
    const screen = await render(<template>{{scorecardAriaLabel scorecard}}</template>);

    // then
    assert.dom(screen.getByText('Compétence non commencée')).exists();
  });

  test('should return that first level of competence is started but not finished', async function (assert) {
    // given
    const scorecard = EmberObject.create({
      isNotStarted: false,
      level: 0,
      capedPercentageAheadOfNextLevel: 12,
    });

    // when
    const screen = await render(<template>{{scorecardAriaLabel scorecard}}</template>);

    // then
    assert.dom(screen.getByText('Le premier niveau est en cours, complété à 12%.')).exists();
  });

  test('should return current level and percentage completed of the next level', async function (assert) {
    // given
    const scorecard = EmberObject.create({
      isNotStarted: false,
      level: 2,
      capedPercentageAheadOfNextLevel: 30,
    });

    // when
    const screen = await render(<template>{{scorecardAriaLabel scorecard}}</template>);

    // then
    assert.dom(screen.getByText('Niveau actuel: 2. Le prochain niveau est complété à 30%.')).exists();
  });
});
