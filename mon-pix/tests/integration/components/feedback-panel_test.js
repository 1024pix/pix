import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, fillIn } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

const PICK_SELECT_OPTION_WITH_NESTED_LEVEL = 'question';
const PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL = 'embed';
const PICK_SELECT_OPTION_WITH_TEXTAREA = 'accessibility';
const PICK_SELECT_OPTION_WITH_TUTORIAL = 'picture';
const PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL = '3';

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

    test('should display the "mercix" view when clicking on send button', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);

      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      await fillIn(
        screen.getByRole('combobox', { name: 'Sélectionner la catégorie du problème rencontré' }),
        PICK_SELECT_OPTION_WITH_TEXTAREA
      );

      const contentValue = 'Prêtes-moi ta plume, pour écrire un mot';
      await fillIn(screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }), contentValue);

      // when
      await click(screen.getByRole('button', { name: 'Envoyer' }));

      // then
      assert
        .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .doesNotExist();
      assert.dom(screen.getByText('Votre commentaire a bien été transmis à l’équipe du projet Pix.')).exists();
      assert.dom(screen.getByText('Mercix !')).exists();
    });

    module('when selecting a category', function () {
      test('should display a second dropdown with the list of questions when category have a nested level', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        await fillIn(
          screen.getByRole('combobox', { name: 'Sélectionner la catégorie du problème rencontré' }),
          PICK_SELECT_OPTION_WITH_NESTED_LEVEL
        );

        // then
        const textareaLabel = screen.queryByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.queryByRole('button', { name: 'Envoyer' });
        assert.dom(textareaLabel).doesNotExist();
        assert.dom(submitButtonLabel).doesNotExist();

        assert.dom(screen.getByRole('option', { name: 'Je ne comprends pas la question' })).exists();
        assert
          .dom(screen.getByRole('option', { name: 'Je souhaite proposer une amélioration de la question' }))
          .exists();
      });

      test('should directly display the message box and the submit button when category has a textarea', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        await fillIn(
          screen.getByRole('combobox', { name: 'Sélectionner la catégorie du problème rencontré' }),
          PICK_SELECT_OPTION_WITH_TEXTAREA
        );

        // then
        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should directly display the tuto without the textbox or the send button when category has a tutorial', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        await fillIn(
          screen.getByRole('combobox', { name: 'Sélectionner la catégorie du problème rencontré' }),
          PICK_SELECT_OPTION_WITH_TUTORIAL
        );

        // then
        const textareaLabel = screen.queryByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.queryByRole('button', { name: 'Envoyer' });
        assert.dom(textareaLabel).doesNotExist();
        assert.dom(submitButtonLabel).doesNotExist();

        assert.dom(screen.getByRole('option', { name: "L'image ne s'affiche pas" })).exists();
        assert.dom(screen.getByRole('option', { name: "L'image a un autre problème" })).exists();
      });

      test('should show the correct feedback action when selecting two different categories', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        // when
        const selectInputLabel = screen.getByRole('combobox', {
          name: 'Sélectionner la catégorie du problème rencontré',
        });
        await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TUTORIAL);
        await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        assert.dom(screen.queryByText('Votre connexion internet est peut-être trop faible.')).doesNotExist();

        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should hide the second dropdown when category has fewer levels after a deeper category', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        // when
        const selectInputLabel = screen.getByRole('combobox', {
          name: 'Sélectionner la catégorie du problème rencontré',
        });
        await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_NESTED_LEVEL);
        await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        assert.dom(screen.queryByText('Votre connexion internet est peut-être trop faible.')).doesNotExist();

        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer' });
        assert.dom(textareaLabel).exists();
        assert.dom(submitButtonLabel).exists();
      });

      test('should display tutorial with textarea with selecting related category and subcategory', async function (assert) {
        // given
        const screen = await render(
          hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`
        );
        await click(screen.getByRole('button', { name: 'Signaler un problème' }));

        // when
        const firstSelectInputLabel = screen.getByRole('combobox', {
          name: 'Sélectionner la catégorie du problème rencontré',
        });
        await fillIn(firstSelectInputLabel, PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL);

        const secondSelectInputLabel = screen.getByRole('combobox', {
          name: 'Sélectionner une option pour préciser votre problème',
        });
        await fillIn(secondSelectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL);

        // then
        assert
          .dom(
            screen.getByText(
              'Nous faisons notre possible pour que les simulateurs fonctionnent sur tous les appareils, tous les OS et tous les navigateurs mais il se peut que vous utilisiez un système particulier.' +
                "Précisez votre problème en indiquant votre type d'appareil (smartphone, tablette...), votre système d'exploitation et votre navigateur."
            )
          )
          .exists();

        const textareaLabel = screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' });
        const submitButtonLabel = screen.getByRole('button', { name: 'Envoyer' });
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
      assert.dom(screen.getByRole('button', { name: 'Signaler un problème' })).exists();
    });

    test('should toggle the form view when clicking on the toggle link', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // then
      assert
        .dom(screen.getByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .exists();

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

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
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // then
      assert
        .dom(
          screen.getByText(
            'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :'
          )
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
        hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`
      );

      // then
      const selectInputLabel = screen.getByRole('combobox', {
        name: 'Sélectionner la catégorie du problème rencontré',
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
        hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`
      );

      // then
      assert.true(screen.getByRole('button', { name: 'Signaler un problème' }).disabled);
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
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // then
      assert
        .dom(screen.getByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .exists();
    });

    test('should be able to hide the form view', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // then
      assert
        .dom(screen.queryByText('Pix est à l’écoute de vos remarques pour améliorer les épreuves proposées !*'))
        .doesNotExist();
    });
  });

  module('Error management', function () {
    test('should display error if "content" is empty', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      const selectInputLabel = screen.getByRole('combobox', {
        name: 'Sélectionner la catégorie du problème rencontré',
      });
      await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA);

      // when
      await click(screen.getByRole('button', { name: 'Envoyer' }));

      // then
      assert.dom(screen.getByText('Vous devez saisir un message.')).exists();
    });

    test('should display error if "content" is blank', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      const selectInputLabel = screen.getByRole('combobox', {
        name: 'Sélectionner la catégorie du problème rencontré',
      });
      await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA);

      await fillIn(screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }), '');

      // when
      await click(screen.getByRole('button', { name: 'Envoyer' }));

      // then
      assert.dom(screen.getByText('Vous devez saisir un message.')).exists();
    });

    test('should not display error if "form" view (with error) was closed and re-opened', async function (assert) {
      // given
      const screen = await render(hbs`<FeedbackPanel />`);
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      const selectInputLabel = screen.getByRole('combobox', {
        name: 'Sélectionner la catégorie du problème rencontré',
      });
      await fillIn(selectInputLabel, PICK_SELECT_OPTION_WITH_TEXTAREA);

      await fillIn(screen.getByRole('textbox', { name: 'Décrivez votre problème ou votre suggestion' }), '    ');

      await click(screen.getByRole('button', { name: 'Envoyer' }));

      // when
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));
      await click(screen.getByRole('button', { name: 'Signaler un problème' }));

      // then
      assert.dom(screen.queryByText('Vous devez saisir un message.')).doesNotExist();
    });
  });
});
