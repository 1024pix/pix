import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Grain', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const grain = store.createRecord('grain', { title: 'Grain title' });
    this.set('grain', grain);

    // when
    const screen = await render(hbs`<Module::Grain @grain={{this.grain}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: grain.title, level: 2 }));
  });

  module('when element is a text', function () {
    test('should display text element', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = store.createRecord('text', { content: 'element content', type: 'texts' });
      const elements = [textElement];
      const grain = store.createRecord('grain', { title: 'Grain title', elements });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`<Module::Grain @grain={{this.grain}} />`);

      // then
      assert.ok(screen.getByText('element content'));
    });
  });

  module('when element is a qcu', function () {
    test('should display qcu element', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const qcuElement = store.createRecord('qcu', {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcus',
      });
      const elements = [qcuElement];
      const grain = store.createRecord('grain', { title: 'Grain title', elements });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`<Module::Grain @grain={{this.grain}} />`);

      // then
      assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
    });
  });

  module('when canDisplayContinueButton is true', function () {
    module('when all elements are answered', function () {
      test('should display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        const correction = store.createRecord('correction-response');
        store.createRecord('element-answer', { element, correction });
        assert.true(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
      });
    });

    module('when not any element are answered', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        assert.false(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });
  });

  module('when canDisplayContinueButton is false', function () {
    module('when all elements are answered', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        const correction = store.createRecord('correction-response');
        store.createRecord('element-answer', { element, correction });
        assert.true(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{false}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });

    module('when not any element are answered', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus' });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        assert.false(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{false}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });
  });
});
