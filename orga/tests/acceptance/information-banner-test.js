import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Information Banner', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('ImportStudents banner', function() {

    test('should redirect to /eleves when clicking on banner button', async function(assert) {
      // given
      const user = server.create('user', { pixOrgaTermsOfServiceAccepted: true });
      const organization = server.create('organization', { type: 'SCO', isManagingStudents: true });
      const membership = server.create('membership', {
        organizationId: organization.id,
        userId: user.id,
      });
      user.userOrgaSettings = server.create('user-orga-setting', { user, organization });
      user.memberships = [membership];
      server.create('prescriber', {
        id: user.id,
        pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
        areNewYearSchoolingRegistrationsImported: false,
        memberships: user.memberships,
        userOrgaSettings: user.userOrgaSettings,
      });
      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });

      // when
      await visit('/');
      await click('.pix-banner a[href="/eleves"]');

      // then
      assert.equal(currentURL(), '/eleves');
    });
  });
});
