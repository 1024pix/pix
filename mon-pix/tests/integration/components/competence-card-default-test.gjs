import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import CompetenceCardDefault from 'mon-pix/components/competence-card-default';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | competence-card-default', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function (hooks) {
    let area;

    hooks.beforeEach(function () {
      area = EmberObject.create({
        code: 1,
        color: 'jaffa',
      });
    });

    test('should render component', async function (assert) {
      // given
      const scorecard = { area };

      // when
      await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

      // then
      assert.dom('.competence-card').exists();
    });

    test('should display the competence card header with scorecard color', async function (assert) {
      // given
      const scorecard = { area };

      // when
      await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

      // then
      assert.ok(find('.competence-card__wrapper').getAttribute('class').includes('competence-card__wrapper--jaffa'));
    });

    test('should display the area name', async function (assert) {
      // given
      const scorecard = { area: EmberObject.create({ code: 1, title: 'First Area' }) };

      // when
      await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

      // then
      assert.strictEqual(find('.competence-card__area-name').textContent, scorecard.area.title);
    });

    test('should display the competence name', async function (assert) {
      // given
      const scorecard = { area, name: 'First Competence' };

      // when
      await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

      // then
      assert.strictEqual(find('.competence-card__competence-name').textContent, scorecard.name);
    });

    test('should display the level', async function (assert) {
      // given
      const scorecard = { area, level: 3 };

      // when
      await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

      // then
      assert.strictEqual(find('.score-label').textContent, 'niveau');
      assert.strictEqual(find('.score-value').textContent, scorecard.level.toString());
    });

    module('when user can start the competence', function () {
      test('should show the button "Commencer"', async function (assert) {
        // given
        const scorecard = { area, level: 3, isFinished: false, isStarted: false };

        // when
        await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

        // then
        assert.ok(find('.competence-card__button').textContent.includes('Commencer'));
      });
    });

    module('when user can continue the competence', function () {
      test('should show the button "Reprendre"', async function (assert) {
        // given
        const scorecard = { area, level: 3, isFinished: false, isStarted: true };

        // when
        await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

        // then
        assert.ok(find('.competence-card__button').textContent.includes('Reprendre'));
      });

      module('and the user has reached the maximum level', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: false, isStarted: true };

          // when
          await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);
        });

        test('should not show congrats design', function (assert) {
          // then
          assert.dom('.competence-card__congrats').doesNotExist();
        });

        test('should not show congrats message in the footer', function (assert) {
          // then
          assert.dom('.competence-card-footer__congrats-message').doesNotExist();
        });
      });
    });

    module('when user has finished the competence', function () {
      test('should show the improving button when there is no remaining days before improving', async function (assert) {
        // given
        const scorecard = { area, level: 3, isFinished: true, isStarted: false, remainingDaysBeforeImproving: 0 };

        // when
        await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

        // then
        assert.dom('.competence-card__button').exists();
        assert.ok(find('.competence-card__button').textContent.includes('Retenter'));
      });

      test('should call competenceEvaluation service for improving when clicking the improving button', async function (assert) {
        // given
        const userId = 'userId';
        const competenceId = 'recCompetenceId';
        const scorecardId = 'scorecardId';
        const improveStub = sinon.stub();

        class CompetenceEvaluationServiceStub extends Service {
          improve = improveStub;
        }
        class CurrentUserServiceStub extends Service {
          user = { id: userId };
        }
        this.owner.register('service:competenceEvaluation', CompetenceEvaluationServiceStub);
        this.owner.register('service:currentUser', CurrentUserServiceStub);

        const scorecard = {
          area,
          id: scorecardId,
          competenceId,
          level: 3,
          isFinished: true,
          isStarted: false,
          remainingDaysBeforeImproving: 0,
        };
        await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

        // when
        await click('.competence-card__button');

        // then
        sinon.assert.calledWith(improveStub, { userId, competenceId, scorecardId });
        assert.ok(true);
      });

      test('should show the improving countdown when there is some remaining days before improving', async function (assert) {
        // given
        const scorecard = { area, level: 3, isFinished: true, isStarted: false, remainingDaysBeforeImproving: 3 };

        // when
        await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);

        // then
        assert.dom('.competence-card-interactions__improvement-countdown').exists();
        assert.ok(find('.competence-card-interactions__improvement-countdown').textContent.includes('3 jours'));
      });

      module('and the user has reached the maximum level', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const scorecard = { area, isFinishedWithMaxLevel: true };

          // when
          await render(<template><CompetenceCardDefault @scorecard={{scorecard}} /></template>);
        });

        test('should show congrats design', function (assert) {
          // then
          assert.dom('.competence-card__congrats').exists();
        });

        test('should show congrats message in the footer', function (assert) {
          // then
          assert.dom('.competence-card__congrats-message').exists();
        });
      });
    });
  });
});
