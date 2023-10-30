import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { findAll } from '@ember/test-helpers';

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
    this.set('qcu', qcuElement);

    //  when
    const screen = await render(hbs`<Module::Qcu @qcu={{this.qcu}} />`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-qcu-header__instruction').length, 1);
    assert.strictEqual(findAll('.element-qcu-header__direction').length, 1);
    assert.ok(screen.getByText('Instruction'));
    assert.ok(screen.getByText(this.intl.t('pages.modulix.qcu.direction')));
    assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
    assert.ok(screen.getByLabelText('radio1'));
    assert.ok(screen.getByLabelText('radio2'));
  });
});
