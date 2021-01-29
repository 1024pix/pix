import moment from 'moment';

import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/certification-centers/get', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  const certificationCenterData = {
    name: 'Center 1',
    externalId: 'ABCDEF',
    type: 'SCO',
  };

  let certificationCenter;
  let certificationCenterMembership1;
  let currentUser;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    certificationCenter = server.create('certification-center', certificationCenterData);

    certificationCenterMembership1 = server.create('certification-center-membership', {
      createdAt: new Date('2018-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
    server.create('certification-center-membership', {
      createdAt: new Date('2019-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
  });

  test('should access Certification center page by URL /certification-centers/:id', async function(assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.equal(currentURL(), '/certification-centers/1');
  });

  test('should display Certification center detail', async function(assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.contains(certificationCenter.name);
    assert.contains(certificationCenter.externalId);
    assert.contains(certificationCenter.type);
  });

  test('should display Certification center memberships', async function(assert) {
    // given
    const expectedDate1 = moment(certificationCenterMembership1.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });

    assert.dom('[aria-label="Membre"]:first-child td:nth-child(2)')
      .hasText(certificationCenterMembership1.user.id);

    assert.contains(certificationCenterMembership1.user.firstName);
    assert.contains(certificationCenterMembership1.user.lastName);
    assert.contains(certificationCenterMembership1.user.email);
    assert.contains(expectedDate1);
  });
});
