import {clickByName, render} from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import {click, fillIn, find} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {t} from 'ember-intl/test-support';
import {module, test} from 'qunit';
import sinon from 'sinon';
import ModuleQrocm from 'mon-pix/components/module/element/qrocm';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module.only('Integration | Component | Module | QROCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a block QROCM', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        { content: '<span>Ma première proposition</span>', type: 'text' },
        {
          input: 'symbole',
          inputType: 'text',
          display: 'block',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          defaultValue: '',
          type: 'input',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'block',
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
    const screen = await render(<template>
      <ModuleQrocm @element={{qrocm}}/>
    </template>)
    const direction = t('pages.modulix.qrocm.direction', {
      count: qrocm.proposals.filter(({ type }) => type !== 'text').length,
    });

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: direction }));

    const form = find('form');
    assert.dom(form).exists();
    const formDescription = find(`#${form.getAttribute('aria-describedby')}`);
    assert.dom(formDescription).hasText('Mon instruction');

    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.getByRole('textbox', { name: 'input-aria' }));
    assert.dom(screen.getByText("l'identifiant")).exists({ count: 1 });
    assert.dom(screen.getByText("le fournisseur d'adresse mail")).exists({ count: 1 });
    assert.ok(screen.getByLabelText('select-aria'));
    assert.dom('.element-qrocm-proposals__input--block').exists({ count: 2 });
  });

  test('should display an inline QROCM', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        { content: '<span>Ma première proposition</span>', type: 'text' },
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
    const screen = await render(<template>
      <ModuleQrocm @element={{qrocm}}/>
    </template>)

    // then
    assert.ok(screen);
    assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
    assert.ok(
      screen.getByRole('group', {
        legend: t('pages.modulix.qrocm.direction', {
          count: qrocm.proposals.filter(({ type }) => type !== 'text').length,
        }),
      }),
    );
    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.queryByRole('textbox', { name: 'input-aria' }));
    assert.ok(screen.queryByText("l'identifiant"));
    assert.dom('.element-qrocm-proposals__input--inline').exists({ count: 2 });
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
          display: 'block',
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
    const screen = await render(<template>
      <ModuleQrocm @element={{qrocm}}/>
    </template>)

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
          display: 'block',
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
    const screen = await render(<template>
      <ModuleQrocm @element={{qrocm}}/>
    </template>)

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
          display: 'block',
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
    const onAnswer = function (){}

    const screen = await render(<template>
      <ModuleQrocm @element={{qrocm}}
                   @onAnswer={{onAnswer}}/>
    </template>)

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
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          },
        ],
        type: 'qrocm',
      };
      this.set('el', qrocm);
      const userResponse = 'user-response';
      const givenonElementAnswerSpy = sinon.spy();
      this.set('onAnswer', givenonElementAnswerSpy);
      const screen = await render(hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} />`);
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

      // when
      await fillIn(screen.getByLabelText('Réponse 1'), userResponse);
      await click(verifyButton);

      // then
      sinon.assert.calledWith(givenonElementAnswerSpy, {
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
            display: 'block',
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
      this.set('el', qrocm);
      const userResponse = { input: 'premiere-partie', answer: '2' };
      const givenonElementAnswerSpy = sinon.spy();
      this.set('onAnswer', givenonElementAnswerSpy);
      const screen = await render(hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} />`);
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
      sinon.assert.calledWith(givenonElementAnswerSpy, { userResponse: [userResponse], element: qrocm });
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
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Good job!');
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
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Too Bad!');
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });

  test('should display retry button when a ko feedback appears', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Too Bad!',
      status: 'ko',
      solution: 'solution',
    });

    prepareContextRecords.call(this, store, correctionResponse);
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
  });

  test('should be able to focus back an input to proposals when feedback appears', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        {
          input: 'symbole',
          inputType: 'text',
          display: 'block',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          defaultValue: '',
          type: 'input',
        },
      ],
      type: 'qrocm',
    };
    this.set('el', qrocm);
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Too Bad!',
      status: 'ko',
      solution: 'solution',
    });
    store.createRecord('element-answer', {
      correction: correctionResponse,
      elementId: qrocm.id,
    });
    store.createRecord('grain', { id: 'id', components: [{ type: 'element', element: qrocm }] });
    store.createRecord('element-answer', {
      correction: correctionResponse,
      elementId: qrocm.id,
    });
    this.set('el', qrocm);
    this.set('correctionResponse', correctionResponse);
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const textbox = screen.getByRole('textbox', { name: 'input-aria', disabled: true });
    textbox.focus();
    assert.deepEqual(document.activeElement, textbox);
  });

  test('should be able to focus back a select to proposals when feedback appears', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Too Bad!',
      status: 'ko',
      solution: 'solution',
    });

    prepareContextRecords.call(this, store, correctionResponse);
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const selectButton = screen.getByRole('button', { name: 'select-aria', disabled: true });
    selectButton.focus();
    assert.deepEqual(document.activeElement, selectButton);
  });

  test('should not display retry button when an ok feedback appears', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Nice!',
      status: 'ok',
      solution: 'solution',
    });

    prepareContextRecords.call(this, store, correctionResponse);
    this.set('onAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Element::Qrocm @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
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
        display: 'block',
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
    elementId: qrocm.id,
  });
  store.createRecord('grain', { id: 'id', components: [{ type: 'element', element: qrocm }] });
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qrocm.id,
  });
  return {
    qrocm,
    correctionResponse,
  };
}
