import { module, test } from 'qunit';
import { currentURL, visit, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is not logged in', function() {

    test('it should not be accessible by an unauthenticated prescriber', async function(assert) {
      // when
      await visit('/campagnes');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function(hooks) {

    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should be accessible for an authenticated prescriber', async function(assert) {
      // when
      await visit('/campagnes');

      // then
      assert.equal(currentURL(), '/campagnes');
    });

    test('it should show title indicate than prescriber can create a campaign', async function(assert) {
      // when
      await visit('/campagnes');

      // then
      assert.dom('.page-title').hasText('Créez votre première campagne');
    });

    test('it should list the campaigns of the current organization', async function(assert) {
      // given
      server.createList('campaign', 12);

      // when
      await visit('/campagnes');

      // then
      assert.dom('.campaign-list .table tbody tr').exists({ count: 12 });
    });

    test('it should redirect to campaign details on click', async function(assert) {
      // given
      server.create('campaign', { id: 1 });
      await visit('/campagnes');

      // when
      await click('.campaign-list .table tbody tr:first-child');

      // then
      assert.equal(currentURL(), '/campagnes/1');
    });

    module('When using creator filter', function(hooks) {
      let creator;

      hooks.beforeEach(async () => {
        creator = server.create('user', { firstName: 'Harry', lastName: 'Cojaune' });

        server.create('membership', {
          organizationId: user.userOrgaSettings.organization.id,
          userId: creator.id
        });

        server.create('campaign');
      });

      test('it should filter on creator', async function(assert) {
        // given
        await visit('/campagnes');

        // when
        await fillIn('select', creator.id);

        // then
        assert.equal(currentURL(), `/campagnes?creatorId=${creator.id}`);
      });

      test('it should clear filter on creator', async function(assert) {
        // given
        await visit(`/campagnes?creatorId=${creator.id}`);

        // when
        await fillIn('select', '');

        // then
        assert.equal(currentURL(), '/campagnes');
      });

      test('it should select creator using routing param creatorId', async function(assert) {
        // given
        await visit(`/campagnes?creatorId=${creator.id}`);
        const { value: selectedCreator } = find('select');

        // then
        assert.equal(selectedCreator, creator.id);
      });
    });
  });
});
