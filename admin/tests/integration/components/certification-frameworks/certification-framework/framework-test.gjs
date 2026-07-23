import { render } from '@1024pix/ember-testing-library';
import Framework from 'pix-admin/components/certification-frameworks/certification-framework/framework';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-frameworks/certification-framework/framework', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#frameworkHistory', function () {
    test('it should display the framework history', async function (assert) {
      // given
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'CORE',
        scope: 'CORE',
      });

      // when
      const screen = await render(
        <template><Framework @certificationFramework={{certificationFramework}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('table', {
            name: t('components.certification-frameworks.certification-framework.history.table.caption'),
          }),
        )
        .exists();
      assert
        .dom(screen.getByText(t('components.certification-frameworks.certification-framework.history.table.empty')))
        .exists();
    });
  });

  module('when the framework has no target profile history', function () {
    test('it should not display target profiles history section', async function (assert) {
      // given
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'DROIT',
        scope: 'DROIT',
        versionSummaries: [],
        complementaryCertification: null,
      });

      // when
      const screen = await render(
        <template><Framework @certificationFramework={{certificationFramework}} /></template>,
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
      const certificationFramework = store.createRecord('certification-framework', {
        id: 'DROIT',
        scope: 'DROIT',
        versionSummaries: [],
        complementaryCertification: store.createRecord('complementary-certification', {
          id: 123,
          targetProfilesHistory: [{ id: 1, name: 'Profil A', attachedAt: new Date('2024-01-01'), detachedAt: null }],
        }),
      });

      // when
      const screen = await render(
        <template><Framework @certificationFramework={{certificationFramework}} /></template>,
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
  });
});
