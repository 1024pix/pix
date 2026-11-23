import { render } from '@1024pix/ember-testing-library';
import LearnerHeaderInfo from 'pix-orga/components/ui/learner-header-info';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::LearnerHeaderInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#groupName', function () {
    test('it renders learner header information when there is a groupName', async function (assert) {
      const groupName = t('components.group.SCO');
      const group = '3E';

      const screen = await render(<template><LearnerHeaderInfo @group={{group}} @groupName={{groupName}} /></template>);

      assert.strictEqual(screen.getByRole('term').textContent.trim(), groupName);
      assert.strictEqual(screen.getByRole('definition').textContent.trim(), group);
    });

    test('it does not render learner division header information when there is no group', async function (assert) {
      const groupName = t('components.group.SCO');
      const group = '';

      const screen = await render(<template><LearnerHeaderInfo @groupName={{groupName}} @group={{group}} /></template>);

      assert.strictEqual(screen.queryByText(groupName), null);
    });
  });

  module('#authenticationMethods', function () {
    test('it renders learner header information when there is a connection method', async function (assert) {
      const authenticationMethods = ['email'];

      const screen = await render(
        <template><LearnerHeaderInfo @authenticationMethods={{authenticationMethods}} /></template>,
      );

      assert.strictEqual(
        screen.getByRole('term').textContent.trim(),
        t('pages.sco-organization-participants.table.column.login-method'),
      );
      assert.strictEqual(
        screen.getByRole('definition').textContent.trim(),
        t('pages.sco-organization-participants.connection-types.email'),
      );
    });

    test('it renders learner header information when there is several connection method', async function (assert) {
      const authenticationMethods = ['email', 'identifiant'];

      const screen = await render(
        <template><LearnerHeaderInfo @authenticationMethods={{authenticationMethods}} /></template>,
      );

      assert.strictEqual(
        screen.getByRole('term').textContent.trim(),
        t('pages.sco-organization-participants.table.column.login-method'),
      );
      assert.ok(
        screen.getByRole('definition').textContent.trim(),
        t('pages.sco-organization-participants.connection-types.email'),
      );

      assert.ok(
        screen.getByRole('definition').textContent.trim(),
        t('pages.sco-organization-participants.connection-types.identifiant'),
      );
    });

    test('it does not renders learner header information when there is no connection method', async function (assert) {
      const screen = await render(<template><LearnerHeaderInfo /></template>);

      assert.strictEqual(screen.queryByText(t('pages.sco-organization-participants.table.column.login-method')), null);
      assert.strictEqual(screen.queryByText(t('pages.sco-organization-participants.connection-types.email')), null);
    });
  });

  module('#certificability', function () {
    test('it renders learner header information when learner is certifiable', async function (assert) {
      const isCertifiable = true;
      const certifiableAt = '2023-01-01';

      const screen = await render(
        <template><LearnerHeaderInfo @isCertifiable={{isCertifiable}} @certifiableAt={{certifiableAt}} /></template>,
      );

      assert.strictEqual(
        screen.getByRole('term').textContent.trim(),
        t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      );
      assert.strictEqual(screen.getByRole('definition').textContent.trim(), '01/01/2023');
    });

    test('it does not render learner header information about certificability when learner is not certifiable', async function (assert) {
      const isCertifiable = false;
      const certifiableAt = null;

      const screen = await render(
        <template><LearnerHeaderInfo @isCertifiable={{isCertifiable}} @certifiableAt={{certifiableAt}} /></template>,
      );

      assert.strictEqual(
        screen.queryByText(t('pages.sco-organization-participants.table.column.is-certifiable.eligible')),
        null,
      );
      assert.strictEqual(screen.queryByText('01/01/2023'), null);
    });

    test('it do not display certifiableAt when hideCertifiableAt is true', async function (assert) {
      const isCertifiable = true;
      const certifiableAt = '01/01/2023';
      const hideCertifiableAt = true;

      const screen = await render(
        <template>
          <LearnerHeaderInfo
            @isCertifiable={{isCertifiable}}
            @certifiableAt={{certifiableAt}}
            @hideCertifiableAt={{hideCertifiableAt}}
          />
        </template>,
      );
      assert.strictEqual(screen.queryByText(certifiableAt), null);
    });

    test('it display certifiableAt when hideCertifiableAt is false', async function (assert) {
      const isCertifiable = true;
      const certifiableAt = '01/01/2023';
      const hideCertifiableAt = false;

      const screen = await render(
        <template>
          <LearnerHeaderInfo
            @isCertifiable={{isCertifiable}}
            @certifiableAt={{certifiableAt}}
            @hideCertifiableAt={{hideCertifiableAt}}
          />
        </template>,
      );
      assert.strictEqual(screen.getByRole('definition').textContent.trim(), certifiableAt);
    });
  });
});
