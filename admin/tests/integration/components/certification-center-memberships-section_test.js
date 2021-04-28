import moment from 'moment';

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certification-center-memberships-section', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display certification center membership details', async function(assert) {
    // given
    const user = EmberObject.create({
      id: 123,
      firstName: 'Jojo',
      lastName: 'La Gringue',
      email: 'jojo@example.net',
    });
    const certificationCenterMembership = EmberObject.create({
      id: 1,
      user,
      createdAt: new Date('2018-02-15T05:06:07Z'),
    });
    this.set('certificationCenterMemberships', [certificationCenterMembership]);

    const expectedDate = moment(certificationCenterMembership.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    await render(hbs `<CertificationCenterMembershipsSection @certificationCenterMemberships={{certificationCenterMemberships}} />`);

    // then
    assert.dom('[aria-label="Membre"]').exists();
    assert.dom('[data-test-membership-id]').hasText(certificationCenterMembership.id.toString());
    assert.dom('[data-test-user-id]').hasText(user.id.toString());
    assert.dom('[data-test-user-first-name]').hasText(user.firstName);
    assert.dom('[data-test-user-last-name]').hasText(user.lastName);
    assert.dom('[data-test-user-email]').hasText(user.email);
    assert.dom('[data-test-membership-created-at]').hasText(expectedDate);
  });

  test('it should display a list of certification center memberships', async function(assert) {
    // given
    const user1 = EmberObject.create({
      firstName: 'Jojo',
      lastName: 'La Gringue',
      email: 'jojo@example.net',
    });
    const user2 = EmberObject.create({
      firstName: 'Froufrou',
      lastName: 'Le froussard',
      email: 'froufrou@example.net',
    });
    const certificationCenterMembership1 = EmberObject.create({ id: 1, user: user1 });
    const certificationCenterMembership2 = EmberObject.create({ id: 2, user: user2 });
    const certificationCenterMemberships = [certificationCenterMembership1, certificationCenterMembership2];
    this.set('certificationCenterMemberships', certificationCenterMemberships);

    // when
    await render(hbs `<CertificationCenterMembershipsSection @certificationCenterMemberships={{certificationCenterMemberships}} />`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });
  });

  test('it should display a message when there is no membership', async function(assert) {
    // when
    await render(hbs `<CertificationCenterMembershipsSection />`);

    // then
    assert.dom('[data-test-empty-message]').hasText('Aucun résultat');
  });
});
