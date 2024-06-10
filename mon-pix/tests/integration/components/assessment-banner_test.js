import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

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
          .includes('pix-modal__overlay--hidden'),
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
          .includes('pix-modal__overlay--hidden'),
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

  module('when the text to speech feature toggle is enabled', function (hooks) {
    hooks.beforeEach(async function () {
      this.owner.lookup('service:store');
      class FeatureTogglesStub extends Service {
        featureToggles = { isTextToSpeechButtonEnabled: true };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
    });

    module('when displayTextToSpeechActivationButton is true', function () {
      test('it should display text to speech toggle button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.createRecord('assessment', {});
        this.set('toggleTextToSpeech', sinon.stub());

        // when
        const screen = await render(
          hbs`<AssessmentBanner @displayHomeLink={{true}} @displayTextToSpeechActivationButton={{true}} @isTextToSpeechActivated={{true}} @toggleTextToSpeech={{this.toggleTextToSpeech}}/>`,
        );

        // then
        assert.dom(screen.getByRole('button', { name: 'Désactiver la vocalisation' })).exists();
      });

      module('when the browers speech synthesis is disabled', function () {
        test('it should not display text to speech button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          store.createRecord('assessment', {});
          this.set('toggleTextToSpeech', sinon.stub());
          const speechSynthesis = window.speechSynthesis;
          delete window.speechSynthesis;

          // when
          const screen = await render(
            hbs`<AssessmentBanner @displayHomeLink={{true}} @displayTextToSpeechActivationButton={{true}} @isTextToSpeechActivated={{true}} @toggleTextToSpeech={{this.toggleTextToSpeech}}/>`,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Désactiver la vocalisation' })).doesNotExist();

          window.speechSynthesis = speechSynthesis;
        });
      });
    });

    module('when displayTextToSpeechActivationButton is false', function () {
      test('it should not display text to speech toggle button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.createRecord('assessment', {});
        this.set('toggleTextToSpeech', sinon.stub());

        // when
        const screen = await render(
          hbs`<AssessmentBanner @displayHomeLink={{true}} @displayTextToSpeechActivationButton={{false}} @isTextToSpeechActivated={{true}} @toggleTextToSpeech={{this.toggleTextToSpeech}}/>`,
        );

        // then
        assert.dom(screen.queryByRole('button', { name: 'Désactiver la vocalisation' })).doesNotExist();
      });
    });
  });

  module('when the text to speech feature toggle is disabled', function (hooks) {
    hooks.beforeEach(async function () {
      this.owner.lookup('service:store');
      class FeatureTogglesStub extends Service {
        featureToggles = { isTextToSpeechButtonEnabled: false };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
    });

    test('it should not display text to speech toggle button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      store.createRecord('assessment', {});
      this.set('toggleTextToSpeech', sinon.stub());

      // when
      const screen = await render(
        hbs`<AssessmentBanner @displayHomeLink={{true}} @displayTextToSpeechActivationButton={{true}} @isTextToSpeechActivated={{true}} @toggleTextToSpeech={{this.toggleTextToSpeech}}/>`,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Désactiver la vocalisation' })).doesNotExist();
    });
  });
});
