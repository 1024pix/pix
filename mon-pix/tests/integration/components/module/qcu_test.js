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
    const store = this.owner.lookup('service:store');
    const qcuElement = store.createRecord('qcu', {
      instruction: 'Instruction',
      proposals: [
        { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' },
        { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' },
      ],
      type: 'qcus',
    });
    const givenSubmitAnswerStub = sinon.stub();
    this.set('qcu', qcuElement);
    this.set('submitAnswer', givenSubmitAnswerStub);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-qcu-header__instruction').length, 1);
    assert.strictEqual(findAll('.element-qcu-header__direction').length, 1);
    assert.ok(screen.getByText('Instruction'));
    assert.ok(screen.getByText(this.intl.t('pages.modulix.qcu.direction')));

    assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
    assert.ok(screen.getByLabelText('radio1'));
    assert.ok(screen.getByLabelText('radio2'));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    assert.dom(verifyButton).exists();
  });

  test('should call action when verify button is clicked', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const answeredProposal = { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' };
    const qcuElement = store.createRecord('qcu', {
      id: 'qcu-id-1',
      instruction: 'Instruction',
      proposals: [answeredProposal, { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' }],
      type: 'qcus',
    });
    this.set('qcu', qcuElement);
    const elementId = qcuElement.id;
    const userResponse = [answeredProposal.id];
    const givenSubmitAnswerSpy = sinon.spy();
    this.set('submitAnswer', givenSubmitAnswerSpy);
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} />`);
    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });

    // when
    await click(screen.getByLabelText(answeredProposal.content));
    await click(verifyButton);

    // then
    sinon.assert.calledWith(givenSubmitAnswerSpy, { elementId, userResponse });
    assert.ok(true);
  });

  test('should display an ok feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qcuElement = store.createRecord('qcu', {
      instruction: 'Instruction',
      proposals: [
        { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' },
        { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' },
      ],
      type: 'qcus',
    });
    this.set('qcu', qcuElement);
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Good job!',
      status: 'ok',
      solution: 'solutionId',
    });

    const screen = await renderQcuWithCorrectionResponse.call(this, correctionResponse);

    assertsWhenCorrectionResponseHasBeenGiven(assert, screen);

    assert.strictEqual(findAll('.element-qcu__feedback--ok').length, 1);
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qcuElement = store.createRecord('qcu', {
      instruction: 'Instruction',
      proposals: [
        { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' },
        { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' },
      ],
      type: 'qcus',
    });
    this.set('qcu', qcuElement);
    const correctionResponse = store.createRecord('correction-response', {
      feedback: 'Good job!',
      status: 'ko',
      solution: 'solutionId',
    });
    const screen = await renderQcuWithCorrectionResponse.call(this, correctionResponse);

    assertsWhenCorrectionResponseHasBeenGiven(assert, screen);
    assert.strictEqual(findAll('.element-qcu__feedback--ko').length, 1);
  });
});

async function renderQcuWithCorrectionResponse(correctionResponse) {
  this.set('submitAnswer', () => {});
  this.set('correctionResponse', correctionResponse);

  return await render(
    hbs`<Module::Qcu @qcu={{this.qcu}} @submitAnswer={{this.submitAnswer}} @correctionResponse={{this.correctionResponse}} />`,
  );
}

function assertsWhenCorrectionResponseHasBeenGiven(assert, screen) {
  assert.ok(screen.getByText('Good job!'));
  assert.ok(screen.getByRole('group').disabled);
  assert.ok(screen.getByLabelText('radio1').required);
  assert.ok(screen.getByLabelText('radio2').required);
  assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).doesNotExist();
}
