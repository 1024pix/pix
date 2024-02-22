import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click, findAll } from '@ember/test-helpers';
import sinon from 'sinon';

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
    const givenSubmitAnswerStub = sinon.stub();
    this.set('qcu', qcuElement);
    this.set('submitAnswer', givenSubmitAnswerStub);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-qcu-header__instruction').length, 1);
    assert.strictEqual(findAll('.element-qcu-header__direction').length, 1);
    assert.ok(screen.getByText('Instruction'));
    assert.ok(screen.getByText('Choisissez une seule réponse.'));

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
    this.set('qcu', qcuElement);
    const userResponse = [answeredProposal.id];
    const givenSubmitAnswerSpy = sinon.spy();
    this.set('submitAnswer', givenSubmitAnswerSpy);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);
    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

    // when
    await click(screen.getByLabelText(answeredProposal.content));
    await click(verifyButton);

    // then
    sinon.assert.calledWith(givenSubmitAnswerSpy, { userResponse, element: qcuElement });
    assert.ok(true);
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
      hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} @correction={{this.correctionResponse}} />`,
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
      hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}}  @correction={{this.correctionResponse}} />`,
    );

    // then
    const status = screen.getByRole('status');
    assert.strictEqual(status.innerText, 'Too Bad!');
    assert.ok(screen.getByRole('group').disabled);
    assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
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
    this.set('qcu', qcuElement);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
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
    const givenSubmitAnswerStub = function () {};
    this.set('submitAnswer', givenSubmitAnswerStub);
    this.set('qcu', qcuElement);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier' }));
    await click(screen.getByLabelText('radio1'));
    await click(screen.queryByRole('button', { name: 'Vérifier' }));

    // then
    assert.dom(screen.queryByRole('alert', { name: 'Pour valider, sélectionnez une réponse.' })).doesNotExist();
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
    element: qcuElement,
  });
  store.createRecord('grain', { id: 'id', rawElements: [qcuElement] });
  store.createRecord('element-answer', {
    correction: correctionResponse,
    elementId: qcuElement.id,
  });
  this.set('qcu', qcuElement);
  this.set('correctionResponse', correctionResponse);
}
