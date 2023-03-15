import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import { within } from '@testing-library/dom';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Campaign Profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  test('it should go to participant details', async function (assert) {
    // given
    const organizationId = user.memberships.models.firstObject.organizationId;
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });
    server.create('organization-participant', { id: 1, organizationId });

    // when
    const screen = await visitScreen('/campagnes/1/profils/1');
    await click(screen.getByRole('link', { name: this.intl.t('common.actions.link-to-participant') }));

    // then
    assert.strictEqual(currentURL(), '/participants/1');
  });

  test('it should go to campaigns', async function (assert) {
    // given
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visitScreen('/campagnes/1/profils/1');
    await click(
      within(document.querySelector('main')).getByRole('link', { name: this.intl.t('navigation.main.campaigns') })
    );

    // then
    assert.strictEqual(currentURL(), '/campagnes/les-miennes');
  });

  test('it should go to CampagneEtPrairie', async function (assert) {
    // given
    server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visitScreen('/campagnes/1/profils/1');
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
    await visit('/campagnes/2/profils/1');

    // then
    assert.contains('Jules Winnfield');
  });
});
