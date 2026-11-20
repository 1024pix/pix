import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModuleRecap from 'mon-pix/components/module/instruction/recap';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Recap', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when module has beta status', function () {
    test('should display a banner at the top of the screen for module recap', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description: '<p>Description</p>',
        duration: 12,
        level: 'novice',
        objectives: ['Objectif 1'],
      };
      const module = store.createRecord('module', { title: 'Module title', isBeta: true, details });

      // when
      const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

      // then
      assert.dom(screen.getByRole('alert')).exists();
      assert.dom(screen.getByText(t('pages.modulix.beta-banner'))).exists();
    });
  });

  module('when module does not have beta status', function () {
    test('should not display a banner at the top of the screen for module recap', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const details = {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description: '<p>Description</p>',
        duration: 12,
        level: 'novice',
        objectives: ['Objectif 1'],
      };
      const module = store.createRecord('module', { title: 'Module title', isBeta: false, details });

      // when
      const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

      // then
      assert.dom(screen.queryByText(t('pages.modulix.beta-banner'))).doesNotExist();
    });
  });

  test('should display the details of a given module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const details = {
      image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
      description: '<p>Description</p>',
      duration: 12,
      level: 'novice',
      objectives: ['Objectif 1'],
    };
    const module = store.createRecord('module', { title: 'Module title', details });

    // when
    const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('pages.modulix.recap.title') }));
    assert.ok(
      screen.getByText((content, element) => {
        return element.innerHTML.trim() === t('pages.modulix.recap.subtitle');
      }),
    );
    assert.ok(screen.getByRole('listitem').textContent.includes('Objectif 1'));
  });

  test('should display link to go to homepage', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const module = store.createRecord('module', { id: 'mon-slug', title: 'Module title', isBeta: true });
    // when
    const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: t('pages.modulix.recap.goToHomepage') })).exists();
  });

  module('when a redirection url is set', function () {
    module('Continue button', function () {
      test('should display link to a custom url when not redict to internal Application', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const module = store.createRecord('module', {
          id: 'mon-slug',
          title: 'Module title',
          isBeta: true,
          redirectionUrl: 'https://some-url.fr',
        });
        // when
        const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

        // then
        const link = screen.getByRole('link', { name: t('pages.modulix.recap.goToHomepage') });

        // then
        assert.strictEqual(link.getAttribute('href'), module.redirectionUrl);
      });

      test('should call transitionTo with custom url when redirect to internal Application', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const router = this.owner.lookup('service:router');
        const transitionToStub = sinon.stub(router, 'transitionTo');
        const module = store.createRecord('module', {
          id: 'mon-slug',
          title: 'Module title',
          isBeta: true,
          redirectionUrl: '/parcours/combinix3',
        });
        // when
        const screen = await render(<template><ModuleRecap @module={{module}} /></template>);
        const button = screen.getByRole('button', { name: t('pages.modulix.recap.goToHomepage') });
        await click(button);

        // then

        assert.ok(transitionToStub.calledWithExactly(module.redirectionUrl));
      });
    });

    module('Quit button', function () {
      test('should display link to a custom url when not redict to internal Application', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const module = store.createRecord('module', {
          id: 'mon-slug',
          title: 'Module title',
          isBeta: true,
          redirectionUrl: 'https://some-url.fr',
        });
        // when
        const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

        // then
        const link = screen.getByRole('link', { name: t('pages.modulix.recap.backToModuleDetails') });

        // then
        assert.strictEqual(link.getAttribute('href'), module.redirectionUrl);
      });

      test('should call transitionTo with custom url when redirect to internal Application', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const router = this.owner.lookup('service:router');
        const transitionToStub = sinon.stub(router, 'transitionTo');
        const module = store.createRecord('module', {
          id: 'mon-slug',
          title: 'Module title',
          isBeta: true,
          redirectionUrl: '/parcours/combinix3',
        });
        // when
        const screen = await render(<template><ModuleRecap @module={{module}} /></template>);
        const button = screen.getByRole('button', { name: t('pages.modulix.recap.backToModuleDetails') });
        await click(button);

        // then

        assert.ok(transitionToStub.calledWithExactly(module.redirectionUrl));
      });
    });
  });
});
