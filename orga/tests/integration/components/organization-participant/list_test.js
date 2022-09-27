import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | OrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization');

    class CurrentUserStub extends Service {
      organization = organization;
    }
    this.owner.register('service:current-user', CurrentUserStub);
    this.set('stub', () => {});
  });

  test('it should display the header labels', async function (assert) {
    // given
    this.set('participants', []);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}} />`);

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Nombre de participations');
    assert.contains('Dernière participation');
  });

  test('it should display a list of participants', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
      },
    ];
    this.set('participants', participants);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains("L'asticot");
  });

  test('it should display the participant firstName and lastName', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
      },
    ];

    this.set('participants', participants);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
  });

  test('it should display the number of participations for each participant', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        participationCount: 4,
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
        participationCount: 1,
      },
    ];

    this.set('participants', participants);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}}/>`
    );
    const allRows = screen.getAllByLabelText(this.intl.t('pages.organization-participants.table.row-title'));

    // then
    assert.dom(allRows[0]).containsText(4);
    assert.dom(allRows[1]).containsText(1);
  });

  test('it should display the date of the last participation and the tooltip informations for each participant', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        lastParticipationDate: new Date('2022-05-15'),
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
        lastParticipationDate: new Date('2022-01-07'),
      },
    ];

    this.set('participants', participants);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}}/>`
    );
    const allRows = screen.getAllByLabelText(this.intl.t('pages.organization-participants.table.row-title'));

    // then
    assert.dom(allRows[0]).containsText('15/05/2022');
    assert.dom(allRows[1]).containsText('07/01/2022');
    assert.strictEqual(
      screen.getAllByLabelText(
        this.intl.t('pages.participants-list.latest-participation-information-tooltip.aria-label')
      ).length,
      2
    );
  });

  test('it should display participant as eligible for certification when the participant is certifiable and the certifiableAt', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        lastParticipationDate: new Date('2022-05-15'),
        isCertifiable: true,
        certifiableAt: new Date('2022-01-02'),
      },
    ];

    this.set('participants', participants);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{stub}}/>`);

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));
    assert.contains('02/01/2022');
  });

  test('it filters participant when the input is filled', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
      },
    ];

    this.set('participants', participants);
    this.triggerFiltering = sinon.stub();

    // when
    await render(
      hbs`<OrganizationParticipant::List @participants={{participants}} @triggerFiltering={{triggerFiltering}}/>`
    );
    await fillByLabel('Recherche sur le nom et prénom', 'Karam');
    // then
    sinon.assert.calledWith(this.triggerFiltering, 'fullName', 'Karam');
    assert.ok(true);
  });

  test('it should display the empty state when no participants', async function (assert) {
    // given
    const participants = [];
    this.set('participants', participants);

    this.triggerFiltering = sinon.stub();

    // when
    await render(
      hbs`<OrganizationParticipant::List @participants={{participants}}  @triggerFiltering={{triggerFiltering}}/>`
    );
    await fillByLabel('Recherche sur le nom et prénom', 'Karam');

    // then
    assert.contains(this.intl.t('pages.organization-participants.table.empty'));
  });
});
