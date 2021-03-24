import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/team | invitations', (hooks) => {

  setupIntlRenderingTest(hooks);

  test('it should list the pending team invitations', async function(assert) {
    // given
    const organizationInvitations = [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
      { email: 'gogo@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ];
    this.set('organizationInvitations', organizationInvitations);

    // when
    await render(hbs`<Routes::Authenticated::Team::Invitations @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.dom(`[aria-label="${this.intl.t('pages.team-invitations.table.row.aria-label')}"]`).exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function(assert) {
    // given
    const pendingInvitationDate = moment('2019-10-08T10:50:00Z').utcOffset(2);

    const organizationInvitations = [
      { email: 'gigi@example.net', updatedAt: pendingInvitationDate },
    ];
    this.set('organizationInvitations', organizationInvitations);

    // when
    await render(hbs`<Routes::Authenticated::Team::Invitations @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.contains('gigi@example.net');
    assert.contains(`${this.intl.t('pages.team-invitations.table.row.message')} ${moment(pendingInvitationDate).format('DD/MM/YYYY - HH:mm')}`);
  });
});
