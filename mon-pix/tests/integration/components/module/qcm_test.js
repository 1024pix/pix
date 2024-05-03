import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a QCM', async function (assert) {
    // given
    const qcmElement = {
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      type: 'qcm',
    };
    this.set('el', qcmElement);
    const screen = await render(hbs`<Module::Qcm @element={{this.el}} />`);

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: this.intl.t('pages.modulix.qcm.direction') }));

    // Pas possible de faire un `getByRole('form')`. Voir https://github.com/1024pix/pix/pull/8835#discussion_r1596407648
    const form = find('form');
    assert.dom(form).exists();
    const formDescription = find(`#${form.getAttribute('aria-describedby')}`);
    assert.dom(formDescription).hasText('Instruction');

    assert.strictEqual(screen.getAllByRole('checkbox').length, qcmElement.proposals.length);
    assert.ok(screen.getByLabelText('checkbox1'));
    assert.ok(screen.getByLabelText('checkbox2'));
    assert.ok(screen.getByLabelText('checkbox3'));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    assert.dom(verifyButton).exists();
  });

  test('should call action when verify button is clicked', async function (assert) {
    // given
    const answeredProposal = [
      { id: '1', content: 'select1' },
      { id: '2', content: 'select2' },
    ];
    const qcmElement = {
      id: 'qcm-id-1',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'select1' },
        { id: '2', content: 'select2' },
        { id: '3', content: 'select3' },
      ],
      type: 'qcm',
    };
    this.set('el', qcmElement);
    const userResponse = [answeredProposal[0].id, answeredProposal[1].id];
    const givenSubmitAnswerSpy = sinon.spy();
    this.set('submitAnswer', givenSubmitAnswerSpy);
    const screen = await render(hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}} />`);
    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

    // when
    await click(screen.getByLabelText(answeredProposal[0].content));
    await click(screen.getByLabelText(answeredProposal[1].content));
    await click(verifyButton);

    // then
    sinon.assert.calledWith(givenSubmitAnswerSpy, { userResponse, element: qcmElement });
    assert.ok(true);
  });

  test('should display an error message if QCM is validated with less than two responses', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      type: 'qcm',
    };
    const submitAnswerSpy = sinon.spy();
    this.set('el', qcmElement);
    this.set('submitAnswer', submitAnswerSpy);
    const screen = await render(hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.getByLabelText('checkbox1'));
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
    sinon.assert.notCalled(submitAnswerSpy);
  });

  test('should hide the error message when QCM is validated with response', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      type: 'qcm',
    };
    const givenSubmitAnswerStub = function () {};
    this.set('submitAnswer', givenSubmitAnswerStub);
    this.set('el', qcmElement);
    const screen = await render(hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));
    await click(screen.getByLabelText('checkbox1'));
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
      solution: ['1', '4'],
    });

    prepareContextRecords.call(this, store, correctionResponse);
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Good job!');
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox1', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox2', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox3', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Too Bad!',
      status: 'ko',
      solution: ['1', '4'],
    });

    prepareContextRecords.call(this, store, correctionResponse);
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}} @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Too Bad!');

    assert.ok(screen.getByRole('checkbox', { name: 'checkbox1', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox2', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox3', disabled: true }));
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
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}}  @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
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
    this.set('submitAnswer', () => {});

    // when
    const screen = await render(
      hbs`<Module::Qcm @element={{this.el}} @submitAnswer={{this.submitAnswer}}  @correction={{this.correctionResponse}} />`,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
  });
});

function prepareContextRecords(store, correctionResponse) {
  const qcmElement = {
    id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
    instruction: 'Instruction',
    proposals: [
      { id: '1', content: 'checkbox1' },
      { id: '2', content: 'checkbox2' },
      { id: '3', content: 'checkbox3' },
    ],
    type: 'qcm',
  };
  store.createRecord('element-answer', {
    correction: correctionResponse,
    element: qcmElement,
  });
  store.createRecord('grain', { id: 'id', components: [{ type: 'element', element: qcmElement }] });
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qcmElement.id,
  });
  this.set('el', qcmElement);
  this.set('correctionResponse', correctionResponse);
}
