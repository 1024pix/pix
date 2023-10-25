import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { findAll } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const lessonElement = store.createRecord('lesson', { content: 'content', type: 'lessons' });
    const qcuElement = store.createRecord('qcu', {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcus',
    });
    const moduleElements = [lessonElement, qcuElement];

    const module = store.createRecord('module', { title: 'Module title', elements: moduleElements });
    this.set('module', module);

    // when
    const screen = await render(hbs`<Module::Details @module={{this.module}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.strictEqual(findAll('.element-lesson').length, 1);

    assert.strictEqual(findAll('.element-qcu-header__instruction').length, 1);
    assert.strictEqual(findAll('.element-qcu-header__direction').length, 1);

    assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
    assert.ok(screen.getByLabelText('radio1'));
    assert.ok(screen.getByLabelText('radio2'));

    assert.ok(screen.getByRole('button', { name: 'Continuer' }));
  });
});
