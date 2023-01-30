import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | SupOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const group = store.createRecord('group', { name: 'L1' });
    const organization = store.createRecord('organization', { groups: [group] });
    this.set('noop', sinon.stub());
    class CurrentUserStub extends Service {
      organization = organization;
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display the header labels', async function (assert) {
    // given
    this.set('students', []);
    this.set('groups', []);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains('Numéro étudiant');
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
    assert.contains('Groupes');
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];
    this.set('students', students);
    this.set('groups', []);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
    );

    // then

    assert.dom('[aria-label="Étudiant"]').exists({ count: 2 });
  });

  test('it should display a link to access student detail', async function (assert) {
    // given
    const students = [
      {
        lastName: 'Skywalker',
        firstName: 'Anakin',
        id: 66,
        birthdate: new Date('1977-05-25'),
      },
      {
        lastName: 'Kenobi',
        firstName: 'Obiwan',
        id: 33,
        birthdate: new Date('1977-05-25'),
      },
    ];
    this.set('students', students);
    this.set('groups', []);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
    );
    // then
    assert.dom(screen.getByRole('link', { name: 'Kenobi' })).hasProperty('href', /\/etudiants\/33/g);
  });

  test('it should display the student number, firstName, lastName, birthdate, group, participation count and and last participation date of student', async function (assert) {
    // given
    const students = [
      {
        studentNumber: 'LATERREURGIGI123',
        lastName: 'La Terreur',
        firstName: 'Gigi',
        birthdate: new Date('2010-02-01'),
        group: 'AB1',
        participationCount: 88,
        lastParticipationDate: new Date('2022-01-03'),
      },
    ];

    this.set('students', students);
    this.set('groups', []);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains('LATERREURGIGI123');
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
    assert.contains('AB1');
    assert.contains('88');
    assert.contains('03/01/2022');
  });

  test('it should display campaign name, type and status as tooltip information', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
      },
    ];

    this.set('students', students);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains('SUP - Campagne de collecte de profils');
    assert.contains('Collecte de profils');
    assert.contains('reçu');
  });

  test('it should display participant as eligible for certification when the sup participant is certifiable', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
        isCertifiable: true,
      },
    ];

    this.set('students', students);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));
  });

  test('it should display since when the sup participant is certifiable', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
        isCertifiable: true,
        certifiableAt: new Date('2022-01-03'),
      },
    ];

    this.set('students', students);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains('03/01/2022');
  });

  test('it should display the certificability tooltip', async function (assert) {
    // given
    const students = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        isCertifiable: true,
      },
    ];

    this.set('students', students);

    this.triggerFiltering = sinon.spy();
    this.set('groups', []);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert
      .dom(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.is-certifiable.tooltip.aria-label')
        )
      )
      .exists();
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(
        hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @onClickLearner={{this.noop}}/>`
      );

      // when
      await fillByLabel(this.intl.t('pages.sup-organization-participants.filter.search.aria-label'), 'Bob M');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'search', 'Bob M');
      assert.ok(true);
    });

    test('it should trigger filtering with student number', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);

      // when
      await render(
        hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
      );

      await fillByLabel('Entrer un numéro étudiant', 'LATERREURGIGI123');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'studentNumber', 'LATERREURGIGI123');
      assert.ok(true);
    });

    test('it should trigger filtering with group', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      const { getByPlaceholderText, findByRole } = await render(hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @groups={{this.groups}}
  @onClickLearner={{this.noop}}
/>`);
      const select = await getByPlaceholderText('Rechercher par groupe');
      await click(select);

      await findByRole('menu');

      await clickByName('L1');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'groups', ['L1']);
      assert.ok(true);
    });

    test('it should trigger filtering with certificability', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('certificability', []);

      const { getByLabelText, findByRole } = await render(
        hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @certificability={{this.certificability}} @onClickLearner={{this.noop}}/>`
      );

      // when
      const select = await getByLabelText('Rechercher par certificabilité');
      await click(select);

      await findByRole('menu');

      await clickByName('Certifiable');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'certificability', ['eligible']);
      assert.ok(true);
    });
  });

  module('when filter result does not match current participant information', function () {
    test('it should display a no student message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 1 };
      this.set('students', students);
      this.set('groups', []);
      // when
      await render(
        hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
      );

      // then
      assert.contains('Aucun étudiant.');
    });
  });

  module('when there is no participants in the organization', function () {
    test('it should display an import students message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 0 };
      this.set('students', students);
      this.set('groups', []);
      // when
      await render(
        hbs`<SupOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @groups={{this.groups}} @onClickLearner={{this.noop}}/>`
      );

      // then
      assert.contains('L’administrateur doit importer les étudiants en cliquant sur le bouton importer.');
    });
  });
});
