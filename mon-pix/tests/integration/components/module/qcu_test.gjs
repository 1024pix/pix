import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModulixQcu from 'mon-pix/components/module/element/qcu';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QCU', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock;
  let passageEventService;
  let passageEventRecordStub;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
    passageEventService = this.owner.lookup('service:passageEvents');
    passageEventRecordStub = sinon.stub(passageEventService, 'record');
  });

  hooks.afterEach(function () {
    clock.restore();
    passageEventRecordStub.restore();
  });

  test('should display a QCU', async function (assert) {
    // given
    const qcuElement = _getQcuElement();
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

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
    assert.dom(verifyButton).exists();
  });

  test('should call action and send an event when verify button is clicked', async function (assert) {
    // given
    const qcuElement = _getQcuElement();
    const answeredProposal = qcuElement.proposals[1];
    const userResponse = [answeredProposal.id];
    const onAnswerSpy = sinon.spy();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByLabelText(answeredProposal.content));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
    await click(verifyButton);

    // then
    sinon.assert.calledWith(onAnswerSpy, { userResponse, element: qcuElement });
    sinon.assert.calledWithExactly(passageEventRecordStub, {
      type: 'QCU_ANSWERED',
      data: {
        answer: answeredProposal.id,
        elementId: qcuElement.id,
        status: 'ko',
      },
    });
    assert.ok(true);
  });

  test('should display an error message if QCU is validated without response', async function (assert) {
    // given
    const qcuElement = _getQcuElement();
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
    sinon.assert.notCalled(onAnswerSpy);
  });

  test('should hide the error message when QCU is validated with response', async function (assert) {
    // given
    const qcuElement = _getQcuElement();
    const onAnswerSpy = sinon.spy();
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await click(screen.getByLabelText('radio1'));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByRole('alert', { name: 'Pour valider, sélectionnez une réponse.' })).doesNotExist();
  });

  test('should disable proposals during validation', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio1' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
  });

  test('should disable verification button during validation', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio1' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
  });

  test('should display an ok feedback when exists', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio1' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByText('Correct!')).doesNotExist();
    assert.dom(screen.queryByText('Good job!')).doesNotExist();

    await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    assert.dom(screen.getByText('Correct!')).exists();
    assert.dom(screen.getByText('Good job!')).exists();
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio2' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByText('Wrong!')).doesNotExist();
    assert.dom(screen.queryByText('Try again!')).doesNotExist();

    await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    assert.dom(screen.getByText('Wrong!')).exists();
    assert.dom(screen.getByText('Try again!')).exists();
    assert.ok(screen.getByRole('radio', { name: 'radio1', disabled: true }));
    assert.ok(screen.getByRole('radio', { name: 'radio2', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
  });

  test('should display retry button when a ko feedback appears', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio2' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    assert.dom(screen.getByRole('button', { name: 'Réessayer' })).exists();
  });

  test('should be able to focus back to proposals when feedback appears', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio1' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    const radio1 = screen.getByRole('radio', { name: 'radio1', disabled: true });
    radio1.focus();
    assert.deepEqual(document.activeElement, radio1);
  });

  test('should not display retry button when an ok feedback appears', async function (assert) {
    // given
    const onAnswerSpy = sinon.spy();
    const qcuElement = _getQcuElement();

    // when
    const screen = await render(<template><ModulixQcu @element={{qcuElement}} @onAnswer={{onAnswerSpy}} /></template>);
    await click(screen.getByRole('radio', { name: 'radio1' }));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
  });

  module('when preview mode is enabled', function () {
    test('should display all feedbacks, without answering', async function (assert) {
      // given
      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);
      const qcuElement = _getQcuElement();

      // when
      const screen = await render(<template><ModulixQcu @element={{qcuElement}} /></template>);

      // then
      assert.dom(screen.getByText('Correct!')).exists();
      assert.dom(screen.getByText('Good job!')).exists();
      assert.dom(screen.getByText('Wrong!')).exists();
      assert.dom(screen.getByText('Try again!')).exists();
    });
  });
});

function _getQcuElement() {
  const qcuElement = {
    id: 'd0690f26-978c-41c3-9a21-da931857739c',
    instruction: 'Instruction',
    proposals: [
      { id: '1', content: 'radio1', feedback: { state: 'Correct!', diagnosis: '<p>Good job!</p>' } },
      { id: '2', content: 'radio2', feedback: { state: 'Wrong!', diagnosis: '<p>Try again!</p>' } },
    ],
    solution: '1',
    type: 'qcu',
  };

  return qcuElement;
}
