import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click, fillIn } from '@ember/test-helpers';

module('Integration | Component | Module | QROCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a QROCM', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qrocm = store.createRecord('qrocm', {
      instruction: 'Mon instruction',
      proposals: [
        { content: '<p>Ma première proposition</p>', type: 'text' },
        {
          input: 'symbole',
          inputType: 'text',
          display: 'inline',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          defaultValue: '',
          type: 'input',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'select-aria',
          defaultValue: '',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocms',
    });
    this.set('qrocm', qrocm);
    const screen = await render(hbs`
        <Module::Qrocm @qrocm={{this.qrocm}} />`);

    // then
    assert.ok(screen);
    assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.getByRole('textbox', { name: 'input-aria' }));
    assert.dom(screen.getByText("l'identifiant")).exists({ count: 1 });
    assert.dom(screen.getByText("le fournisseur d'adresse mail")).exists({ count: 1 });
    assert.ok(screen.getByText('select-aria', { selector: 'label' }));
  });

  test('should be able to select an option', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qrocm = store.createRecord('qrocm', {
      instruction: 'Instruction',
      proposals: [
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'select-aria',
          defaultValue: '',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocms',
    });
    this.set('qrocm', qrocm);
    const screen = await render(hbs`
        <Module::Qrocm @qrocm={{this.qrocm}} />`);

    // when
    await clickByName('select-aria');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'select-aria' })).hasText("le fournisseur d'adresse mail");
    assert.ok(screen.getByRole('button', { name: 'Vérifier' }));
  });

  test('should display an error message if QROCM is validated without response', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qrocm = store.createRecord('qrocm', {
      instruction: 'Instruction',
      proposals: [
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'select-aria',
          defaultValue: '',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocms',
    });
    this.set('qrocm', qrocm);
    const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
  });

  test('should hide the error message when QROCM is validated with response', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qrocm = store.createRecord('qrocm', {
      instruction: 'Instruction',
      proposals: [
        {
          input: 'symbole',
          type: 'input',
          inputType: 'text',
          size: 1,
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 1',
          defaultValue: '',
        },
      ],
      type: 'qrocms',
    });
    const givenSubmitAnswerStub = function () {};
    this.set('submitAnswer', givenSubmitAnswerStub);
    this.set('qrocm', qrocm);
    const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));
    await fillIn(screen.getByLabelText('Réponse 1'), 'ANSWER');
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert
      .dom(screen.queryByRole('alert', { name: 'Pour valider, veuillez remplir tous les champs réponse.' }))
      .doesNotExist();
  });
});
