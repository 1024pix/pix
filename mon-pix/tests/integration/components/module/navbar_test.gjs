import { render } from '@1024pix/ember-testing-library';
import ModulixNavbar from 'mon-pix/components/module/navbar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Navbar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when at first step', function () {
    test('should display step 1 with empty progress bar', async function (assert) {
      //  when
      const screen = await render(<template><ModulixNavbar @currentStep={{1}} @totalSteps={{3}} /></template>);

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 3' })).exists();
      assert.dom(screen.getByRole('progressbar', { name: 'Avancement du module' })).hasValue(0);
    });
  });

  module('when at step 2 of 3', function () {
    test('should display step 2 with half-filled progress bar', async function (assert) {
      //  when
      const screen = await render(<template><ModulixNavbar @currentStep={{2}} @totalSteps={{3}} /></template>);

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 2 sur 3' })).exists();
      assert.dom(screen.getByRole('progressbar', { name: 'Avancement du module' })).hasValue(50);
    });
  });

  module('when at last step', function () {
    test('should display step 3 with full-filled progress bar', async function (assert) {
      //  when
      const screen = await render(<template><ModulixNavbar @currentStep={{3}} @totalSteps={{3}} /></template>);

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 3 sur 3' })).exists();
      assert.dom(screen.getByRole('progressbar', { name: 'Avancement du module' })).hasValue(100);
    });
  });

  module('when there is only one step', function () {
    test('should display step 1/1 and a full-filled progress bar', async function (assert) {
      //  when
      const screen = await render(<template><ModulixNavbar @currentStep={{1}} @totalSteps={{1}} /></template>);

      // then
      assert.ok(screen);
      assert.dom(screen.getByRole('navigation', { name: 'Étape 1 sur 1' })).exists();
      assert.dom(screen.getByRole('progressbar', { name: 'Avancement du module' })).hasValue(100);
    });
  });
});
