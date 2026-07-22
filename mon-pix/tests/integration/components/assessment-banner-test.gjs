import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import AssessmentBanner from 'mon-pix/components/assessment-banner';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { waitForDialog, waitForDialogClose } from '../../helpers/wait-for';

module('Integration | Component | assessment-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class CurrentUserStub extends Service {
      user = { id: 2, isAnonymous: false };
    }

    this.owner.register('service:currentUser', CurrentUserStub);
  });

  test('should not display home link button if not requested', async function (assert) {
    // given & when
    const screen = await render(<template><AssessmentBanner @displayHomeLink={{false}} /></template>);

    // then
    assert.dom(screen.queryByRole('button', { name: 'Quitter' })).doesNotExist();
  });

  module('When home button is requested', function (hooks) {
    let screen, router;

    hooks.beforeEach(async function () {
      // given
      router = this.owner.lookup('service:router');
      sinon.stub(router, 'transitionTo');
      screen = await render(<template><AssessmentBanner @displayHomeLink={{true}} /></template>);
    });

    test('it should display home button', function (assert) {
      // then
      assert.dom(screen.getByRole('button', { name: 'Quitter' })).exists();
      assert.dom(screen.getByText("Besoin d'une pause ?")).isVisible();
    });

    test('it should open modal', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));

      // then
      await waitForDialog();
      assert.dom(screen.getByRole('dialog', { name: "Besoin d'une pause ?" })).exists();
    });

    test('it should close modal on stay button click', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await click(screen.getByText('Rester'));

      // then
      await waitForDialogClose();
      assert.dom(screen.queryByRole('dialog', { name: "Besoin d'une pause ?" })).doesNotExist();
    });

    test('it should redirect to home when quit button is clicked', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await waitForDialog();

      // then
      const link = screen.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" });
      assert.strictEqual(link.getAttribute('href'), '/');
    });
    test('it should redirect to external url without externalId configured on campaign when quit button is clicked', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        customResultPageButtonUrl: 'https://pix.fr/',
      });
      const assessment = store.createRecord('assessment', {
        title: 'Mon titre',
        type: 'CAMPAIGN',
        campaign,
      });
      const campaignParticipation = store.createRecord('campaign-participation', {
        campaignId: campaign.id,
        userId: 2,
      });
      sinon.stub(store, 'queryRecord');
      store.queryRecord
        .withArgs('campaign-participation', {
          campaignId: campaign.id,
          userId: 2,
        })
        .resolves(campaignParticipation);
      screen = await render(
        <template><AssessmentBanner @displayHomeLink={{true}} @assessment={{assessment}} /></template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await waitForDialog();

      // then
      const link = screen.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" });
      assert.strictEqual(link.getAttribute('href'), campaign.customResultPageButtonUrl);
    });

    test('it should redirect to external url with externalId configured on campaign when quit button is clicked', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        customResultPageButtonUrl: 'https://pix.fr/',
      });
      const assessment = store.createRecord('assessment', {
        title: 'Mon titre',
        type: 'CAMPAIGN',
        campaign,
      });
      const campaignParticipation = store.createRecord('campaign-participation', {
        campaignId: campaign.id,
        userId: 2,
        participantExternalId: 1,
      });
      sinon.stub(store, 'queryRecord');
      store.queryRecord
        .withArgs('campaign-participation', {
          campaignId: campaign.id,
          userId: 2,
        })
        .resolves(campaignParticipation);
      screen = await render(
        <template><AssessmentBanner @displayHomeLink={{true}} @assessment={{assessment}} /></template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await waitForDialog();

      // then
      const link = screen.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" });
      assert.strictEqual(link.getAttribute('href'), campaign.customResultPageButtonUrl + '?externalId=1');
    });

    test('it should redirect to internal url configured on campaign when quit button is clicked', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaign = store.createRecord('campaign', {
        customResultPageButtonUrl: '/parcours/CODE',
      });
      const assessment = store.createRecord('assessment', {
        title: 'Mon titre',
        type: 'CAMPAIGN',
        campaign,
      });
      screen = await render(
        <template><AssessmentBanner @displayHomeLink={{true}} @assessment={{assessment}} /></template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await waitForDialog();
      await click(screen.getByRole('button', { name: "Quitter l'épreuve et retourner à la page d'accueil" }));

      // then
      assert.ok(router.transitionTo.calledWith(campaign.customResultPageButtonUrl));
    });
  });

  module('When assessment has a title', function () {
    test('should render the banner with accessible title information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const assessment = store.createRecord('assessment', {
        title: 'Assessment title',
      });

      // when
      const screen = await render(<template><AssessmentBanner @assessment={{assessment}} /></template>);

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

      // when
      const screen = await render(<template><AssessmentBanner @assessment={{assessment}} /></template>);

      // then
      assert.dom(screen.queryByRole('heading', { name: "Épreuve pour l'évaluation :" })).doesNotExist();
    });
  });

  module('when the text to speech feature toggle is enabled', function (hooks) {
    hooks.beforeEach(async function () {
      const featureToggles = this.owner.lookup('service:featureToggles');
      sinon.stub(featureToggles, 'featureToggles').value({ isTextToSpeechButtonEnabled: true });
    });

    module('when displayTextToSpeechActivationButton is true', function () {
      test('it should display text to speech toggle button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.createRecord('assessment', {});
        const toggleTextToSpeech = sinon.stub();

        // when
        const screen = await render(
          <template>
            <AssessmentBanner
              @displayHomeLink={{true}}
              @displayTextToSpeechActivationButton={{true}}
              @isTextToSpeechActivated={{true}}
              @toggleTextToSpeech={{toggleTextToSpeech}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button', { name: 'Désactiver la vocalisation' })).exists();
      });

      module('when the browers speech synthesis is disabled', function () {
        test('it should not display text to speech button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          store.createRecord('assessment', {});
          const toggleTextToSpeech = sinon.stub();
          const speechSynthesis = window.speechSynthesis;
          delete window.speechSynthesis;

          // when
          const screen = await render(
            <template>
              <AssessmentBanner
                @displayHomeLink={{true}}
                @displayTextToSpeechActivationButton={{true}}
                @isTextToSpeechActivated={{true}}
                @toggleTextToSpeech={{toggleTextToSpeech}}
              />
            </template>,
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
        const toggleTextToSpeech = sinon.stub();

        // when
        const screen = await render(
          <template>
            <AssessmentBanner
              @displayHomeLink={{true}}
              @displayTextToSpeechActivationButton={{false}}
              @isTextToSpeechActivated={{true}}
              @toggleTextToSpeech={{toggleTextToSpeech}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByRole('button', { name: 'Désactiver la vocalisation' })).doesNotExist();
      });
    });
  });

  module('when the text to speech feature toggle is disabled', function (hooks) {
    hooks.beforeEach(async function () {
      const featureToggles = this.owner.lookup('service:featureToggles');
      sinon.stub(featureToggles, 'featureToggles').value({ isTextToSpeechButtonEnabled: false });
    });

    test('it should not display text to speech toggle button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      store.createRecord('assessment', {});
      const toggleTextToSpeech = sinon.stub();

      // when
      const screen = await render(
        <template>
          <AssessmentBanner
            @displayHomeLink={{true}}
            @displayTextToSpeechActivationButton={{true}}
            @isTextToSpeechActivated={{true}}
            @toggleTextToSpeech={{toggleTextToSpeech}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Désactiver la vocalisation' })).doesNotExist();
    });
  });
});
