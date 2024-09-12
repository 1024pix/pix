import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Footer from 'mon-pix/components/authentication-layout/footer';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication-layout | footer', function (hooks) {
  setupIntlRenderingTest(hooks);
  test('it displays a language switcher when url has org extension', async function (assert) {
    //given
    class CurrentDomainServiceStub extends Service {
      get isFranceDomain() {
        return false;
      }

      getExtension() {
        return 'org';
      }
    }

    this.owner.register('service:currentDomain', CurrentDomainServiceStub);
    //when
    const screen = await render(<template><Footer /></template>);

    //then

    assert.dom(screen.queryByRole('button', { name: 'Sélectionnez une langue' })).exists();
  });
  test('it displays no language switcher when url has fr extension', async function (assert) {
    //given
    class CurrentDomainServiceStub extends Service {
      get isFranceDomain() {
        return true;
      }

      getExtension() {
        return 'fr';
      }
    }

    this.owner.register('service:currentDomain', CurrentDomainServiceStub);
    //when
    const screen = await render(<template><Footer /></template>);

    //then
    assert.dom(screen.queryByRole('button', { name: 'Sélectionnez une langue' })).doesNotExist();
  });
});
