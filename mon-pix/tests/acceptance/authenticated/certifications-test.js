import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Authenticated | Certification-V2', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(function () {
    server.create('feature-toggle', { id: 0, isNewCertificationPageEnabled: true });
    user = server.create('user', 'withEmail');
  });

  test('should display dashboard page', async function (assert) {
    // given
    await authenticateByEmail(user);

    // when
    const screen = await visit('/certifications');

    // then
    assert
      .dom(screen.getByRole('button', { name: t('pages.certifications-dashboard.enrolment-banner.action') }))
      .exists();

    assert
      .dom(screen.getByRole('heading', { name: t('pages.certifications-dashboard.user-certifications.title') }))
      .exists();
  });
});
