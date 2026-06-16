import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreateOrUpdateTrainingForm from 'pix-admin/components/trainings/create-or-update-training-form';
import { deliveryModeCategories, localeCategories, typeCategories } from 'pix-admin/models/training';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | trainings | CreateOrUpdateTrainingForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  const onSubmit = sinon.stub();
  const onCancel = sinon.stub();

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    store.createRecord('module-metadata', {
      title: 'Faire un clic droit',
      link: '/modules/r2d2droi/clic-droit',
      duration: 30,
    });
    store.createRecord('module-metadata', {
      title: 'Utiliser un LLM',
      link: '/modules/k2000tro/use-llm',
      duration: 10,
    });
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(
      <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.trainings.training.details.title'))).exists();
    assert.dom(screen.getByLabelText(t('pages.trainings.training.details.internalTitle'))).exists();
    assert.dom(screen.getByLabelText('Format')).exists();
    assert.dom(screen.getByLabelText('Jours (JJ)')).exists();
    assert.dom(screen.getByLabelText('Heures (HH)')).exists();
    assert.dom(screen.getByLabelText('Minutes (MM)')).exists();
    assert.dom(screen.getByLabelText('Locales')).exists();
    assert
      .dom(
        screen.getByRole('textbox', {
          name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
        }),
      )
      .exists();
    assert.dom(screen.queryByLabelText('Mettre en pause')).doesNotExist();
    assert
      .dom(
        screen.getByLabelText(
          "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
        ),
      )
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le contenu formatif' })).exists();
    assert
      .dom(screen.getByRole('link', { name: 'Voir la liste des logos éditeur' }))
      .hasAttribute('href', 'https://example-assets.net/list/contenu-formatif/editeur');
    assert
      .dom(screen.getByLabelText(t('pages.trainings.training.form.recommendation-engine.delivery-mode.label')))
      .exists();
    assert
      .dom(
        screen.getByRole('radiogroup', {
          name: t('pages.trainings.training.form.recommendation-engine.registration-required.label'),
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('textbox', {
          name: t('pages.trainings.training.form.recommendation-engine.description.label'),
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.trainings.training.form.recommendation-engine.objectives.label')),
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('textbox', { name: t('pages.trainings.training.form.recommendation-engine.program.label') }),
      )
      .exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
    // when
    await render(<template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>);

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(<template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>);

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });

  module('when model is provided', function () {
    test('it should display the items with model values', async function (assert) {
      // given
      const model = {
        title: 'Un contenu formatif',
        internalTitle: 'Mon titre interne',
        link: 'https://un-contenu-formatif',
        type: 'webinaire',
        locales: ['fr-fr'],
        editorName: 'Un éditeur de contenu formatif',
        editorLogoUrl: `http://localhost:4202/logo-placeholder.png`,
        duration: { days: 0, hours: 0, minutes: 0 },
        isDisabled: false,
        deliveryMode: 'hybrid',
        registrationRequired: false,
        description: 'Une description',
        objectives: 'Objectif 1;Objectif 2',
        program: 'Un programme détaillé',
      };

      // when
      const screen = await render(
        <template>
          <CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} @model={{model}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText(t('pages.trainings.training.details.title'))).hasValue(model.title);
      assert
        .dom(screen.getByLabelText(t('pages.trainings.training.details.internalTitle')))
        .hasValue(model.internalTitle);
      assert.dom(screen.getByLabelText('Lien')).hasValue(model.link);
      assert.strictEqual(screen.getByLabelText('Format').innerText, typeCategories[model.type]);
      assert.dom(screen.getByLabelText('Jours (JJ)')).hasValue(model.duration.days.toString());
      assert.dom(screen.getByLabelText('Heures (HH)')).hasValue(model.duration.hours.toString());
      assert.dom(screen.getByLabelText('Minutes (MM)')).hasValue(model.duration.minutes.toString());
      assert.strictEqual(screen.getByLabelText('Locales').innerText, localeCategories[model.locales[0]]);

      assert
        .dom(
          screen.getByRole('textbox', {
            name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
          }),
        )
        .hasValue(model.editorLogoUrl);
      assert.strictEqual(screen.getByLabelText('Mettre en pause').checked, model.isDisabled);
      assert
        .dom(
          screen.getByLabelText(
            "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
          ),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier le contenu formatif' })).exists();
      assert.strictEqual(
        screen.getByLabelText(t('pages.trainings.training.form.recommendation-engine.delivery-mode.label')).innerText,
        deliveryModeCategories[model.deliveryMode],
      );
      assert
        .dom(
          screen.getByRole('textbox', {
            name: t('pages.trainings.training.form.recommendation-engine.description.label'),
          }),
        )
        .hasValue(model.description);
      assert
        .dom(
          screen.getByRole('textbox', {
            name: new RegExp(t('pages.trainings.training.form.recommendation-engine.objectives.label')),
          }),
        )
        .hasValue('Objectif 1;\nObjectif 2');
      assert
        .dom(
          screen.getByRole('textbox', { name: t('pages.trainings.training.form.recommendation-engine.program.label') }),
        )
        .hasValue(model.program);
    });
  });

  module('Form interactions', function () {
    test('should update form fields when user types', async function (assert) {
      // given
      const onSubmitStub = sinon.stub();
      await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmitStub}} @onCancel={{onCancel}} /></template>,
      );

      // when
      await fillByLabel(t('pages.trainings.training.details.title'), 'New Title');
      await triggerEvent('form', 'submit');

      // then
      assert.ok(onSubmitStub.called);
      const submittedData = onSubmitStub.getCall(0).firstArg;
      assert.strictEqual(submittedData.title, 'New Title');
    });

    test('should save editor logo URL on form submission', async function (assert) {
      // given
      const onSubmitStub = sinon.stub();
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmitStub}} @onCancel={{onCancel}} /></template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
        }),
        'https://assets.pix.org/contenu-formatif/editeur/new-logo.svg',
      );
      await triggerEvent('form', 'submit');

      // then
      assert.ok(onSubmitStub.called);
      const submittedData = onSubmitStub.getCall(0).firstArg;
      assert.strictEqual(submittedData.editorLogoUrl, 'https://assets.pix.org/contenu-formatif/editeur/new-logo.svg');
    });

    test('should save description on form submission', async function (assert) {
      // given
      const onSubmitStub = sinon.stub();
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmitStub}} @onCancel={{onCancel}} /></template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: t('pages.trainings.training.form.recommendation-engine.description.label'),
        }),
        'Ma description',
      );
      await triggerEvent('form', 'submit');

      // then
      sinon.assert.calledOnceWith(onSubmitStub, sinon.match({ description: 'Ma description' }));
      assert.ok(true);
    });

    test('should toggle registrationRequired when segmented control is clicked', async function (assert) {
      // given
      const onSubmitStub = sinon.stub();
      await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmitStub}} @onCancel={{onCancel}} /></template>,
      );

      // when
      await clickByName(t('common.words.yes'));
      await triggerEvent('form', 'submit');

      // then
      sinon.assert.calledOnceWith(onSubmitStub, sinon.match({ registrationRequired: true }));
      assert.ok(true);
    });

    test('should toggle isDisabled field when checkbox is clicked', async function (assert) {
      // given
      const model = {
        title: 'Un contenu formatif',
        internalTitle: 'Mon titre interne',
        link: 'https://un-contenu-formatif',
        type: 'webinaire',
        locales: ['fr-fr'],
        editorName: 'Un éditeur de contenu formatif',
        editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        duration: { days: 0, hours: 0, minutes: 0 },
        isDisabled: false,
      };
      const onSubmitStub = sinon.stub();
      const screen = await render(
        <template>
          <CreateOrUpdateTrainingForm @onSubmit={{onSubmitStub}} @onCancel={{onCancel}} @model={{model}} />
        </template>,
      );

      // when
      await click(screen.getByLabelText('Mettre en pause'));
      await triggerEvent('form', 'submit');

      // then
      assert.ok(onSubmitStub.called);
      const submittedData = onSubmitStub.getCall(0).firstArg;
      assert.true(submittedData.isDisabled);
    });
  });

  module('when provided type is modulix', function () {
    test('it should display the link selector', async function (assert) {
      // given
      // when
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
      );

      await click(screen.getByRole('button', { name: 'Format' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Module Pix' }));

      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Lien' })).doesNotExist();
      assert.dom(screen.getByRole('button', { name: 'Module' })).exists();
    });

    test('it should auto fill the editor logo url', async function (assert) {
      // given
      // when
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
      );

      await click(screen.getByRole('button', { name: 'Format' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Module Pix' }));

      // then
      assert
        .dom(
          screen.getByRole('textbox', {
            name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
          }),
        )
        .hasValue('https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg');
    });

    module('when editor logo url was already provided', function () {
      test('it should not auto fill the editor logo url', async function (assert) {
        // given
        const editorLogoUrlValue = 'https://assets.pix.org/contenu-formatif/editeur/hello.svg';

        // when
        const screen = await render(
          <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
        );
        const editorLogoUrl = screen.getByRole('textbox', {
          name: "Url du logo de l'éditeur (.svg) Exemple : https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg",
        });

        await fillIn(editorLogoUrl, editorLogoUrlValue);
        await click(screen.getByRole('button', { name: 'Format' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Module Pix' }));

        // then
        assert.dom(editorLogoUrl).hasValue(editorLogoUrlValue);
      });
    });

    test('it should auto fill the editor name', async function (assert) {
      // given
      // when
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
      );

      await click(screen.getByRole('button', { name: 'Format' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Module Pix' }));

      // then
      assert
        .dom(
          screen.getByLabelText(
            "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
          ),
        )
        .hasValue('Pix');
    });

    module('when editor name was already provided', function () {
      test('it should not auto fill the editor name', async function (assert) {
        // given
        const editorNameValue = 'Super éditeur !';

        // when
        const screen = await render(
          <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
        );
        const editorNameInput = screen.getByLabelText(
          "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
        );

        await fillIn(editorNameInput, editorNameValue);
        await click(screen.getByRole('button', { name: 'Format' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Module Pix' }));

        // then
        assert.dom(editorNameInput).hasValue(editorNameValue);
      });
    });

    test('it should auto fill the duration', async function (assert) {
      // given
      // when
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
      );

      await click(screen.getByRole('button', { name: 'Format' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Module Pix' }));
      await click(screen.getByRole('button', { name: 'Module' }));
      await screen.findByRole('listbox');
      await click(await screen.findByRole('option', { name: 'Utiliser un LLM' }));

      // then
      assert.dom(screen.getByRole('spinbutton', { name: 'Minutes (MM)' })).hasValue('10');
    });

    module('when model is provided', function () {
      test('it should display correct module on editing form', async function (assert) {
        // given & when
        const model = {
          title: 'Un contenu formatif',
          internalTitle: 'Mon titre interne',
          link: '/modules/k2000tro/use-llm',
          type: 'modulix',
          duration: { days: 0, hours: 0, minutes: 0 },
          locales: ['fr-fr'],
          editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
          editorName: 'Pix',
          isDisabled: false,
        };

        // when
        const screen = await render(
          <template>
            <CreateOrUpdateTrainingForm @model={{model}} @onSubmit={{onSubmit}} @onCancel={{onCancel}} />
          </template>,
        );

        // then
        const moduleButton = await screen.findByRole('button', { name: 'Module' });
        assert.dom(within(moduleButton).getByText('Utiliser un LLM')).exists();
      });
    });
  });

  module('when type provided is not modulix', function () {
    test('it should display the link field', async function (assert) {
      // given & when
      const screen = await render(
        <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
      );

      await click(screen.getByRole('button', { name: 'Format' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Webinaire' }));

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Lien' })).exists();
    });
  });
});
