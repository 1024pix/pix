import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { findAll } from '@ember/test-helpers';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Passage', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a banner at the top of the screen for a passage', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = { content: 'content', type: 'text' };
    const grain = store.createRecord('grain', { id: 'grainId1', rawElements: [textElement] });
    const module = store.createRecord('module', { title: 'Module title', grains: [grain] });
    this.set('module', module);

    const passage = store.createRecord('passage');
    this.set('passage', passage);

    // when
    const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

    // then
    assert.dom(screen.getByRole('alert')).exists();
  });

  test('should display given module with one grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = { content: 'content', type: 'text' };
    const qcuElement = {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcu',
    };
    const rawElements = [textElement, qcuElement];
    const grain = store.createRecord('grain', { id: 'grainId1', rawElements });
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

  test('should display given module with more than one grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = { content: 'content', type: 'text' };
    const qcuElement = {
      instruction: 'instruction',
      proposals: ['radio1', 'radio2'],
      type: 'qcu',
    };
    const grain1 = store.createRecord('grain', { rawElements: [textElement] });
    const grain2 = store.createRecord('grain', { rawElements: [qcuElement] });

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
      const grain1 = store.createRecord('grain', { rawElements: [qcuElement] });
      const grain2 = store.createRecord('grain', { rawElements: [textElement] });

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
      const grain1 = store.createRecord('grain', { rawElements: [qcuElement] });
      const grain2 = store.createRecord('grain', { rawElements: [textElement] });

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
      const grain1 = store.createRecord('grain', { rawElements: [text1Element] });
      const grain2 = store.createRecord('grain', { rawElements: [text2Element] });

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

    test('should only set the aria-live="assertive" attribute on the last grain', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const text3Element = { content: 'content 3', type: 'text' };
      const grain1 = store.createRecord('grain', { rawElements: [text1Element] });
      const grain2 = store.createRecord('grain', { rawElements: [text2Element] });
      const grain3 = store.createRecord('grain', { rawElements: [text3Element] });

      const module = store.createRecord('module', { title: 'Module title', grains: [grain1, grain2, grain3] });
      this.set('module', module);

      const passage = store.createRecord('passage');
      this.set('passage', passage);

      const screen = await render(hbs`<Module::Passage @module={{this.module}} @passage={{this.passage}} />`);

      const grainsBeforeAnyAction = screen.getAllByRole('article');
      assert.strictEqual(grainsBeforeAnyAction.length, 1);
      const firstGrain = grainsBeforeAnyAction.at(-1);
      assert.strictEqual(firstGrain.getAttribute('aria-live'), null);

      // when
      await clickByName(continueButtonName);

      // then
      const grainsAfterOneContinueActions = screen.getAllByRole('article');
      assert.strictEqual(grainsAfterOneContinueActions.length, 2);
      const secondGrain = grainsAfterOneContinueActions.at(-1);
      assert.strictEqual(firstGrain.getAttribute('aria-live'), null);
      assert.strictEqual(secondGrain.getAttribute('aria-live'), 'assertive');

      // when
      await clickByName(continueButtonName);

      // then
      const grainsAfterTwoContinueActions = screen.getAllByRole('article');
      assert.strictEqual(grainsAfterTwoContinueActions.length, 3);
      const thirdGrain = grainsAfterTwoContinueActions.at(-1);
      assert.strictEqual(secondGrain.getAttribute('aria-live'), null);
      assert.strictEqual(thirdGrain.getAttribute('aria-live'), 'assertive');
    });

    test('should give focus on the last grain when appearing', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const text3Element = { content: 'content 3', type: 'text' };
      const grain1 = store.createRecord('grain', { rawElements: [text1Element] });
      const grain2 = store.createRecord('grain', { rawElements: [text2Element] });
      const grain3 = store.createRecord('grain', { rawElements: [text3Element] });

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
      const grain1 = store.createRecord('grain', { rawElements: [text1Element] });
      const grain2 = store.createRecord('grain', { rawElements: [text2Element] });

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
