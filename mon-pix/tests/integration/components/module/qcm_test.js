import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { findAll } from '@ember/test-helpers';

module('Integration | Component | Module | QCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a QCM', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const qcmElement = store.createRecord('qcm', {
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'option1' },
        { id: '2', content: 'option2' },
        { id: '3', content: 'option3' },
      ],
      type: 'qcms',
    });
    this.set('qcm', qcmElement);
    const screen = await render(hbs`<Module::Qcm @qcm={{this.qcm}} />`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-qcm-header__instruction').length, 1);
    assert.strictEqual(findAll('.element-qcm-header__direction').length, 1);
    assert.ok(screen.getByText('Instruction'));
    assert.ok(screen.getByText('Choisissez plusieurs réponses.'));

    assert.strictEqual(screen.getAllByRole('checkbox').length, qcmElement.proposals.length);
    assert.ok(screen.getByLabelText('option1'));
    assert.ok(screen.getByLabelText('option2'));
    assert.ok(screen.getByLabelText('option3'));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier' });
    assert.dom(verifyButton).exists();
  });
});
