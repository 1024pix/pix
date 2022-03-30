import moment from 'moment';
import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | certification-centers/memberships-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display certification center membership details', async function (assert) {
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
    this.set('disableCertificationCenterMembership', sinon.stub());

    const expectedDate = moment(certificationCenterMembership.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
        @certificationCenterMemberships={{certificationCenterMemberships}}
        @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} />`
    );

    // then
    assert.dom(screen.getByLabelText('Membre')).exists();
    assert.dom('[data-test-membership-id]').hasText(certificationCenterMembership.id.toString());
    assert.dom('[data-test-user-id]').hasText(user.id.toString());
    assert.dom('[data-test-user-first-name]').hasText(user.firstName);
    assert.dom('[data-test-user-last-name]').hasText(user.lastName);
    assert.dom('[data-test-user-email]').hasText(user.email);
    assert.dom('[data-test-membership-created-at]').hasText(expectedDate);
  });

  test('it should display a list of certification center memberships', async function (assert) {
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
    this.set('disableCertificationCenterMembership', sinon.stub());

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
        @certificationCenterMemberships={{certificationCenterMemberships}}
        @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} />`
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Membre').length, 2);
  });

  test('it should display a message when there is no membership', async function (assert) {
    // given
    this.set('disableCertificationCenterMembership', sinon.stub());

    // when
    await render(
      hbs`<CertificationCenters::MembershipsSection @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} />`
    );

    // then
    assert.dom('[data-test-empty-message]').hasText('Aucun résultat');
  });
});
