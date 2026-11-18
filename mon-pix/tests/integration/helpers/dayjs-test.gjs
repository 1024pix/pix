import { render } from '@1024pix/ember-testing-library';
import dayjsDurationHumanize from 'mon-pix/helpers/dayjs-duration-humanize';
import dayjsFormat from 'mon-pix/helpers/dayjs-format';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Helper | dayjs', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    this.owner.lookup('service:dayjs').setLocale('en');
  });

  module('dayjs-format', function () {
    test('formats the date with the current locale', async function (assert) {
      // given
      this.owner.lookup('service:dayjs').setLocale('fr');

      // when
      const screen = await render(<template>{{dayjsFormat "2024-03-05" "D MMMM YYYY"}}</template>);

      // then
      assert.ok(screen.getByText('5 mars 2024'));
    });
  });

  module('dayjs-duration-humanize', function () {
    test('humanizes the duration with the current locale', async function (assert) {
      // given
      this.owner.lookup('service:dayjs').setLocale('fr');

      // when
      const screen = await render(<template>{{dayjsDurationHumanize 120 "seconds"}}</template>);

      // then
      assert.ok(screen.getByText('2 minutes'));
    });
  });
});
