import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import DownloadImportTemplateLink from 'pix-orga/components/import/download-import-template-link';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | DownloadImportTemplateLink', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should be render when learner feature is enabled', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      hasLearnerImportFeature = true;
      canAccessMissionsPage = false;
      isSUPManagingStudents = false;
      organization = {
        id: 777,
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><DownloadImportTemplateLink /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('pages.sup-organization-participants.actions.download-template') }));
  });

  test('it should be render when organization is SupManagingStudent', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      hasLearnerImportFeature = false;
      canAccessMissionsPage = false;
      isSUPManagingStudents = true;
      organization = {
        id: 777,
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><DownloadImportTemplateLink /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('pages.sup-organization-participants.actions.download-template') }));
  });

  test('it should not render when organization can access mission page', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      hasLearnerImportFeature = true;
      canAccessMissionsPage = true;
      isSUPManagingStudents = false;
      organization = {
        id: 777,
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><DownloadImportTemplateLink /></template>);

    // then
    assert.notOk(
      screen.queryByRole('link', { name: t('pages.sup-organization-participants.actions.download-template') }),
    );
  });
});
