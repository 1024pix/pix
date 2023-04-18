import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | assessment-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should not display home link button if not requested', async function (assert) {
    // given & when
    const screen = await render(hbs`<AssessmentBanner @displayHomeLink={{false}} />`);

    // then
    assert.dom(screen.queryByRole('button', { name: 'Quitter' })).doesNotExist();
  });

  module('When home button is requested', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      screen = await render(hbs`<AssessmentBanner @displayHomeLink={{true}} />`);
    });

    test('it should display home button', function (assert) {
      // then
      assert.dom(screen.queryByRole('button', { name: 'Quitter' })).exists();
      assert.dom(screen.getByText("Besoin d'une pause ?")).isVisible();
    });

    test('it should open modal', async function (assert) {
      // when
      await click(screen.queryByRole('button', { name: 'Quitter' }));

      // then
      assert.notOk(
        screen
          .getByText("Besoin d'une pause ?")
          .closest('.pix-modal__overlay')
          .classList.toString()
          .includes('pix-modal__overlay--hidden')
      );
    });

    test('it should close modal on stay button click', async function (assert) {
      // when
      await click(screen.queryByRole('button', { name: 'Quitter' }));
      await click(screen.getByText('Rester'));

      // then
      assert.ok(
        screen
          .getByText("Besoin d'une pause ?")
          .closest('.pix-modal__overlay')
          .classList.toString()
          .includes('pix-modal__overlay--hidden')
      );
    });
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
