import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | assessment-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should not display home link button if not requested', async function (assert) {
    // given & when
    const screen = await render(hbs`<AssessmentBanner @displayHomeLink={{false}} />`);

    // then
    assert.dom(screen.queryByRole('link', { name: 'Quitter' })).doesNotExist();
  });

  test('should display home link button if requested', async function (assert) {
    // given & when
    const screen = await render(hbs`<AssessmentBanner @displayHomeLink={{true}} />`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Quitter' })).exists();
  });

  module('When assessment has a title', function () {
    test('should render the banner with accessible title information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        title: 'Assessment title',
      });

      this.set('title', assessment.title);

      // when
      const screen = await render(hbs`<AssessmentBanner @title={{this.title}} />`);

      // then
      assert.dom(screen.getByRole('heading', { name: "Épreuve pour l'évaluation : Assessment title" })).exists();
    });
  });

  module("When assessment doesn't have a title", function () {
    test('should not render the banner with title', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        title: null,
      });

      this.set('title', assessment.title);

      // when
      const screen = await render(hbs`<AssessmentBanner @title={{this.title}} />`);

      // then
      assert.dom(screen.queryByRole('heading', { name: "Épreuve pour l'évaluation :" })).doesNotExist();
    });
  });
});
