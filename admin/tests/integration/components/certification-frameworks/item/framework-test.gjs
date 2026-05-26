import { render } from '@1024pix/ember-testing-library';
import Framework from 'pix-admin/components/certification-frameworks/item/framework';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-frameworks/item/framework', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    store.queryRecord = sinon.stub().resolves({ history: [] });
  });

  module('#frameworkHistory', function () {
    test('it should display the framework history when there are existing framework versions', async function (assert) {
      // given
      store.queryRecord = sinon.stub().resolves({ history: ['20250101080000', '20240101080000'] });

      // when
      const screen = await render(<template><Framework @frameworkKey="DROIT" /></template>);

      // then
      assert
        .dom(
          screen.getByRole('table', {
            name: t('components.certification-frameworks.item.framework.history.table.caption'),
          }),
        )
        .exists();
    });
  });

  module('when the framework is CORE', function () {
    test('it should not display target profiles history section', async function (assert) {
      // when
      const screen = await render(
        <template><Framework @frameworkKey="CORE" @hasTargetProfilesHistory={{false}} /></template>,
      );

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('components.certification-frameworks.target-profiles.history-list.title'),
          }),
        )
        .doesNotExist();
    });
  });

  module('when the framework has target profiles history', function () {
    test('it should display target profiles history section', async function (assert) {
      // given
      const certificationFramework = {
        name: 'DROIT',
        targetProfilesHistory: [{ id: 1, name: 'Profil A', attachedAt: new Date('2024-01-01'), detachedAt: null }],
        reload: sinon.stub().resolves(),
      };

      // when
      const screen = await render(
        <template>
          <Framework
            @frameworkKey="DROIT"
            @certificationFramework={{certificationFramework}}
            @hasTargetProfilesHistory={{true}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('components.certification-frameworks.target-profiles.history-list.title'),
          }),
        )
        .exists();
    });

    test('it should call reload on the certification framework', async function (assert) {
      // given
      const certificationFramework = {
        name: 'DROIT',
        targetProfilesHistory: [],
        reload: sinon.stub().resolves(),
      };

      // when
      await render(
        <template>
          <Framework
            @frameworkKey="DROIT"
            @certificationFramework={{certificationFramework}}
            @hasTargetProfilesHistory={{true}}
          />
        </template>,
      );

      // then
      assert.ok(certificationFramework.reload.calledOnce);
    });
  });
});
