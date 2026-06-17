import { fillByLabel, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import InformationSectionEdit from 'pix-admin/components/organizations/information-section-edit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/information-section-edit', function (hooks) {
  setupIntlRenderingTest(hooks);
  let findAllStub, store;
  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    findAllStub = sinon.stub(store, 'findAll');

    findAllStub
      .withArgs('administration-team')
      .resolves([
        store.createRecord('administration-team', { id: '123', name: 'Équipe 1' }),
        store.createRecord('administration-team', { id: '456', name: 'Équipe 2' }),
      ]);

    findAllStub
      .withArgs('country')
      .resolves([
        store.createRecord('country', { code: '99101', name: 'Danemark' }),
        store.createRecord('country', { code: '99100', name: 'France' }),
      ]);

    findAllStub
      .withArgs('organization-learner-type')
      .resolves([
        store.createRecord('organization-learner-type', { id: '789', name: 'Student' }),
        store.createRecord('organization-learner-type', { id: '987', name: 'Teacher' }),
      ]);
  });

  module('organization validation', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    const organization = EmberObject.create({
      id: 1,
      name: 'Organization SCO',
      externalId: 'VELIT',
      provinceCode: 'h50',
      email: 'sco.generic.account@example.net',
      administrationTeamId: '123',
      isOrganizationSCO: true,
      credit: 0,
      documentationUrl: 'https://pix.fr/',
      features: {},
    });

    test("it should show error message if organization's name is empty", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillIn(
        screen.getByLabelText(`${t('components.organizations.editing.name.label')} *`, { exact: false }),
        '',
      );

      // then
      assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
    });

    test("it should show error message if organization's name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillIn(
        screen.getByLabelText(`${t('components.organizations.editing.name.label')} *`, { exact: false }),
        'a'.repeat(256),
      );

      // then
      assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's external id is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.information-section-view.external-id'), 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
    });

    test("it should show error message if organization's province code is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.editing.province-code.label'), 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du département ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's data protection officer email is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(
        t('components.organizations.information-section-view.dpo-email'),
        'a'.repeat(255) + '@test.com',
      );

      // then
      assert.dom(screen.getByText("La longueur de l'email ne doit pas excéder 255 caractères.")).exists();
    });

    test("it should show error message if organization's data protection officer email is not valid", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.information-section-view.dpo-email'), 'not-valid-email-format');

      // then
      assert.dom(screen.getByText("L'e-mail n'a pas le bon format.")).exists();
    });

    test("it should show error message if organization's email is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(
        t('components.organizations.information-section-view.sco-activation-email'),
        'a'.repeat(255) + '@test.com',
      );

      // then
      assert.dom(screen.getByText("La longueur de l'email ne doit pas excéder 255 caractères.")).exists();
    });

    test("it should show error message if organization's email is not valid", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(
        t('components.organizations.information-section-view.sco-activation-email'),
        'not-valid-email-format',
      );

      // then
      assert.dom(screen.getByText("L'e-mail n'a pas le bon format.")).exists();
    });

    test("it should show error message if organization's credit is not valid", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.information-section-view.credits'), '-7');

      // then
      assert.dom(screen.getByText('Le nombre de crédits doit être un nombre supérieur ou égal à 0.')).exists();
    });

    test('it should allow 0 credits', async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.information-section-view.credits'), '0');
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.notOk(screen.queryByText('Le nombre de crédits doit être un nombre supérieur ou égal à 0.'));
    });

    test('it should allow empty value for credit', async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(t('components.organizations.information-section-view.credits'), '');
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.notOk(screen.queryByText('Le nombre de crédits doit être un nombre supérieur ou égal à 0.'));
    });

    test("it should show error message if organization's documentationUrl is not valid", async function (assert) {
      // given
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // when
      await fillByLabel(
        t('components.organizations.information-section-view.documentation-link'),
        '\\not-valid-url-format',
      );

      // then
      assert.dom(screen.getByText("Le lien n'est pas valide.")).exists();
    });

    test("it should show error message if organization's administration is empty", async function (assert) {
      const organizationWithoutAdministrationTeam = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: null,
      });

      // when
      const screen = await render(
        <template><InformationSectionEdit @organization={{organizationWithoutAdministrationTeam}} /></template>,
      );
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      const administrationTeamIdErrorMessage = screen.getByText(
        t('components.organizations.editing.administration-team.selector.error-message'),
      );

      // then
      assert.ok(administrationTeamIdErrorMessage);
    });

    test("it should show error message if organization's country is empty", async function (assert) {
      const organizationWithoutCountryCode = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: null,
      });

      // when
      const screen = await render(
        <template><InformationSectionEdit @organization={{organizationWithoutCountryCode}} /></template>,
      );
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      const countryCodeErrorMessage = screen.getByText(
        t('components.organizations.editing.country.selector.error-message'),
      );

      // then
      assert.ok(countryCodeErrorMessage);
    });

    test('it should show error message if organization learner type is empty', async function (assert) {
      const organizationWithoutOrganizationLearnerType = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: '99100',
        organizationLearnerTypeName: null,
      });

      // when
      const screen = await render(
        <template><InformationSectionEdit @organization={{organizationWithoutOrganizationLearnerType}} /></template>,
      );
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      const organizationLearnerTypeErrorMessage = screen.getByText(
        t('components.organizations.editing.organization-learner-type.selector.error-message'),
      );

      // then
      assert.ok(organizationLearnerTypeErrorMessage);
    });
  });

  module('administration teams select', function () {
    test('it should display select with options loaded', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);
      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.editing.administration-team.selector.label')} *`,
        }),
      );
      const listbox = await screen.findByRole('listbox');

      //then
      assert.ok(within(listbox).getByRole('option', { name: 'Équipe 1' }));
      assert.ok(within(listbox).getByRole('option', { name: 'Équipe 2' }));
    });
    test('it should display current administration team as pre-selected option if organization has one', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 456,
      });
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.administration-team.selector.label')} *`,
          }),
        ).getByText('Équipe 2'),
      );
    });

    test('it should display the placeholder if organization does not have an administration team', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: null,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.administration-team.selector.label')} *`,
          }),
        ).getByText(t('components.organizations.editing.administration-team.selector.placeholder')),
      );
    });
  });

  module('countries select', function () {
    test('it should display select with options loaded', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: 99100,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);
      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.editing.country.selector.label')} *`,
        }),
      );
      const listbox = await screen.findByRole('listbox');

      //then
      assert.ok(within(listbox).getByRole('option', { name: 'Danemark (99101)' }));
      assert.ok(within(listbox).getByRole('option', { name: 'France (99100)' }));
    });

    test('it should display current country as pre-selected option if organization has one', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        features: {},
        documentationUrl: 'https://pix.fr/',
        administrationTeamId: 123,
        countryCode: 99100,
      });
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.country.selector.label')} *`,
          }),
        ).getByText('France (99100)'),
      );
    });

    test('it should display the placeholder if organization does not have a country code', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: null,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.country.selector.label')} *`,
          }),
        ).getByText(t('components.organizations.editing.country.selector.placeholder')),
      );
    });
  });

  module('organization learner type select', function () {
    test('it should display select with options loaded', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: 99100,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);
      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.editing.organization-learner-type.selector.label')} *`,
        }),
      );
      const listbox = await screen.findByRole('listbox');

      //then
      assert.ok(within(listbox).getByRole('option', { name: 'Student' }));
      assert.ok(within(listbox).getByRole('option', { name: 'Teacher' }));
    });

    test('it should display current organization-learner-type as pre-selected option if organization has one', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        features: {},
        documentationUrl: 'https://pix.fr/',
        administrationTeamId: 123,
        countryCode: 99100,
        organizationLearnerTypeName: 'Student',
        organizationLearnerTypeId: 789,
      });
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.organization-learner-type.selector.label')} *`,
          }),
        ).getByText('Student'),
      );
    });

    test('it should display the placeholder if organization does not have a organization-learner-type', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
        administrationTeamId: 123,
        countryCode: 99100,
        organizationLearnerTypeName: null,
      });

      //when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.ok(
        within(
          screen.getByRole('button', {
            name: `${t('components.organizations.editing.organization-learner-type.selector.label')} *`,
          }),
        ).getByText(t('components.organizations.editing.organization-learner-type.selector.placeholder')),
      );
    });
  });

  module('Rendering', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    test('it should render the organization edit form with all sections', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        administrationTeamId: '123',
        isOrganizationSCO: true,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        features: {},
      });

      // when
      const screen = await render(<template><InformationSectionEdit @organization={{organization}} /></template>);

      // then
      assert.dom(screen.getByText(t('common.cards.titles.general-information'))).exists();
      assert.dom(screen.getByText(t('components.organizations.creation.configuration'))).exists();
      assert
        .dom(
          screen.getByText(
            `${t('components.organizations.creation.dpo.definition')} (${t('components.organizations.creation.dpo.acronym')})`,
          ),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.save') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
    });
  });
});
