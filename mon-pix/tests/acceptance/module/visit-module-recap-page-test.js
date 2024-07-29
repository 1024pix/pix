import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | recap', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test("can't visit /modules/:slug/recap", async function (assert) {
    // given
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
    });

    // when
    await visit('/modules/bien-ecrire-son-adresse-mail/recap');

    // then
    assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/details');
  });
});
