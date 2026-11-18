import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
      shortId: 'm4tth74s',
      slug: 'bien-ecrire-son-adresse-mail',
      details: { tabletSupport: 'comfortable' },
    });

    // when
    await visit('/modules/m4tth74s/bien-ecrire-son-adresse-mail/recap');

    // then
    assert.strictEqual(currentURL(), '/modules/m4tth74s/bien-ecrire-son-adresse-mail/details');
  });
});
