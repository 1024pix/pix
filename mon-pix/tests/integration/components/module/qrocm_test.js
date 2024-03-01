import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | Module | QROCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a QROCM', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
      type: 'qrocm',
    };
    this.set('qrocm', qrocm);
    const screen = await render(hbs`
        <Module::Qrocm @qrocm={{this.qrocm}} />`);

    // then
    assert.ok(screen);
    assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
    assert.ok(
      screen.getByRole('group', {
        legend: this.intl.t('pages.modulix.qrocm.direction', { count: qrocm.proposals.length }),
      }),
    );
    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.getByRole('textbox', { name: 'input-aria' }));
    assert.dom(screen.getByText("l'identifiant")).exists({ count: 1 });
    assert.dom(screen.getByText("le fournisseur d'adresse mail")).exists({ count: 1 });
    assert.ok(screen.getByText('select-aria', { selector: 'label' }));
  });

  test('should be able to select an option', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
      type: 'qrocm',
    };
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
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
      type: 'qrocm',
    };
    this.set('qrocm', qrocm);
    const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
  });

  test('should hide the error message when QROCM is validated with response', async function (assert) {
    // given
    const qrocm = {
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
      type: 'qrocm',
    };
    const givenSubmitAnswerStub = function () {};
    this.set('submitAnswer', givenSubmitAnswerStub);
    this.set('qrocm', qrocm);
    const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));
    await clickByName('select-aria');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert
      .dom(screen.queryByRole('alert', { name: 'Pour valider, veuillez remplir tous les champs réponse.' }))
      .doesNotExist();
  });

  module('should call action when verify button is clicked', function () {
    test('when proposal is an input', async function (assert) {
      // given
      const qrocm = {
        id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
        type: 'qrocm',
      };
      this.set('qrocm', qrocm);
      const userResponse = 'user-response';
      const givenSubmitAnswerSpy = sinon.spy();
      this.set('submitAnswer', givenSubmitAnswerSpy);
      const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}} />`);
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

      // when
      await fillIn(screen.getByLabelText('Réponse 1'), userResponse);
      await click(verifyButton);

      // then
      sinon.assert.calledWith(givenSubmitAnswerSpy, {
        userResponse: [
          {
            input: 'symbole',
            answer: userResponse,
          },
        ],
        element: qrocm,
      });
      assert.ok(true);
    });

    test('when proposal is a select', async function (assert) {
      // given
      const qrocm = {
        id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
        type: 'qrocm',
      };
      this.set('qrocm', qrocm);
      const userResponse = { input: 'premiere-partie', answer: '2' };
      const givenSubmitAnswerSpy = sinon.spy();
      this.set('submitAnswer', givenSubmitAnswerSpy);
      const screen = await render(hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}} />`);
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

      // when
      await clickByName('select-aria');
      await screen.findByRole('listbox');
      await click(
        screen.queryByRole('option', {
          name: "le fournisseur d'adresse mail",
        }),
      );
      await click(verifyButton);

      // then
      sinon.assert.calledWith(givenSubmitAnswerSpy, { userResponse: [userResponse], element: qrocm });
      assert.ok(true);
    });
  });

  test('should display an ok feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Good job!',
      status: 'ok',
      solution: 'solution',
    });
    prepareContextRecords.call(this, store, correctionResponse);
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}}  @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Good job!');
    assert.ok(screen.getByRole('group').disabled);
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Too Bad!',
      status: 'ko',
      solution: 'solution',
    });
    prepareContextRecords.call(this, store, correctionResponse);
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qrocm @qrocm={{this.qrocm}} @submitAnswer={{this.submitAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Too Bad!');
    assert.ok(screen.getByRole('group').disabled);
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });
});

function prepareContextRecords(store, correctionResponse) {
  const qrocm = {
    id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
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
    type: 'qrocm',
  };
  store.createRecord('element-answer', {
    correction: correctionResponse,
    element: qrocm,
  });
  store.createRecord('grain', { id: 'id', rawElements: [qrocm] });
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qrocm.id,
  });
  this.set('qrocm', qrocm);
  this.set('correctionResponse', correctionResponse);
}
