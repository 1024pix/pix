import { click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Error & Not found pages', function (hooks) {
  setupApplicationTest(hooks);

  module('Error page', function () {
    test('should display error pages', async function (assert) {
      identifyLearner(this.owner);
      // when
      const screen = await visit(`/assessments/14/challenges`);
      // then
      assert.dom(screen.getByText(this.intl.t('pages.error.message'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.error.backHome'))).exists();
    });

    module('when learner is identified', function () {
      test('should redirect to the missions list', async function (assert) {
        identifyLearner(this.owner);
        // when
        const screen = await visit(`/assessments/14/challenges`);
        await click(screen.getByRole('button', { name: this.intl.t('pages.error.backHome') }));
        // then
        assert.strictEqual(currentURL(), '/');
      });
    });
    module('when learner is not identified', function () {
      test('should redirect to the organization code', async function (assert) {
        // when
        const screen = await visit(`/assessments/14/challenges`);
        await click(screen.getByRole('button', { name: this.intl.t('pages.error.backHome') }));
        // then
        assert.strictEqual(currentURL(), '/organization-code');
      });
    });
  });

  module('Not found page', function () {
    test('should display not found pages', async function (assert) {
      identifyLearner(this.owner);
      // when
      const screen = await visit(`/schools`);
      // then
      assert.dom(screen.getByText(this.intl.t('pages.not-found.message'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.not-found.backHome'))).exists();
    });

    module('when learner is identified', function () {
      test('should redirect to the missions list', async function (assert) {
        identifyLearner(this.owner);
        // when
        const screen = await visit(`/schools`);
        await click(screen.getByRole('button', { name: this.intl.t('pages.not-found.backHome') }));
        // then
        assert.strictEqual(currentURL(), '/');
      });
    });

    module('when learner is not identified', function () {
      test('should redirect to the organization code', async function (assert) {
        // when
        const screen = await visit(`/schools`);
        await click(screen.getByRole('button', { name: this.intl.t('pages.not-found.backHome') }));
        // then
        assert.strictEqual(currentURL(), '/organization-code');
      });
    });
  });
});
