import { clickByName, render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixNavbar from 'mon-pix/components/module/navbar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Module | Navbar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('HEIGHT', function () {
    test('should return the approximate height of the navbar', function (assert) {
      // when
      const height = ModulixNavbar.HEIGHT;

      // then
      assert.strictEqual(height, 66);
    });
  });

  module('when at first step', function () {
    test('should display step 1 with empty progress bar', async function (assert) {
      // given
      const module = createModule(this.owner);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar @currentStep={{1}} @totalSteps={{3}} @module={{module}} @grainsToDisplay={{module.grains}} />
        </template>,
      );

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 3' })).exists();
      assert.dom('.progress-gauge__bar').hasValue(0);
    });
  });

  module('when at step 2 of 3', function () {
    test('should display step 2 with half-filled progress bar', async function (assert) {
      // given
      const module = createModule(this.owner);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar @currentStep={{2}} @totalSteps={{3}} @module={{module}} @grainsToDisplay={{module.grains}} />
        </template>,
      );

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 2 sur 3' })).exists();
      assert.dom('.progress-gauge__bar').hasValue(50);
    });
  });

  module('when at last step', function () {
    test('should display step 3 with full-filled progress bar', async function (assert) {
      // given
      const module = createModule(this.owner);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar @currentStep={{3}} @totalSteps={{3}} @module={{module}} @grainsToDisplay={{module.grains}} />
        </template>,
      );

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 3 sur 3' })).exists();
      assert.dom('.progress-gauge__bar').hasValue(100);
    });
  });

  module('when there is only one step', function () {
    test('should display step 1/1 and a full-filled progress bar', async function (assert) {
      // given
      const module = createModule(this.owner);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar @currentStep={{1}} @totalSteps={{1}} @module={{module}} @grainsToDisplay={{module.grains}} />
        </template>,
      );

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 1' })).exists();
      assert.dom('.progress-gauge__bar').hasValue(100);
    });
  });

  module('when user opens sidebar', function () {
    test('should display sidebar', async function (assert) {
      // given
      const module = createModule(this.owner);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar @currentStep={{1}} @totalSteps={{3}} @module={{module}} @grainsToDisplay={{module.grains}} />
        </template>,
      );
      const sidebarOpenButton = screen.getByRole('button', { name: 'Afficher les étapes du module' });
      await click(sidebarOpenButton);
      await waitForDialog();

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('dialog', { name: module.title })).exists();
    });

    test('should display steps list in sidebar', async function (assert) {
      // given
      const module = createModule(this.owner);
      const threeFirstGrains = module.grains.slice(0, -1);

      //  when
      const screen = await render(
        <template>
          <ModulixNavbar
            @currentStep={{3}}
            @totalSteps={{4}}
            @module={{module}}
            @grainsToDisplay={{threeFirstGrains}}
          />
        </template>,
      );
      await clickByName('Afficher les étapes du module');
      await waitForDialog();

      // then
      assert.ok(screen);
      const list = screen.getByRole('list');
      assert.dom(list).exists();
      const items = within(list).getAllByRole('listitem');
      assert.strictEqual(items.length, 3);
      assert.strictEqual(items[0].textContent.trim(), t('pages.modulix.grain.tag.discovery'));
      assert.strictEqual(items[1].textContent.trim(), t('pages.modulix.grain.tag.activity'));
      assert.strictEqual(items[2].textContent.trim(), t('pages.modulix.grain.tag.lesson'));
      assert.dom(items[2]).hasAria('current', 'step');
      assert.dom(screen.queryByRole('listitem', { name: t('pages.modulix.grain.tag.summary') })).doesNotExist();
    });
  });
});

function createModule(owner) {
  const store = owner.lookup('service:store');
  const grain1 = store.createRecord('grain', { title: 'Grain title', type: 'discovery' });
  const grain2 = store.createRecord('grain', { title: 'Grain title', type: 'activity' });
  const grain3 = store.createRecord('grain', { title: 'Grain title', type: 'lesson' });
  const grain4 = store.createRecord('grain', { title: 'Grain title', type: 'summary' });
  return store.createRecord('module', {
    title: 'Didacticiel',
    grains: [grain1, grain2, grain3, grain4],
    transitionTexts: [],
  });
}
