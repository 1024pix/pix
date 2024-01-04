import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { findAll } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given module with one grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = store.createRecord('text', { content: 'content', type: 'texts' });
    const qcuElement = store.createRecord('qcu', {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcus',
    });
    const elements = [textElement, qcuElement];
    const grain = store.createRecord('grain', { id: 'grainId1', elements });
    const transitionTexts = [{ grainId: 'grainId1', content: 'transition text' }];

    const module = store.createRecord('module', { title: 'Module title', grains: [grain], transitionTexts });
    this.set('module', module);

    // when
    const screen = await render(hbs`<Module::Details @module={{this.module}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.ok(screen.getByRole('banner').innerText.includes('transition text'));
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.strictEqual(findAll('.element-qcu').length, 1);

    assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
  });

  test('should display given module with more than one grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = store.createRecord('text', { content: 'content', type: 'texts' });
    const qcuElement = store.createRecord('qcu', {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcus',
    });
    const grain1 = store.createRecord('grain', { elements: [textElement] });
    const grain2 = store.createRecord('grain', { elements: [qcuElement] });

    const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
    this.set('module', module);

    // when
    const screen = await render(hbs`<Module::Details @module={{this.module}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.strictEqual(findAll('.element-qcu').length, 0);

    assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists({ count: 1 });
  });

  module('when user click on skip button', function () {
    test('should display next grain', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = store.createRecord('text', { content: 'content', type: 'texts' });
      const qcuElement = store.createRecord('qcu', {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcus',
        isAnswerable: true,
      });
      const grain1 = store.createRecord('grain', { elements: [qcuElement] });
      const grain2 = store.createRecord('grain', { elements: [textElement] });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
      this.set('module', module);

      await render(hbs`<Module::Details @module={{this.module}} />`);
      assert.strictEqual(findAll('.element-text').length, 0);

      // when
      await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

      // then
      assert.strictEqual(findAll('.element-text').length, 1);
    });
  });
});
