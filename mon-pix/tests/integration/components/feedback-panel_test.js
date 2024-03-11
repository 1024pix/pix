import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | feedback-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  class StoreStub extends Service {
    createRecord() {
      return Object.create({
        save() {
          return resolve();
        },
      });
    }
  }

  module('Default rendering', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
    });

    test('should not display the feedback form', async function (assert) {
      // given & when
      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);

      // then
      assert
        .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .doesNotExist();
    });

    module('when clicking on send button', function (hooks) {
      let screen;

      hooks.beforeEach(async function () {
        screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);

        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
          }),
        );
      });

      test('should display a confirmation modal', async function (assert) {
        // given
        const modalTitle = screen.getByText('Confirmation du signalement');

        // when
        await click(screen.getByRole('button', { name: 'Envoyer mon message de signalement' }));

        // then
        assert.notOk(
          modalTitle.closest('.pix-modal__overlay').classList.toString().includes('pix-modal__overlay--hidden'),
        );
      });

      test('should be able to close the modal', async function (assert) {
        // given
        const modalTitle = screen.getByText('Confirmation du signalement');

        // when
        await click(screen.getByRole('button', { name: 'Envoyer mon message de signalement' }));
        await click(screen.getByText(this.intl.t('common.actions.cancel')));

        // then
        assert.ok(
          modalTitle.closest('.pix-modal__overlay').classList.toString().includes('pix-modal__overlay--hidden'),
        );
      });

      test('should display the "mercix" view without content value', async function (assert) {
        // when
        await click(
          screen.getByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.actions.submit-aria-label'),
          }),
        );
        await click(screen.getByText(this.intl.t('common.actions.validate')));

        // then
        assert.dom(screen.getByText('Votre commentaire a bien été transmis à l’équipe du projet Pix.')).exists();
        assert.dom(screen.getByText('Mercix !')).exists();
      });

      test('should display the "mercix" view when content value is filled', async function (assert) {
        // given
        await click(
          screen.getByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
          }),
        );
        const contentValue = 'Prêtes-moi ta plume, pour écrire un mot';
        await fillIn(
          screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }),
          contentValue,
        );

        // when
        await click(screen.getByRole('button', { name: 'Envoyer mon message de signalement' }));
        await click(screen.getByText(this.intl.t('common.actions.validate')));

        // then
        assert
          .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
          .doesNotExist();
        assert.dom(screen.getByText('Votre commentaire a bien été transmis à l’équipe du projet Pix.')).exists();
        assert.dom(screen.getByText('Mercix !')).exists();
      });
    });

    module('when selecting a category', function () {
      test('should display a second dropdown with the list of questions when category have a nested level', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.question'),
          }),
        );

        // then
        const textareaLabel = screen.queryByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.queryByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).doesNotExist();
        assert.dom(submitButtonLabel).doesNotExist();

        assert.dom(screen.getByText('Je ne comprends pas la question')).exists();
        assert.dom(screen.getByText('Je souhaite proposer une amélioration de la question')).exists();
      });

      test('should directly display the message box and the submit button when category has a textarea', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
          }),
        );
        await click(
          screen.getByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
          }),
        );

        // then
        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should directly display the tuto without the textbox or the send button when category has a tutorial', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.picture'),
          }),
        );

        // then
        const textareaLabel = screen.queryByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.queryByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).doesNotExist();
        assert.dom(submitButtonLabel).doesNotExist();

        assert.dom(screen.getByText("L'image ne s'affiche pas")).exists();
        assert.dom(screen.getByText("L'image a un autre problème")).exists();
      });

      test('should show the correct feedback action when selecting two different categories', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        // when

        await click(await screen.findByRole('button', { name: "J'ai un problème avec" }));

        await click(
          await screen.findByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
          }),
        );

        await click(await screen.findByRole('button', { name: 'Ajouter un commentaire' }));

        // then
        assert.dom(screen.queryByText('Votre connexion internet est peut-être trop faible.')).doesNotExist();

        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should hide the second dropdown when category has fewer levels after a deeper category', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        // when
        await click(await screen.findByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');

        await click(
          await screen.findByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.question'),
          }),
        );

        await click(
          await screen.findByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.aria-secondary'),
          }),
        );

        await click(
          await screen.findByRole('option', {
            name: this.intl.t(
              'pages.challenge.feedback-panel.form.fields.detail-selection.options.question-improvement',
            ),
          }),
        );

        await click(
          await screen.findByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
          }),
        );

        // then
        assert.dom(screen.queryByText('Votre connexion internet est peut-être trop faible.')).doesNotExist();

        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should display tutorial with textarea with selecting related category and subcategory', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`,
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

        // when
        await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.embed'),
          }),
        );
        await click(screen.getByRole('button', { name: 'Sélectionner une option pour préciser votre problème' }));
        await click(
          await screen.findByRole('option', {
            name: this.intl.t(
              'pages.challenge.feedback-panel.form.fields.detail-selection.options.embed-displayed-on-mobile-devices-with-problems.label',
            ),
          }),
        );
        await click(
          screen.getByRole('button', {
            name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
          }),
        );

        // then
        assert
          .dom(
            screen.getByText(
              'Nous faisons notre possible pour que les simulateurs fonctionnent sur tous les appareils, tous les OS et tous les navigateurs mais il se peut que vous utilisiez un système particulier.' +
                "Précisez votre problème en indiquant votre type d'appareil (smartphone, tablette...), votre système d'exploitation et votre navigateur.",
            ),
          )
          .exists();
        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer mon message de signalement' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });
    });
  });

  module('When assessment is not of type certification', function () {
    test('should display the feedback panel', async function (assert) {
      // given & when
      const screen = await render(hbs`<FeedbackPanel />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Signaler un problème avec la question' })).exists();
    });

    test('should toggle the form view when clicking on the toggle link', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(screen.getByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .exists();

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .doesNotExist();
    });
  });

  module('When assessment is of type certification', function () {
    test('should display the feedback certification section', async function (assert) {
      // given
      const assessment = {
        isCertification: true,
      };
      this.set('assessment', assessment);

      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @context={{this.context}} />`);

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(
          screen.getByText(
            'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :',
          ),
        )
        .exists();
    });
  });

  module('When FeedbackPanel is rendered initially opened (e.g. in a comparison-window)', function () {
    test('should display the "form" view', async function (assert) {
      // given
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);
      this.set('alwaysOpenForm', true);

      // when
      const screen = await render(
        hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`,
      );

      // then
      const selectInputLabel = screen.getByRole('button', {
        name: "J'ai un problème avec",
      });
      assert.dom(selectInputLabel).exists();
    });

    test('should not be able to hide the form view', async function (assert) {
      // given
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);
      this.set('alwaysOpenForm', true);

      // when
      const screen = await render(
        hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`,
      );

      // then
      assert.true(screen.getByRole('button', { name: 'Signaler un problème avec la question' }).disabled);
      assert
        .dom(screen.getByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .exists();
    });
  });

  module('When FeedbackPanel is rendered initially closed (e.g. in a challenge)', function (hooks) {
    hooks.beforeEach(async function () {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);
    });

    test('should display the "form" view', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(screen.getByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .exists();
    });

    test('should be able to hide the form view', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert
        .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .doesNotExist();
    });
  });

  module('Error management', function () {
    test('should not display error if "form" view (with error) was closed and re-opened', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      await click(screen.getByRole('button', { name: "J'ai un problème avec" }));
      await screen.findByRole('listbox');
      await click(
        screen.getByRole('option', {
          name: this.intl.t('pages.challenge.feedback-panel.form.fields.category-selection.options.accessibility'),
        }),
      );
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.challenge.feedback-panel.form.fields.detail-selection.add-comment'),
        }),
      );

      await fillIn(screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }), '    ');

      await click(screen.getByRole('button', { name: 'Envoyer mon message de signalement' }));

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
      await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

      // then
      assert.dom(screen.queryByText('Vous devez saisir un message.')).doesNotExist();
    });
  });
});
