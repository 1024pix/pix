import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Ui::LearnerHeaderInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders learner header information when there is a groupName', async function (assert) {
    const groupName = this.intl.t('components.group.SCO');
    const group = '3E';

    this.set('groupName', groupName);
    this.set('group', group);

    const screen = await render(hbs`<Ui::LearnerHeaderInfo @group={{this.group}} @groupName={{this.groupName}} />`);

    assert.strictEqual(screen.getByRole('term').textContent.trim(), this.groupName);
    assert.strictEqual(screen.getByRole('definition').textContent.trim(), this.group);
  });

  test('it does not render learner division header information when there is no groupName', async function (assert) {
    const screen = await render(hbs`<Ui::LearnerHeaderInfo />`);

    assert.strictEqual(screen.queryByText(this.intl.t('components.group.SCO')), null);
    assert.strictEqual(screen.queryByText('3E'), null);
  });

  test('it renders learner header information when there is a connection method', async function (assert) {
    const authenticationMethods = ['email'];

    this.set('authenticationMethods', authenticationMethods);

    const screen = await render(hbs`<Ui::LearnerHeaderInfo @authenticationMethods={{this.authenticationMethods}} />`);

    assert.strictEqual(
      screen.getByRole('term').textContent.trim(),
      this.intl.t('pages.sco-organization-participants.table.column.login-method')
    );
    assert.strictEqual(
      screen.getByRole('definition').textContent.trim(),
      this.intl.t('pages.sco-organization-participants.connection-types.email')
    );
  });

  test('it does not renders learner header information when there is no connection method', async function (assert) {
    const screen = await render(hbs`<Ui::LearnerHeaderInfo @authenticationMethods={{this.authenticationMethods}} />`);

    assert.strictEqual(
      screen.queryByText(this.intl.t('pages.sco-organization-participants.table.column.login-method')),
      null
    );
    assert.strictEqual(
      screen.queryByText(this.intl.t('pages.sco-organization-participants.connection-types.email')),
      null
    );
  });

  test('it renders learner header information when learner is certifiable', async function (assert) {
    const isCertifiable = true;
    const certifiableAt = '2023-01-01';

    this.set('isCertifiable', isCertifiable);
    this.set('certifiableAt', certifiableAt);

    const screen = await render(
      hbs`<Ui::LearnerHeaderInfo @isCertifiable={{this.isCertifiable}} @certifiableAt={{this.certifiableAt}} />`
    );

    assert.strictEqual(
      screen.getByRole('term').textContent.trim(),
      this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible')
    );
    assert.strictEqual(screen.getByRole('definition').textContent.trim(), '01/01/2023');
  });

  test('it does not render learner header information about certificability when learner is not certifiable', async function (assert) {
    const isCertifiable = false;
    const certifiableAt = null;

    this.set('isCertifiable', isCertifiable);
    this.set('certifiableAt', certifiableAt);

    const screen = await render(
      hbs`<Ui::LearnerHeaderInfo @isCertifiable={{this.isCertifiable}} @certifiableAt={{this.certifiableAt}} />`
    );

    assert.strictEqual(
      screen.queryByText(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible')),
      null
    );
    assert.strictEqual(screen.queryByText('01/01/2023'), null);
  });
});
