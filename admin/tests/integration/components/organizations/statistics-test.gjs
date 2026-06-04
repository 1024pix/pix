import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Statistics from 'pix-admin/components/organizations/statistics';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Organizations | Statistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('displays total participants count', async function (assert) {
    // given
    const statistics = store.createRecord('organization-statistic', {
      totalParticipantsCount: 1234,
    });

    // when
    const screen = await render(<template><Statistics @statistics={{statistics}} /></template>);

    // then
    assert.strictEqual(
      screen.getByRole('term').textContent.trim(),
      t('components.organizations.statistics.total-participants-count.title'),
    );
    assert.strictEqual(screen.getByRole('definition').textContent.trim(), '1234');
    assert.ok(
      screen.getByText(t('components.organizations.statistics.total-participants-count.info'), { hidden: true }),
    );
  });
});
