import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
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

    const expectedDate = dayjs(certificationCenterMembership.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    const screen = await render(
      hbs`<CertificationCenters::MembershipsSection
  @certificationCenterMemberships={{this.certificationCenterMemberships}}
  @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
/>`,
    );

    // then
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.id);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.email);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.firstName);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(user.lastName);
    assert.dom(screen.getByLabelText('Informations du membre Jojo La Gringue')).containsText(expectedDate);
    assert
      .dom(screen.getByLabelText('Informations du membre Jojo La Gringue'))
      .containsText(certificationCenterMembership.id);
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
