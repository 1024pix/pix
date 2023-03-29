import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | assessment-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`{{assessment-banner}}`);
    assert.dom('.assessment-banner').exists();
  });

  test('should not display home link button if not requested', async function (assert) {
    this.set('assessmentTitle', 'My assessment');
    await render(hbs`{{assessment-banner title=this.assessmentTitle}}`);
    assert.dom('.assessment-banner__home-link').doesNotExist();
  });

  test('should display home link button if requested', async function (assert) {
    this.set('assessmentTitle', 'My assessment');
    await render(hbs`{{assessment-banner title=this.assessmentTitle displayHomeLink=true}}`);
    assert.dom('.assessment-banner__home-link').exists();
  });

  module('When assessment has a title', function (hooks) {
    hooks.beforeEach(async function () {
      this.set('assessmentTitle', 'My assessment');
      await render(hbs`{{assessment-banner title=this.assessmentTitle}}`);
    });

    test('should render the banner with accessible title information', function (assert) {
      const title = find('.assessment-banner__title');
      assert.ok(title);
      assert.strictEqual(title.childNodes.length, 2);
      const a11yText = title.firstChild.textContent;
      assert.strictEqual(a11yText, "Épreuve pour l'évaluation : ");
    });

    test('should render the banner with a title', function (assert) {
      const title = find('.assessment-banner__title');
      assert.ok(title);
      assert.strictEqual(title.childNodes.length, 2);
      const assessmentName = title.lastChild.textContent;
      assert.strictEqual(assessmentName, 'My assessment');
    });

    test('should render the banner with a splitter', function (assert) {
      assert.dom('.assessment-banner__splitter').exists();
    });
  });

  module("When assessment doesn't have a title", function (hooks) {
    hooks.beforeEach(async function () {
      this.set('assessmentTitle', null);
      await render(hbs`{{assessment-banner title=this.assessmentTitle}}`);
    });

    test('should not render the banner with a title', function (assert) {
      assert.dom('.assessment-banner__title').doesNotExist();
    });

    test('should not render the banner with a splitter', function (assert) {
      assert.dom('.assessment-banner__splitter').doesNotExist();
    });
  });
});
