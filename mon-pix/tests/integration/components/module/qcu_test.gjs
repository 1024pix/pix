import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixQcu from 'mon-pix/components/module/element/qcu';
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
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: t('pages.modulix.qcu.direction') }));

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
    const userResponse = [answeredProposal.id];
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

    // when
    await click(screen.getByLabelText(answeredProposal.content));
    await click(verifyButton);

    // then
    sinon.assert.calledWith(onAnswerSpy, { userResponse, element: qcuElement });
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
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
    sinon.assert.notCalled(onAnswerSpy);
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
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);

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
      feedback: { state: 'Correct!', diagnosis: '<p>Good job!</p>' },
      status: 'ok',
      solution: 'solution',
    });

    const onAnswerSpy = sinon.spy();
    const { qcuElement } = prepareContextRecords.call(this, store, correctionResponse);

    // when
    const screen = await render(
      <template>
        <ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} @correction={{correctionResponse}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Correct!')).exists();
    assert.dom(screen.getByText('Good job!')).exists();
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: { state: 'Wrong!', diagnosis: 'Too Bad!' },
      status: 'ko',
      solution: 'solution',
    });

    const onAnswerSpy = sinon.spy();
    const { qcuElement } = prepareContextRecords.call(this, store, correctionResponse);

    // when
    const screen = await render(
      <template>
        <ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} @correction={{correctionResponse}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Wrong!')).exists();
    assert.dom(screen.getByText('Too Bad!')).exists();
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });

  test('should display retry button when a ko feedback appears', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: { state: 'Wrong!', diagnosis: '<p>Try again!</p>' },
      status: 'ko',
      solution: 'solution',
    });

    const onAnswerSpy = sinon.spy();
    const { qcuElement } = prepareContextRecords.call(this, store, correctionResponse);

    // when
    const screen = await render(
      <template>
        <ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} @correction={{correctionResponse}} />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
  });

  test('should be able to focus back to proposals when feedback appears', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: { state: 'Correct!', diagnosis: '<p>Good job!</p>' },
      status: 'ko',
      solution: 'solution',
    });

    const onAnswerSpy = sinon.spy();
    const { qcuElement } = prepareContextRecords.call(this, store, correctionResponse);

    // when
    const screen = await render(
      <template>
        <ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} @correction={{correctionResponse}} />
      </template>,
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
      feedback: { state: 'Correct!', diagnosis: '<p>Nice!</p>' },
      status: 'ok',
      solution: 'solution',
    });

    const onAnswerSpy = sinon.spy();
    const { qcuElement } = prepareContextRecords.call(this, store, correctionResponse);

    // when
    const screen = await render(
      <template>
        <ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} @correction={{correctionResponse}} />
      </template>,
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
  return { qcuElement };
}
