import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/certification-centers/get', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });
  });

  test('should access Certification center page by URL /certification-centers/:id', async function(assert) {
    // given
    server.create('certification-center');

    // when
    await visit('/certification-centers/1');

    // then
    assert.equal(currentURL(), '/certification-centers/1');
  });

  test('should display Certification center detail', async function(assert) {
    // given
    const certificationCenter = {
      name: 'Center 1',
      externalId: 'ABCDEF',
      type: 'SCO',
    };
    server.create('certification-center', 1, {
      ...certificationCenter,
    });

    // when
    await visit('/certification-centers/1');

    // then
    assert.contains(certificationCenter.name);
    assert.contains(certificationCenter.externalId);
    assert.contains(certificationCenter.type);
  });

});
