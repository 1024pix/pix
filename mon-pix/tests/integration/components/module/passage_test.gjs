import { clickByName, render } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ApplicationAdapter from 'mon-pix/adapters/application';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModulePassage from 'mon-pix/components/module/passage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Passage', function (hooks) {
  setupIntlRenderingTest(hooks);

  let passageEventService, passageEventRecordStub;

  hooks.beforeEach(function () {
    passageEventService = this.owner.lookup('service:passageEvents');
    passageEventRecordStub = sinon.stub(passageEventService, 'record');
  });

  hooks.afterEach(function () {
    passageEventRecordStub.restore();
  });

  module('when module has one grain', function () {
    test('should display given module', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const components = [
        {
          type: 'element',
          element: textElement,
        },
        {
          type: 'element',
          element: qcuElement,
        },
      ];
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ id: 'grainId1', components }],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
      assert.strictEqual(findAll('.element-text').length, 1);
      assert.strictEqual(findAll('.element-qcu').length, 1);

      assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
    });

    test('should display navigation', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const components = [
        {
          type: 'element',
          element: textElement,
        },
        {
          type: 'element',
          element: qcuElement,
        },
      ];
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ id: 'grainId1', components }],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 1' })).exists();
    });
  });

  module('when a grain contains non existing elements', function () {
    test('should not display the grain if it contains only non existing elements', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const nonExistingElement1 = { type: 'non-existing-element-type' };
      const nonExistingElement2 = {
        type: 'non-existing-element-type',
      };
      const components = [
        {
          type: 'element',
          element: nonExistingElement1,
        },
        {
          type: 'stepper',
          steps: [{ elements: [nonExistingElement2] }],
        },
      ];
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ id: 'grainId1', components }],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.strictEqual(screen.queryAllByRole('article').length, 0);
    });

    test('should not display the non existing elements but display the existing ones', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const existingElement = { content: '<h4>existing element content</h4>', type: 'text' };
      const nonExistingElement1 = { type: 'non-existing-element-type' };
      const nonExistingElement2 = {
        type: 'non-existing-element-type',
      };
      const components = [
        {
          type: 'element',
          element: nonExistingElement1,
        },
        {
          type: 'element',
          element: nonExistingElement2,
        },
        {
          type: 'element',
          element: existingElement,
        },
      ];
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ id: 'grainId1', components }],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });

      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      // then
      assert.ok(screen.queryByRole('heading', { name: 'existing element content', level: 4 }));
      assert.dom('.grain-card-content__element').exists({ count: 1 });
    });
  });

  module('when module has isBeta status', function () {
    test('should display a banner at the top of the screen for a passage', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            id: 'grainId1',
            components: [{ type: 'element', element: textElement }],
          },
        ],
      });
      const module = store.createRecord('module', { title: 'Module title', isBeta: true, sections: [section] });

      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.dom(screen.getByRole('alert')).exists();
    });
  });

  module('when module does not have isBeta status', function () {
    test('should not display a banner at the top of the screen for a passage', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            id: 'grainId1',
            components: [{ type: 'element', element: textElement }],
          },
        ],
      });
      const module = store.createRecord('module', { title: 'Module title', isBeta: false, sections: [section] });

      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('when module has more than on grain', function () {
    test('should display given module', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'practise',
        grains: [
          { components: [{ type: 'element', element: textElement }] },
          { components: [{ type: 'element', element: qcuElement }] },
        ],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
      assert.dom(screen.getByRole('heading', { name: 'S’exercer', level: 2 })).exists();
      assert.strictEqual(findAll('.element-text').length, 1);
      assert.strictEqual(findAll('.element-qcu').length, 0);

      assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists({ count: 1 });
    });

    test('should display navigation', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          { components: [{ type: 'element', element: textElement }] },
          { components: [{ type: 'element', element: qcuElement }] },
        ],
      });

      const module = store.createRecord('module', { title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 2' })).exists();
    });
  });

  module('when user clicks on skip button', function () {
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
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          { components: [{ type: 'element', element: qcuElement }] },
          { components: [{ type: 'element', element: textElement }] },
        ],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      assert.strictEqual(findAll('.element-text').length, 0);

      // when
      await clickByName(t('pages.modulix.buttons.grain.skipActivity'));

      // then
      assert.strictEqual(findAll('.element-text').length, 1);
    });

    test('should send an event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = { content: 'content', type: 'text' };
      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
        isAnswerable: true,
      };
      const grain1 = { components: [{ type: 'element', element: qcuElement }] };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [grain1, { components: [{ type: 'element', element: textElement }] }],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // when
      await clickByName(t('pages.modulix.buttons.grain.skipActivity'));

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'GRAIN_SKIPPED',
        data: {
          grainId: grain1.id,
        },
      });
      assert.ok(true);
    });
  });

  module('when user clicks on continue button', function (hooks) {
    let continueButtonName;
    hooks.beforeEach(function () {
      continueButtonName = t('pages.modulix.buttons.grain.continue');
    });

    test('should display next grain', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          { components: [{ type: 'element', element: text1Element }] },
          { components: [{ type: 'element', element: text2Element }] },
        ],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const grainsBeforeAnyAction = screen.getAllByRole('article');
      assert.strictEqual(grainsBeforeAnyAction.length, 1);

      // when
      await clickByName(continueButtonName);

      // then
      const grainsAfteronGrainContinue = screen.getAllByRole('article');
      assert.strictEqual(grainsAfteronGrainContinue.length, 2);
    });

    test('should update navigation', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          { components: [{ type: 'element', element: text1Element }] },
          { components: [{ type: 'element', element: text2Element }] },
        ],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // when
      await clickByName(continueButtonName);

      // then
      assert.dom(screen.getByRole('navigation', { name: 'Étape 2 sur 2' })).exists();
    });

    test('should give focus on the last grain when appearing', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const text3Element = { content: 'content 3', type: 'text' };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          { components: [{ type: 'element', element: text1Element }] },
          { components: [{ type: 'element', element: text2Element }] },
          { components: [{ type: 'element', element: text3Element }] },
        ],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const grainsBeforeAnyAction = screen.getAllByRole('article');
      assert.strictEqual(grainsBeforeAnyAction.length, 1);
      assert.strictEqual(document.activeElement, document.body);

      // when
      await clickByName(continueButtonName);

      // then
      const grainsAfterOneonGrainContinues = screen.getAllByRole('article');
      assert.strictEqual(grainsAfterOneonGrainContinues.length, 2);
      const secondGrain = grainsAfterOneonGrainContinues.at(-1);
      assert.strictEqual(document.activeElement, secondGrain);

      // when
      await clickByName(continueButtonName);

      // then
      const grainsAfterTwoonGrainContinues = screen.getAllByRole('article');
      assert.strictEqual(grainsAfterTwoonGrainContinues.length, 3);
      const thirdGrain = grainsAfterTwoonGrainContinues.at(-1);
      assert.strictEqual(document.activeElement, thirdGrain);
    });

    test('should send an event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const grain1 = { components: [{ type: 'element', element: text1Element }] };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [grain1, { components: [{ type: 'element', element: text2Element }] }],
      });

      const module = store.createRecord('module', {
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      // when
      await clickByName(continueButtonName);

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'GRAIN_CONTINUED',
        data: {
          grainId: grain1.id,
        },
      });
      assert.ok(true);
    });
  });

  module('when user clicks on an answerable element verify button', function () {
    test('should save the element answer', async function (assert) {
      // given
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      const store = this.owner.lookup('service:store');
      const qcuElement = {
        id: 'element-id',
        instruction: 'instruction',
        proposals: [
          { id: '1', content: 'radio1', feedback: { state: 'Correct!', diagnosis: '<p>Good job!</p>' } },
          { id: '2', content: 'radio2', feedback: { state: 'Wrong!', diagnosis: '<p>Try again!</p>' } },
        ],
        type: 'qcu',
        solution: '1',
        isAnswerable: true,
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ components: [{ type: 'element', element: qcuElement }] }],
      });

      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage', { id: 'passage-id' });

      const saveStub = sinon.stub();
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub });
      store.createRecord = createRecordMock;

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // when
      await clickByName(qcuElement.proposals[0].content);
      await clickByName(t('pages.modulix.buttons.activity.verify'));

      // then
      sinon.assert.calledWith(saveStub, { adapterOptions: { passageId: passage.id } });
      assert.ok(true);
    });
  });

  module('when user clicks on an answerable element retry button', function (hooks) {
    let clock;

    hooks.beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    hooks.afterEach(function () {
      clock.restore();
    });
    test('should push metrics event', async function (assert) {
      // given
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // given
      const store = this.owner.lookup('service:store');
      const element = {
        id: 'qcu-id',
        type: 'qcu',
        proposals: [
          { id: '1', content: 'radio1', feedback: { state: 'Correct!', diagnosis: '<p>Good job!</p>' } },
          { id: '2', content: 'radio2', feedback: { state: 'Wrong!', diagnosis: '<p>Try again!</p>' } },
        ],
        solution: '1',
        isAnswerable: true,
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });
      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      // We are adding a stub for create record to avoid calling
      // answers API in an integration test
      store.createRecord = sinon.stub().returns({
        save: sinon.stub(),
      });

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      await click(screen.getByLabelText('radio2'));
      await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
      await clock.tickAsync(VERIFY_RESPONSE_DELAY);
      const retryButton = screen.getByRole('button', { name: t('pages.modulix.buttons.activity.retry') });
      await click(retryButton);

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton réessayer`, {
        category: 'Modulix',
        moduleId: module.id,
        elementId: element.id,
      });
      assert.ok(true);
    });
  });

  module('when user opens an image alternative text modal', function () {
    test('should push metrics event', async function (assert) {
      // given
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // given
      const store = this.owner.lookup('service:store');
      const element = {
        id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
        type: 'image',
        url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
        alt: "Dessin détaillé dans l'alternative textuelle",
        alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });
      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      // when
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      await clickByName("Afficher l'alternative textuelle");

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton alternative textuelle`, {
        category: 'Modulix',
        moduleId: module.id,
        elementId: element.id,
      });
      assert.ok(true);
    });

    test('should send an event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = {
        id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
        type: 'image',
        url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
        alt: "Dessin détaillé dans l'alternative textuelle",
        alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });
      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      await click(screen.getByRole('button', { name: t('pages.modulix.buttons.element.alternativeText') }));

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'IMAGE_ALTERNATIVE_TEXT_OPENED',
        data: {
          elementId: element.id,
        },
      });
      assert.ok(true);
    });

    module('when image is in a stepper', function () {
      test('should push metrics event', async function (assert) {
        // given
        const metrics = this.owner.lookup('service:pix-metrics');
        metrics.trackEvent = sinon.stub();

        // given
        const store = this.owner.lookup('service:store');
        const imageElement = {
          id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
          type: 'image',
          url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
          alt: "Dessin détaillé dans l'alternative textuelle",
          alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
        };
        const step = { elements: [imageElement] };
        const section = store.createRecord('section', {
          id: 'section1',
          type: 'blank',
          grains: [
            {
              id: '123',
              components: [{ type: 'stepper', steps: [step] }],
            },
          ],
        });
        const module = store.createRecord('module', {
          id: 'module-id',
          slug: 'module-slug',
          title: 'Module title',
          sections: [section],
        });
        const passage = store.createRecord('passage');

        // when
        await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
        await clickByName("Afficher l'alternative textuelle");

        // then
        sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton alternative textuelle`, {
          category: 'Modulix',
          moduleId: module.id,
          elementId: imageElement.id,
        });
        assert.ok(true);
      });
    });
  });

  module('when user opens a video transcription modal', function () {
    test('should push metrics event', async function (assert) {
      // given
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // given
      const store = this.owner.lookup('service:store');
      const element = {
        id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
        type: 'video',
        title: 'Vidéo de présentation de Pix',
        url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
        subtitles: '',
        transcription: '<p>transcription</p>',
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });
      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      // when
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      await clickByName('Afficher la transcription');

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton transcription`, {
        category: 'Modulix',
        moduleId: module.id,
        elementId: element.id,
      });
      assert.ok(true);
    });

    test('should record a passage event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = {
        id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
        type: 'video',
        title: 'Vidéo de présentation de Pix',
        url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
        subtitles: '',
        transcription: '<p>transcription</p>',
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });
      const module = store.createRecord('module', {
        id: 'module-id',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      await click(screen.getByRole('button', { name: 'Afficher la transcription' }));

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'VIDEO_TRANSCRIPTION_OPENED',
        data: {
          elementId: element.id,
        },
      });
      assert.ok(true);
    });

    module('when video is in a stepper', function () {
      test('should push metrics event', async function (assert) {
        // given
        const metrics = this.owner.lookup('service:pix-metrics');
        metrics.trackEvent = sinon.stub();

        // given
        const store = this.owner.lookup('service:store');
        const videoElement = {
          id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
          type: 'video',
          title: 'Vidéo de présentation de Pix',
          url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
          subtitles: '',
          transcription: '<p>transcription</p>',
        };
        const step = { elements: [videoElement] };
        const section = store.createRecord('section', {
          id: 'section1',
          type: 'blank',
          grains: [
            {
              id: '123',
              components: [{ type: 'stepper', steps: [step] }],
            },
          ],
        });
        const module = store.createRecord('module', {
          id: 'module-id',
          slug: 'module-slug',
          title: 'Module title',
          sections: [section],
        });
        const passage = store.createRecord('passage');

        // when
        await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
        await clickByName('Afficher la transcription');

        // then
        sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton transcription`, {
          category: 'Modulix',
          moduleId: module.id,
          elementId: videoElement.id,
        });
        assert.ok(true);
      });
    });
  });

  module('when user clicks on next step button', function () {
    test('should push metrics event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const step1 = { elements: [text1Element] };
      const step2 = { elements: [text2Element] };
      const grain = {
        id: '123',
        components: [{ type: 'stepper', steps: [step1, step2] }],
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [grain],
      });

      const module = store.createRecord('module', {
        id: '1',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');
      const onStepperNextStepButtonName = t('pages.modulix.buttons.stepper.next.ariaLabel');

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // when
      await clickByName(onStepperNextStepButtonName);

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton suivant du stepper`, {
        category: 'Modulix',
        moduleId: module.id,
        grainId: grain.id,
        step: 1,
      });
      assert.ok(true);
    });

    test('should send an event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const text1Element = { content: 'content', type: 'text' };
      const text2Element = { content: 'content 2', type: 'text' };
      const text3Element = { content: 'content 3', type: 'text' };
      const step1 = { elements: [text1Element] };
      const step2 = { elements: [text2Element] };
      const step3 = { elements: [text3Element] };
      const grain = {
        id: '123',
        components: [{ type: 'stepper', steps: [step1, step2, step3] }],
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [grain],
      });

      const module = store.createRecord('module', {
        id: '1',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');
      const onStepperNextStepButtonName = t('pages.modulix.buttons.stepper.next.ariaLabel');

      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      // when
      await clickByName(onStepperNextStepButtonName);
      await clickByName(onStepperNextStepButtonName);

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'STEPPER_NEXT_STEP',
        data: {
          grainId: grain.id,
          stepNumber: 2,
        },
      });
      assert.ok(true);
    });
  });

  module('when there is no more grain to display', function () {
    test('should display the terminate button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = { type: 'text', isAnswerable: false };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ title: 'Grain title', components: [{ type: 'element', element }] }],
      });

      const module = store.createRecord('module', { slug: 'module-slug', title: 'Module title', sections: [section] });
      const passage = store.createRecord('passage');

      // when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.terminate') })).exists();
    });

    module('when there is an answerable element', function () {
      module('and it is not answered', function () {
        test('should display the terminate button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const qcuElement = {
            instruction: 'instruction',
            proposals: ['radio1', 'radio2'],
            type: 'qcu',
          };
          const section = store.createRecord('section', {
            id: 'section1',
            type: 'blank',
            grains: [
              {
                title: 'Grain title',
                components: [{ type: 'element', element: qcuElement }],
              },
            ],
          });

          const module = store.createRecord('module', {
            slug: 'module-slug',
            title: 'Module title',
            sections: [section],
          });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

          // then
          assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.terminate') })).exists();
        });
      });

      module('and it answered', function () {
        test('should display the terminate button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const qcuElement = {
            instruction: 'instruction',
            proposals: ['radio1', 'radio2'],
            type: 'qcu',
          };
          const section = store.createRecord('section', {
            id: 'section1',
            type: 'blank',
            grains: [
              {
                title: 'Grain title',
                components: [{ type: 'element', element: qcuElement }],
              },
            ],
          });

          const module = store.createRecord('module', {
            slug: 'module-slug',
            title: 'Module title',
            sections: [section],
          });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

          // then
          assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.terminate') })).exists();
        });
      });
    });

    module('when there is a stepper', function () {
      module('when it is not finished', function () {
        test('should display the terminate button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const textElement = { type: 'text', isAnswerable: false };
          const qcuElement = {
            instruction: 'instruction',
            proposals: ['radio1', 'radio2'],
            type: 'qcu',
          };
          const section = store.createRecord('section', {
            id: 'section1',
            type: 'blank',
            grains: [
              {
                title: 'Grain title',
                components: [{ type: 'stepper', steps: [{ elements: [textElement] }, { elements: [qcuElement] }] }],
              },
            ],
          });

          const module = store.createRecord('module', {
            slug: 'module-slug',
            title: 'Module title',
            sections: [section],
          });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.terminate') })).exists();
        });
      });

      module('when it is finished', function () {
        test('should display the terminate button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const text1Element = { type: 'text', isAnswerable: false };
          const text2Element = { type: 'text', isAnswerable: false };
          const section = store.createRecord('section', {
            id: 'section1',
            type: 'blank',
            grains: [
              {
                title: 'Grain title',
                components: [{ type: 'stepper', steps: [{ elements: [text1Element] }, { elements: [text2Element] }] }],
              },
            ],
          });

          const module = store.createRecord('module', {
            slug: 'module-slug',
            title: 'Module title',
            sections: [section],
          });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.terminate') })).exists();
        });
      });
    });
  });

  module('when a download element file is downloaded', function () {
    test('should send a passage-event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const downloadedFormat = '.pdf';
      const downloadElement = {
        id: 'id',
        type: 'download',
        files: [{ format: downloadedFormat, url: 'https://example.org/modulix/placeholder-doc.pdf' }],
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            id: '123',
            components: [{ type: 'element', element: downloadElement }],
          },
        ],
      });

      const module = store.createRecord('module', {
        id: '1',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // when
      const downloadLink = await screen.getByRole('link', {
        name: t('pages.modulix.download.label', { format: downloadedFormat }),
      });
      downloadLink.addEventListener('click', (event) => {
        event.preventDefault();
      });
      downloadLink.click();

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'FILE_DOWNLOADED',
        data: {
          elementId: downloadElement.id,
          format: downloadedFormat,
          filename: 'placeholder-doc.pdf',
        },
      });
      assert.ok(true);
    });

    module('when download is in a stepper', function () {
      test('should send a passage-event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const downloadedFormat = '.pdf';
        const downloadElement = {
          id: 'downloaded-element-id',
          type: 'download',
          files: [{ format: downloadedFormat, url: 'https://example.org/modulix/placeholder-doc.pdf' }],
        };
        const step = { elements: [downloadElement] };
        const section = store.createRecord('section', {
          id: 'section1',
          type: 'blank',
          grains: [
            {
              id: '123-stepper',
              components: [{ type: 'stepper', steps: [step] }],
            },
          ],
        });

        const module = store.createRecord('module', {
          id: '1',
          slug: 'module-slug',
          title: 'Module title with stepper',
          sections: [section],
        });
        const passage = store.createRecord('passage');

        const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

        // when
        const downloadLink = await screen.getByRole('link', {
          name: t('pages.modulix.download.label', { format: downloadedFormat }),
        });
        downloadLink.addEventListener('click', (event) => {
          event.preventDefault();
        });
        downloadLink.click();

        // then
        sinon.assert.calledWithExactly(passageEventRecordStub, {
          type: 'FILE_DOWNLOADED',
          data: {
            elementId: downloadElement.id,
            format: downloadedFormat,
            filename: 'placeholder-doc.pdf',
          },
        });
        assert.ok(true);
      });
    });
  });

  module('when user clicks on terminate button', function () {
    test('should push an event', async function (assert) {
      // given
      class PassageAdapterStub extends ApplicationAdapter {
        terminate = sinon.stub().resolves();
      }
      this.owner.register('adapter:passage', PassageAdapterStub);
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();
      const store = this.owner.lookup('service:store');
      const passageEventsService = this.owner.lookup('service:passage-events');
      passageEventsService.record = sinon.stub();

      const qcuElement = {
        instruction: 'instruction',
        proposals: ['radio1', 'radio2'],
        type: 'qcu',
      };
      const grain = {
        id: '123',
        title: 'Grain title',
        components: [{ type: 'element', element: qcuElement }],
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [grain],
      });

      const module = store.createRecord('module', {
        id: 'module-title',
        slug: 'module-slug',
        title: 'Module title',
        sections: [section],
      });
      const passage = store.createRecord('passage');
      passage.terminate = sinon.stub();
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      // when
      await clickByName(t('pages.modulix.buttons.grain.terminate'));

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton Terminer`, {
        category: 'Modulix',
        moduleId: module.id,
        grainId: grain.id,
      });
      sinon.assert.calledWithExactly(passageEventsService.record, {
        type: 'PASSAGE_TERMINATED',
      });
      assert.ok(true);
    });
  });

  module('when user opens Expand element', function () {
    test('should send a passage-event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const expandElement = {
        id: 'f5e7ce21-b71d-4054-8886-a4e9a17016ff',
        type: 'expand',
        isAnswerable: false,
        title: 'Mon Expand',
        content: "<p>Ceci est le contenu d'un expand dans mon module</p>",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            title: 'Grain title',
            type: 'discovery',
            id: '123-abc',
            components: [{ type: 'element', element: expandElement }],
          },
        ],
      });
      const module = store.createRecord('module', {
        title: 'Didacticiel',
        slug: 'module-slug',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      //  when
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      const expandSummarySelector = '.modulix-expand__title';
      await click(expandSummarySelector);

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'EXPAND_OPENED',
        data: {
          elementId: expandElement.id,
        },
      });
      assert.ok(true);
    });

    test('should push metrics event with "Ouverture" event name', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const expandElement = {
        id: 'f5e7ce21-b71d-4054-8886-a4e9a17016ff',
        type: 'expand',
        isAnswerable: false,
        title: 'Mon Expand',
        content: "<p>Ceci est le contenu d'un expand dans mon module</p>",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            title: 'Grain title',
            type: 'discovery',
            id: '123-abc',
            components: [{ type: 'element', element: expandElement }],
          },
        ],
      });

      const module = store.createRecord('module', {
        title: 'Didacticiel',
        slug: 'module-slug',
        sections: [section],
      });
      const passage = store.createRecord('passage');
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      //  when
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const expandSummarySelector = '.modulix-expand__title';
      await click(expandSummarySelector);

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Ouverture de l'élément Expand`, {
        category: 'Modulix',
        moduleId: module.id,
        elementId: expandElement.id,
      });
      assert.ok(true);
    });

    module('when expand is in a stepper', function () {
      test('should push metrics event', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const expandElement = {
          id: 'f5e7ce21-b71d-4054-8886-a4e9a17016ff',
          type: 'expand',
          isAnswerable: false,
          title: 'Mon Expand',
          content: "<p>Ceci est le contenu d'un expand dans mon module</p>",
        };

        const step = { elements: [expandElement] };
        const section = store.createRecord('section', {
          id: 'section1',
          type: 'blank',
          grains: [
            {
              title: 'Grain title',
              type: 'discovery',
              id: '123-abc',
              components: [{ type: 'stepper', steps: [step] }],
            },
          ],
        });

        const module = store.createRecord('module', {
          title: 'Didacticiel',
          slug: 'module-slug',
          sections: [section],
        });
        const passage = store.createRecord('passage');
        const metrics = this.owner.lookup('service:pix-metrics');
        metrics.trackEvent = sinon.stub();

        //  when
        await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

        const expandSummarySelector = '.modulix-expand__title';
        await click(expandSummarySelector);

        // then
        sinon.assert.calledWithExactly(metrics.trackEvent, `Ouverture de l'élément Expand`, {
          category: 'Modulix',
          moduleId: module.id,
          elementId: expandElement.id,
        });
        assert.ok(true);
      });
    });
  });

  module('when user closes Expand element', function () {
    test('should push metrics event with "Fermeture" event name', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const expandElement = {
        id: 'f5e7ce21-b71d-4054-8886-a4e9a17016ff',
        type: 'expand',
        isAnswerable: false,
        title: 'Mon Expand',
        content: "<p>Ceci est le contenu d'un expand dans mon module</p>",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            title: 'Grain title',
            type: 'discovery',
            id: '123-abc',
            components: [{ type: 'element', element: expandElement }],
          },
        ],
      });

      const module = store.createRecord('module', {
        title: 'Didacticiel',
        slug: 'module-slug',
        sections: [section],
      });
      const passage = store.createRecord('passage');
      const metrics = this.owner.lookup('service:pix-metrics');
      metrics.trackEvent = sinon.stub();

      //  when
      const screen = await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);

      const details = await screen.getByRole('group');
      details.open = true;

      const expandSummarySelector = '.modulix-expand__title';
      await click(expandSummarySelector);

      // then
      sinon.assert.calledWithExactly(metrics.trackEvent, `Fermeture de l'élément Expand`, {
        category: 'Modulix',
        moduleId: module.id,
        elementId: expandElement.id,
      });
      assert.ok(true);
    });

    test('should send a passage-event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const expandElement = {
        id: 'f5e7ce21-b71d-4054-8886-a4e9a17016ff',
        type: 'expand',
        isAnswerable: false,
        title: 'Mon Expand',
        content: "<p>Ceci est le contenu d'un expand dans mon module</p>",
      };
      const section = store.createRecord('section', {
        id: 'section1',
        type: 'blank',
        grains: [
          {
            title: 'Grain title',
            type: 'discovery',
            id: '123-abc',
            components: [{ type: 'element', element: expandElement }],
          },
        ],
      });
      const module = store.createRecord('module', {
        title: 'Didacticiel',
        slug: 'module-slug',
        sections: [section],
      });
      const passage = store.createRecord('passage');

      //  when
      await render(<template><ModulePassage @module={{module}} @passage={{passage}} /></template>);
      const expandSummarySelector = '.modulix-expand__title';
      await click(expandSummarySelector);
      await click(expandSummarySelector);

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'EXPAND_CLOSED',
        data: {
          elementId: expandElement.id,
        },
      });
      assert.ok(true);
    });
  });
});
