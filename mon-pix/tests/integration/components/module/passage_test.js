import { clickByName, render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Passage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given module with one grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = { content: 'content', type: 'text' };
    const qcuElement = {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcu',
    };
    const elements = [textElement, qcuElement];
    const grain = store.createRecord('grain', { id: 'grainId1', elements });
    const transitionTexts = [{ grainId: 'grainId1', content: 'transition text' }];

    const module = store.createRecord('module', { title: 'Module title', grains: [grain], transitionTexts });
    this.set('module', module);

    const passage = store.createRecord('passage');
    this.set('passage', passage);

    // when
    const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.ok(screen.getByRole('banner').innerText.includes('transition text'));
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.strictEqual(findAll('.element-qcu').length, 1);

    assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
  });

  module('When a grain contains non existing elements', function () {
    test('should not display the grain if it contains only non existing elements', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const nonExistingElement1 = { type: 'non-existing-element-type' };
      const nonExistingElement2 = {
        type: 'non-existing-element-type',
      };
      const elements = [nonExistingElement1, nonExistingElement2];
      const grain = store.createRecord('grain', { id: 'grainId1', elements });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);
      // then
      assert.strictEqual(screen.queryAllByRole('article').length, 0);
    });

    test('should not display the non existing elements but display the existing ones', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const existingElement = { content: '<h3>existing element content</h3>', type: 'text' };
      const nonExistingElement1 = { type: 'non-existing-element-type' };
      const nonExistingElement2 = {
        type: 'non-existing-element-type',
      };
      const elements = [nonExistingElement1, nonExistingElement2, existingElement];
      const grain = store.createRecord('grain', { id: 'grainId1', elements });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);
      // then
      assert.ok(screen.queryByRole('heading', { name: 'existing element content', level: 3 }));
      assert.dom('.grain-card-content__element').exists({ count: 1 });
    });
  });

  module('with elements', function () {
    test('should display a banner at the top of the screen for a passage', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const grain = store.createRecord('grain', { id: 'grainId1', elements: [textElement] });
      const module = store.createRecord('module', { title: 'Module title', grains: [grain] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

      // then
      assert.dom(screen.getByRole('alert')).exists();
    });

    test('should display given module with more than one grain', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const grain1 = store.createRecord('grain', { elements: [textElement] });
      const grain2 = store.createRecord('grain', { elements: [qcuElement] });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

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
        const textElement = { content: 'content', type: 'text' };
        const qcuElement = {
          instruction: 'instruction',
          proposals: ['radio1', 'radio2'],
          type: 'qcu',
          isAnswerable: true,
        };
        const grain1 = store.createRecord('grain', { elements: [qcuElement] });
        const grain2 = store.createRecord('grain', { elements: [textElement] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        assert.strictEqual(findAll('.element-text').length, 0);

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

        // then
        assert.strictEqual(findAll('.element-text').length, 1);
      });

      test('should push event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const textElement = { content: 'content', type: 'text' };
        const qcuElement = {
          instruction: 'instruction',
          proposals: ['radio1', 'radio2'],
          type: 'qcu',
          isAnswerable: true,
        };
        const grain1 = store.createRecord('grain', { elements: [qcuElement] });
        const grain2 = store.createRecord('grain', { elements: [textElement] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const metrics = this.owner.lookup('service:metrics');
        metrics.add = sinon.stub();

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

        // then
        sinon.assert.calledWithExactly(metrics.add, {
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${module.id}`,
          'pix-event-name': `Click sur le bouton passer du grain : ${grain1.id}`,
        });
        assert.ok(true);
      });
    });

    module('when user click on continue button', function (hooks) {
      let continueButtonName;
      hooks.beforeEach(function () {
        continueButtonName = this.intl.t('pages.modulix.buttons.grain.continue');
      });

      test('should display next grain', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const grain1 = store.createRecord('grain', { elements: [text1Element] });
        const grain2 = store.createRecord('grain', { elements: [text2Element] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const grainsBeforeAnyAction = screen.getAllByRole('article');
        assert.strictEqual(grainsBeforeAnyAction.length, 1);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterContinueAction = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterContinueAction.length, 2);
      });

      test('should give focus on the last grain when appearing', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const text3Element = { content: 'content 3', type: 'text' };
        const grain1 = store.createRecord('grain', { elements: [text1Element] });
        const grain2 = store.createRecord('grain', { elements: [text2Element] });
        const grain3 = store.createRecord('grain', { elements: [text3Element] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2, grain3] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const grainsBeforeAnyAction = screen.getAllByRole('article');
        assert.strictEqual(grainsBeforeAnyAction.length, 1);
        assert.strictEqual(document.activeElement, document.body);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterOneContinueActions = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterOneContinueActions.length, 2);
        const secondGrain = grainsAfterOneContinueActions.at(-1);
        assert.strictEqual(document.activeElement, secondGrain);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterTwoContinueActions = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterTwoContinueActions.length, 3);
        const thirdGrain = grainsAfterTwoContinueActions.at(-1);
        assert.strictEqual(document.activeElement, thirdGrain);
      });

      test('should push event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const grain1 = store.createRecord('grain', { elements: [text1Element] });
        const grain2 = store.createRecord('grain', { elements: [text2Element] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const metrics = this.owner.lookup('service:metrics');
        metrics.add = sinon.stub();

        // when
        await clickByName(continueButtonName);

        // then
        sinon.assert.calledWithExactly(metrics.add, {
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${module.id}`,
          'pix-event-name': `Click sur le bouton continuer du grain : ${grain1.id}`,
        });
        assert.ok(true);
      });
    });
  });

  module('with components', function () {
    test('should display a banner at the top of the screen for a passage', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const grain = store.createRecord('grain', {
        id: 'grainId1',
        components: [{ type: 'element', element: textElement }],
      });
      const module = store.createRecord('module', { title: 'Module title', grains: [grain] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

      // then
      assert.dom(screen.getByRole('alert')).exists();
    });

    test('should display given module with more than one grain', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: textElement }] });
      const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: qcuElement }] });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      // when
      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

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
        const textElement = { content: 'content', type: 'text' };
        const qcuElement = {
          instruction: 'instruction',
          proposals: ['radio1', 'radio2'],
          type: 'qcu',
          isAnswerable: true,
        };
        const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: qcuElement }] });
        const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: textElement }] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        assert.strictEqual(findAll('.element-text').length, 0);

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

        // then
        assert.strictEqual(findAll('.element-text').length, 1);
      });

      test('should push event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const textElement = { content: 'content', type: 'text' };
        const qcuElement = {
          instruction: 'instruction',
          proposals: ['radio1', 'radio2'],
          type: 'qcu',
          isAnswerable: true,
        };
        const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: qcuElement }] });
        const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: textElement }] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const metrics = this.owner.lookup('service:metrics');
        metrics.add = sinon.stub();

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

        // then
        sinon.assert.calledWithExactly(metrics.add, {
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${module.id}`,
          'pix-event-name': `Click sur le bouton passer du grain : ${grain1.id}`,
        });
        assert.ok(true);
      });
    });

    module('when user click on continue button', function (hooks) {
      let continueButtonName;
      hooks.beforeEach(function () {
        continueButtonName = this.intl.t('pages.modulix.buttons.grain.continue');
      });

      test('should display next grain', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: text1Element }] });
        const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: text2Element }] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const grainsBeforeAnyAction = screen.getAllByRole('article');
        assert.strictEqual(grainsBeforeAnyAction.length, 1);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterContinueAction = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterContinueAction.length, 2);
      });

      test('should give focus on the last grain when appearing', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const text3Element = { content: 'content 3', type: 'text' };
        const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: text1Element }] });
        const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: text2Element }] });
        const grain3 = store.createRecord('grain', { components: [{ type: 'element', element: text3Element }] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2, grain3] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const grainsBeforeAnyAction = screen.getAllByRole('article');
        assert.strictEqual(grainsBeforeAnyAction.length, 1);
        assert.strictEqual(document.activeElement, document.body);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterOneContinueActions = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterOneContinueActions.length, 2);
        const secondGrain = grainsAfterOneContinueActions.at(-1);
        assert.strictEqual(document.activeElement, secondGrain);

        // when
        await clickByName(continueButtonName);

        // then
        const grainsAfterTwoContinueActions = screen.getAllByRole('article');
        assert.strictEqual(grainsAfterTwoContinueActions.length, 3);
        const thirdGrain = grainsAfterTwoContinueActions.at(-1);
        assert.strictEqual(document.activeElement, thirdGrain);
      });

      test('should push event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text1Element = { content: 'content', type: 'text' };
        const text2Element = { content: 'content 2', type: 'text' };
        const grain1 = store.createRecord('grain', { components: [{ type: 'element', element: text1Element }] });
        const grain2 = store.createRecord('grain', { components: [{ type: 'element', element: text2Element }] });

        const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2] });
        this.set('module', module);

        const passage = store.createRecord('passage');
        this.set('passage', passage);

        await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

        const metrics = this.owner.lookup('service:metrics');
        metrics.add = sinon.stub();

        // when
        await clickByName(continueButtonName);

        // then
        sinon.assert.calledWithExactly(metrics.add, {
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${module.id}`,
          'pix-event-name': `Click sur le bouton continuer du grain : ${grain1.id}`,
        });
        assert.ok(true);
      });
    });
  });
});
