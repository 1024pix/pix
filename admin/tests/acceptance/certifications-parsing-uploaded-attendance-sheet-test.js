import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { upload } from 'ember-file-upload/test-support';

module('Acceptance | Certifications Parsing', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    server.create('session', { id: 1 });
  });

  hooks.afterEach(function() {
  });

  test('it displays the modal the certification session report modal with appropriate info', async function(assert) {
    // given
    await visit('/certifications/sessions/1/list');
    const file = new File(['foo'], 'charlie_bideau_pv_session.ods');

    // when
    await upload('#upload-attendance-sheet', file);

    // then
    assert.dom('.modal-content').exists();
    assert.dom('.certification-session-report__body section:nth-child(1) div:nth-child(2)').hasText('2');
    assert.dom('.certification-session-report__body section:nth-child(2) div:nth-child(2)').hasText('2');
    assert.dom('.certification-session-report__body section:nth-child(3) div:nth-child(2)').hasText('1');
    assert.dom('.certification-session-report__body section:nth-child(4) div:nth-child(2)').hasText('0');
    assert.dom('.certification-session-report__body section:nth-child(5) div:nth-child(2)').hasText('0');
    assert.dom('.certification-session-report__body section:nth-child(6) div:nth-child(2)').hasText('0');
    assert.dom('.certification-session-report__body section:nth-child(7) div:nth-child(2)').hasText('1');
  });

});
