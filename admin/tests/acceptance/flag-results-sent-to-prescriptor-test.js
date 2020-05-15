import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { FINALIZED, statusToDisplayName } from 'pix-admin/models/session';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Session page', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('Access', function() {

    test('Session page should be accessible from /certification/sessions', async function(assert) {
      // when
      await visitSessionsPage();

      // then
      assert.equal(currentURL(), '/sessions/list');
    });
  });

  module('Rendering', function(hooks) {

    const STATUS_SECTION = 9;
    const FINALISATION_DATE_SECTION = 10;
    const SENT_TO_PRESCRIPTEUR_DATE_SECTION = 11;
    const LABEL_ROW_INDEX = 1;
    const VALUE_ROW_INDEX = 2;
    const SEND_TO_PRESCRIPTEUR_BUTTON_INDEX = 4;

    hooks.beforeEach(async function() {
      await visitSessionsPage();
    });

    test('Should not have a "Date de finalisation" section', async function(assert) {
      const session = this.server.create('session');

      // when
      await visit(`/sessions/${session.id}`);
      assert.dom('div.session-info__details').exists();
      assert.dom(`.row:nth-child(${FINALISATION_DATE_SECTION}) .col:nth-child(${LABEL_ROW_INDEX})`).doesNotExist();
    });

    test('Should have "Date de finalisation" and "Date d\'envoi au prescripteur" section', async function(assert) {
      const finalizedDate = new Date('2019-03-10T01:03:04Z');
      const session = this.server.create('session', { status: FINALIZED, finalizedAt: finalizedDate });

      // when
      await visit(`/sessions/${session.id}`);
      assert.dom('div.session-info__details').exists();
      assert.dom(`.row:nth-child(${STATUS_SECTION}) .col:nth-child(${VALUE_ROW_INDEX})`).containsText(statusToDisplayName[FINALIZED]);
      assert.dom(`.row:nth-child(${FINALISATION_DATE_SECTION}) .col:nth-child(${VALUE_ROW_INDEX})`).containsText(finalizedDate.toLocaleString('fr-FR'));
      assert.dom(`.row:nth-child(${SENT_TO_PRESCRIPTEUR_DATE_SECTION}) .col:nth-child(${VALUE_ROW_INDEX})`).doesNotExist();
    });

    test('Should remove "Résultats transmis au prescripteur" button', async function(assert) {
      const session = this.server.create('session', {
        status: FINALIZED,
        finalizedAt: new Date('2019-03-10T01:03:04Z'),
      });
        // when
      await visit(`/sessions/${session.id}`);
      await click(`.session-info__actions button:nth-child(${SEND_TO_PRESCRIPTEUR_BUTTON_INDEX})`);

      assert.dom(`.session-info__actions button:nth-child(${SEND_TO_PRESCRIPTEUR_BUTTON_INDEX})`).doesNotExist();
    });

  });

  async function visitSessionsPage() {
    return visit('/sessions');
  }

});
