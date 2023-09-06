import dayjs from 'dayjs';
import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/memberships-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it should display certification center membership details', async function (assert) {
    // given
    const user = store.createRecord('user', {
      id: 123,
      firstName: 'Jojo',
      lastName: 'La Gringue',
      email: 'jojo@example.net',
    });
    const certificationCenterMembership = store.createRecord('certification-center-membership', {
      id: 1,
      user,
      role: 'MEMBER',
      createdAt: new Date('2018-02-15T05:06:07Z'),
    });
    this.set('certificationCenterMemberships', [certificationCenterMembership]);
    this.set('disableCertificationCenterMembership', sinon.stub());

    const expectedDate = dayjs(certificationCenterMembership.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
  @certificationCenterMemberships={{this.certificationCenterMemberships}}
  @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
/>`,
    );

    // then
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.email);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.firstName);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.lastName);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(expectedDate);
    assert
      .dom(screen.getByLabelText('Informations du membre Jojo La Gringue'))
      .containsText(certificationCenterMembership.id);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText('Membre');
  });

  test('it should display a list of certification center memberships', async function (assert) {
    // given
    const user1 = store.createRecord('user', {
      firstName: 'Jojo',
      lastName: 'La Gringue',
      email: 'jojo@example.net',
    });
    const user2 = store.createRecord('user', {
      firstName: 'Froufrou',
      lastName: 'Le froussard',
      email: 'froufrou@example.net',
    });
    const certificationCenterMembership1 = store.createRecord('certification-center-membership', {
      id: 1,
      user: user1,
      role: 'ADMIN',
      createdAt: new Date('2018-02-15T05:06:07Z'),
    });
    const certificationCenterMembership2 = store.createRecord('certification-center-membership', {
      id: 2,
      user: user2,
      role: 'MEMBER',
      createdAt: new Date('2018-02-15T05:06:07Z'),
    });
    const certificationCenterMemberships = [certificationCenterMembership1, certificationCenterMembership2];
    this.set('certificationCenterMemberships', certificationCenterMemberships);
    this.set('disableCertificationCenterMembership', sinon.stub());

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
  @certificationCenterMemberships={{this.certificationCenterMemberships}}
  @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
/>`,
    );

    // then
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).exists();
    assert.dom(screen.getByLabelText('Informations du membre Froufrou Le froussard')).exists();
  });

  test('it should display a message when there is no membership', async function (assert) {
    // given
    this.set('disableCertificationCenterMembership', sinon.stub());

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
  @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
/>`,
    );

    // then
    assert.dom(screen.getByText('Aucun résultat')).exists();
  });
});
