import { render } from '@1024pix/ember-testing-library';
import Title from 'pix-orga/components/places/title';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places::Title', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2023-11-15') });
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('it should display date of today', async function (assert) {
    // given
    const today = new Date();
    const intlService = this.owner.lookup('service:intl');

    // when
    const screen = await render(<template><Title /></template>);

    // then
    assert.ok(screen.getByText(t('pages.places.title')));
    assert.ok(screen.getByText(t('pages.places.before-date'), { exact: false }));
    assert.ok(screen.getByText(intlService.formatDate(today, { format: 'LLL' }), { exact: false }));
  });
});
