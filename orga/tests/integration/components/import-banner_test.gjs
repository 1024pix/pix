import { render } from '@1024pix/ember-testing-library';
import ImportBanner from 'pix-orga/components/import-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ImportBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('success', function () {
    test('display success banner with warnings', async function (assert) {
      const store = this.owner.lookup('service:store');
      const organizationImportDetail = store.createRecord('organization-import-detail', {
        status: 'IMPORTED',
        createdBy: { firstName: 'Richard', lastName: 'Aldana' },
        updatedAt: new Date(2020, 10, 2),
        errors: [{ code: 'UAI_MISMATCHED', meta: {} }],
      });
      // when
      const isLoading = false;
      const screen = await render(
        <template>
          <ImportBanner @isLoading={{isLoading}} @organizationImportDetail={{organizationImportDetail}} />
        </template>,
      );

      assert.ok(
        screen.getByText(
          this.intl.t('pages.organization-participants-import.global-success', {
            firstName: 'Richard',
            lastName: 'Aldana',
            date: new Date(2020, 10, 2).toLocaleDateString(),
          }),
        ),
      );
      assert.ok(screen.getByRole('link', 'mailto:sup@pix.fr'));
    });
  });
});
