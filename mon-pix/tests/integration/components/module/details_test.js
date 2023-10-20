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
    const elementContent = 'toto';
    const element = store.createRecord('element', { content: elementContent });
    const moduleElements = [element];

    const module = store.createRecord('module', { title: 'Module title', elements: moduleElements });
    this.set('module', module);

    // when
    const screen = await render(hbs`<Module::Details @module={{this.module}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.dom(screen.getByText(elementContent)).exists();
    assert.strictEqual(findAll('.grain__element').length, moduleElements.length);
    assert.ok(screen.getByRole('button', { name: 'Continuer' }));
  });
});
