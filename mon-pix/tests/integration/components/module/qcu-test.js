import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QCU', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a QCU', async function (assert) {
    // given
    const qcuElement = {
      id: 'd0690f26-978c-41c3-9a21-da931857739c',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'radio1' },
        { id: '2', content: 'radio2' },
      ],
      type: 'qcu',
    };
    const givenonElementAnswerStub = sinon.stub();
    this.set('el', qcuElement);
    this.set('onAnswer', givenonElementAnswerStub);
    const screen = await render(hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} />`);

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: this.intl.t('pages.modulix.qcu.direction') }));

    // Pas possible de faire un `getByRole('form')`. Voir https://github.com/1024pix/pix/pull/8835#discussion_r1596407648
    const form = find('form');
    assert.dom(form).exists();
    const formDescription = find(`#${form.getAttribute('aria-describedby')}`);
    assert.dom(formDescription).hasText('Instruction');

    assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
    assert.ok(screen.getByLabelText('radio1'));
    assert.ok(screen.getByLabelText('radio2'));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    assert.dom(verifyButton).exists();
  });

  test('should call action when verify button is clicked', async function (assert) {
    // given
    const answeredProposal = { id: '1', content: 'radio1' };
    const qcuElement = {
      id: 'qcu-id-1',
      instruction: 'Instruction',
      proposals: [answeredProposal, { id: '2', content: 'radio2' }],
      type: 'qcu',
    };
    this.set('el', qcuElement);
    const userResponse = [answeredProposal.id];
    const givenonElementAnswerSpy = sinon.spy();
    this.set('onAnswer', givenonElementAnswerSpy);
    const screen = await render(hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} />`);
    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

    // when
    await click(screen.getByLabelText(answeredProposal.content));
    await click(verifyButton);

    // then
    sinon.assert.calledWith(givenonElementAnswerSpy, { userResponse, element: qcuElement });
    assert.ok(true);
  });

  test('should display an error message if QCU is validated without response', async function (assert) {
    // given
    const qcuElement = {
      id: 'd0690f26-978c-41c3-9a21-da931857739c',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'radio1' },
        { id: '2', content: 'radio2' },
      ],
      type: 'qcu',
    };
    const onElementAnswerSpy = sinon.spy();
    this.set('el', qcuElement);
    this.set('onAnswer', onElementAnswerSpy);
    const screen = await render(hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
    sinon.assert.notCalled(onElementAnswerSpy);
  });

  test('should hide the error message when QCU is validated with response', async function (assert) {
    // given
    const qcuElement = {
      id: 'd0690f26-978c-41c3-9a21-da931857739c',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'radio1' },
        { id: '2', content: 'radio2' },
      ],
      type: 'qcu',
    };
    const givenonElementAnswerStub = function () {};
    this.set('onAnswer', givenonElementAnswerStub);
    this.set('el', qcuElement);
    const screen = await render(hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));
    await click(screen.getByLabelText('radio1'));
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.queryByRole('alert', { name: 'Pour valider, sélectionnez une réponse.' })).doesNotExist();
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
      hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Good job!');
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
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
      hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Too Bad!');
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
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
      hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
  });

  test('should be able to focus back to proposals when feedback appears', async function (assert) {
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
      hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const radio1 = screen.getByRole('radio', { name: 'radio1', disabled: true });
    radio1.focus();
    assert.deepEqual(document.activeElement, radio1);
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
      hbs`<Module::Element::Qcu @element={{this.el}} @onAnswer={{this.onAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
  });
});

function prepareContextRecords(store, correctionResponse) {
  const qcuElement = {
    id: 'd0690f26-978c-41c3-9a21-da931857739c',
    instruction: 'Instruction',
    proposals: [
      { id: '1', content: 'radio1' },
      { id: '2', content: 'radio2' },
    ],
    type: 'qcu',
  };
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qcuElement.id,
  });
  store.createRecord('grain', { id: 'id', components: [{ type: 'element', element: qcuElement }] });
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qcuElement.id,
  });
  this.set('el', qcuElement);
  this.set('correctionResponse', correctionResponse);
}
