import { render } from '@1024pix/ember-testing-library';
import AuthenticationLayout from 'mon-pix/components/authentication-layout';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication-layout/index', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays an authentication layout', async function (assert) {
    //given
    const currentDomain = this.owner.lookup('service:currentDomain');
    sinon.stub(currentDomain, 'isFranceDomain').value(false);
    sinon.stub(currentDomain, 'getExtension').returns('org');

    //when
    const screen = await render(<template><AuthenticationLayout /></template>);

    //then
    assert.dom(screen.getByRole('contentinfo')).exists();
    assert.dom(screen.getByRole('banner')).exists();
    assert.dom(screen.queryByRole('button', { name: t('components.locale-switcher.label') })).exists();
  });
});
