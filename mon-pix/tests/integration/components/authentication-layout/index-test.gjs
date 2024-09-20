import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import AuthenticationLayout from 'mon-pix/components/authentication-layout';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication-layout/index', function (hooks) {
  setupIntlRenderingTest(hooks);
  test('it displays an authentication layout', async function (assert) {
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
    const screen = await render(<template><AuthenticationLayout /></template>);

    //then
    assert.ok(screen.getAllByRole('presentation')[0].hasAttribute('src', '/images/illustrations/authentication.svg'));
    assert.ok(screen.getAllByRole('presentation')[1].hasAttribute('src', '/images/pix-logo.svg'));
    assert.dom(screen.getByRole('contentinfo')).exists();
    assert.dom(screen.getByRole('banner')).exists();
    assert.dom(screen.queryByRole('button', { name: t('pages.inscription.choose-language-aria-label') })).exists();
  });
});
