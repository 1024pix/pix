import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { upload } from 'ember-file-upload/test-support';

const TOTAL_CERTIFICATIONS_SECTION = '(1)';
const OUT_OF_SESSION_CERTIFICATIONS_SECTION = '(2)';
const INCOMPLETE_CERTIFICATIONS_SECTION = '(3)';
const DUPLICATE_CERTIFICATIONS_SECTION = '(4)';
const HAS_NOT_SEEN_LAST_SCREEN_CERTIFICATIONS_SECTION = '(5)';
const HAS_EXAMINER_COMMENT_CERTIFICATIONS_SECTION = '(6)';

module('Acceptance | Certifications Parsing', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    server.create('session', { id: 1 });
  });

  test('it displays the modal the certification session report modal with appropriate info', async function(assert) {
    // given
    await visit('/sessions/1/certifications');
    const file = new File(['foo'], 'charlie_bideau_pv_session.ods');

    // when
    await upload('#upload-attendance-sheet', file);

    // then
    const commonSelector = '.certification-session-report__body section:nth-child';
    const valueDiv = 'div:nth-child(2)';
    assert.dom('.modal-content').exists();
    assert.dom(`${commonSelector}${TOTAL_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('2');
    assert.dom(`${commonSelector}${OUT_OF_SESSION_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('2');
    assert.dom(`${commonSelector}${INCOMPLETE_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('1');
    assert.dom(`${commonSelector}${DUPLICATE_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('0');
    assert.dom(`${commonSelector}${HAS_NOT_SEEN_LAST_SCREEN_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('0');
    assert.dom(`${commonSelector}${HAS_EXAMINER_COMMENT_CERTIFICATIONS_SECTION} ${valueDiv}`).hasText('1');
  });

});
