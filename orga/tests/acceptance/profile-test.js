import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });

    await authenticateSession(user.id);
  });

  test('it should go to participant details', async function (assert) {
    // given
    const organizationId = user.memberships.models[0].organizationId;
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });
    server.create('organization-participant', { id: 1, organizationId });

    // when
    const screen = await visit('/campagnes/1/profils/1');

    await click(screen.getByRole('link', { name: t('common.actions.link-to-participant') }));

    // then
    assert.strictEqual(currentURL(), '/participants/1');
  });

  test('it should go to campaigns', async function (assert) {
    // given
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visit('/campagnes/1/profils/1');
    await click(within(document.querySelector('main')).getByRole('link', { name: t('navigation.main.campaigns') }));

    // then
    assert.strictEqual(currentURL(), '/campagnes/les-miennes');
  });

  test('it should go to CampagneEtPrairie', async function (assert) {
    // given
    server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visit('/campagnes/1/profils/1');
    await clickByName('CampagneEtPrairie');

    // then
    assert.strictEqual(currentURL(), '/campagnes/1');
  });

  test('it display profile information', async function (assert) {
    server.create('campaign', { id: 2 });
    server.create('campaignProfile', {
      campaignId: 2,
      campaignParticipationId: 1,
      firstName: 'Jules',
      lastName: 'Winnfield',
    });

    // when
    const screen = await visit('/campagnes/2/profils/1');

    // then
    assert.ok(screen.getByText('Jules Winnfield'));
  });
});
