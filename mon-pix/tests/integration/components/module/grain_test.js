import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
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

  module('when grain has transition', function () {
    test('should display transition', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { title: 'Grain title' });
      const transition = { content: 'transition text' };
      this.set('grain', grain);
      this.set('transition', transition);

      // when
      const screen = await render(hbs`<Module::Grain @grain={{this.grain}} @transition={{this.transition}} />`);

      // then
      assert.ok(screen.getByText('transition text'));
    });
  });

  module('when grain has not transition', function () {
    test('should not create header', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { title: 'Grain title' });
      this.set('grain', grain);

      // when
      await render(hbs`<Module::Grain @grain={{this.grain}} />`);

      // then
      assert.dom('.grain__header').doesNotExist();
    });
  });

  module('when element is a text', function () {
    test('should display text element', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = store.createRecord('text', {
        content: 'element content',
        type: 'texts',
        isAnswerable: false,
      });
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
        isAnswerable: true,
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

  module('when element is a qrocm', function () {
    test('should display qrocm element', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const qrocmElement = store.createRecord('qrocm', {
        instruction: 'Mon instruction',
        proposals: [
          {
            type: 'text',
            content: '<p>Le symbole</>',
          },
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          },
          {
            input: 'premiere-partie',
            type: 'select',
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 2',
            defaultValue: '',
            options: [
              {
                id: '1',
                content: "l'identifiant",
              },
              {
                id: '2',
                content: "le fournisseur d'adresse mail",
              },
            ],
          },
        ],
        type: 'qrocms',
        isAnswerable: true,
      });
      const elements = [qrocmElement];
      const grain = store.createRecord('grain', { title: 'Grain title', elements });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`<Module::Grain @grain={{this.grain}} />`);

      // then
      assert.ok(screen);
      assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
    });
  });

  module('when element is an image', function () {
    test('should display image element', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const url =
        'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';
      const imageElement = store.createRecord('image', {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        type: 'images',
      });
      const elements = [imageElement];
      const grain = store.createRecord('grain', { title: 'Grain title', elements });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`<Module::Grain @grain={{this.grain}} />`);

      // then
      assert.ok(screen.getByRole('img', { name: 'alt text' }).hasAttribute('src', url));
    });
  });

  module('when all elements are answered', function () {
    test('should not display skip button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
      const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
      this.set('grain', grain);

      const correction = store.createRecord('correction-response');
      store.createRecord('element-answer', { element, correction });
      assert.true(grain.allElementsAreAnswered);

      // when
      const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

      // then
      assert
        .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.grain.skip') }))
        .doesNotExist();
    });

    module('when canDisplayContinueButton is true', function () {
      test('should display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        const correction = store.createRecord('correction-response');
        store.createRecord('element-answer', { element, correction });
        assert.true(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
      });
    });
    module('when canDisplayContinueButton is false', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        assert.false(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{false}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });
  });

  module('when not any element are answered', function () {
    test('should display skip button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
      const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
      this.set('grain', grain);

      assert.false(grain.allElementsAreAnswered);

      // when
      const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

      // then
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.grain.skip') })).exists();
    });

    module('when canDisplayContinueButton is true', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        assert.false(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });
    module('when canDisplayContinueButton is false', function () {
      test('should not display continue button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = store.createRecord('element', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
        this.set('grain', grain);

        assert.false(grain.allElementsAreAnswered);

        // when
        const screen = await render(hbs`
            <Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{false}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });
  });

  module('when continueAction is called', function () {
    test('should call continueAction pass in argument and push event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = store.createRecord('text', { type: 'texts', isAnswerable: false });
      const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
      store.createRecord('module', { id: 'module-id', grains: [grain] });
      this.set('grain', grain);

      const stubContinueAction = sinon.stub();
      this.set('continueAction', stubContinueAction);
      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      // when
      await render(
        hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} @continueAction={{this.continueAction}} />`,
      );
      await clickByName('Continuer');

      // then
      sinon.assert.calledOnce(stubContinueAction);
      sinon.assert.calledWithExactly(metrics.add, {
        event: 'custom-event',
        'pix-event-category': 'Modulix',
        'pix-event-action': `Passage du module : ${this.grain.module.id}`,
        'pix-event-name': `Click sur le bouton continuer du grain : ${this.grain.id}`,
      });
      assert.ok(true);
    });
  });

  module('when skipAction is called', function () {
    test('should call skipAction pass in argument and push event', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
      const grain = store.createRecord('grain', { title: 'Grain title', elements: [element] });
      store.createRecord('module', { id: 'module-id', grains: [grain] });
      this.set('grain', grain);

      const skipActionStub = sinon.stub();
      this.set('skipAction', skipActionStub);
      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      this.set('continueAction', () => {});

      // when
      await render(
        hbs`<Module::Grain @grain={{this.grain}} @canDisplayContinueButton={{true}} @continueAction={{this.continueAction}} @skipAction={{this.skipAction}} />`,
      );
      await clickByName(this.intl.t('pages.modulix.buttons.grain.skip'));

      // then
      sinon.assert.calledOnce(skipActionStub);
      sinon.assert.calledWithExactly(metrics.add, {
        event: 'custom-event',
        'pix-event-category': 'Modulix',
        'pix-event-action': `Passage du module : ${this.grain.module.id}`,
        'pix-event-name': `Click sur le bouton passer du grain : ${this.grain.id}`,
      });
      assert.ok(true);
    });
  });
});
