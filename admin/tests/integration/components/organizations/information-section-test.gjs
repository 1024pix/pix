import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import InformationSection from 'pix-admin/components/organizations/information-section';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);

    const store = this.owner.lookup('service:store');
    const findAllStub = sinon.stub(store, 'findAll');

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

    findAllStub
      .withArgs('organization-learner-import-format')
      .resolves([
        store.createRecord('organization-learner-import-format', { id: '123', name: 'GENERIC' }),
        store.createRecord('organization-learner-import-format', { id: '456', name: 'ONDE' }),
      ]);
  });

  module('when editing organization', function () {
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
      organizationLearnerTypeName: 'Student',
      organizationLearnerTypeId: 789,
    });

    test('it should toggle edition mode on click to edit button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);

      // when
      await clickByName(t('common.actions.edit'));

      // then
      assert
        .dom(screen.getByRole('textbox', { name: `${t('components.organizations.editing.name.label')} *` }))
        .exists();
      assert
        .dom(screen.getByRole('textbox', { name: t('components.organizations.information-section-view.external-id') }))
        .exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.save') })).exists();
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);
      await clickByName(t('common.actions.edit'));

      // when
      await clickByName(t('common.actions.cancel'));

      // then
      assert.ok(await screen.findByRole('button', { name: t('common.actions.edit') }));
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      const screen = await render(<template><InformationSection @organization={{organization}} /></template>);

      await clickByName(t('common.actions.edit'));

      await fillByLabel(t('components.organizations.information-section-view.external-id'), 'new externalId');
      await fillByLabel(t('components.organizations.editing.province-code.label'), 'new provinceCode');
      await fillByLabel(
        t('components.organizations.information-section-view.documentation-link'),
        'new documentationUrl',
      );

      // when
      await clickByName(t('common.actions.cancel'));

      // then
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.external-id')).nextElementSibling)
        .hasText(organization.externalId);
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.province-code')).nextElementSibling)
        .hasText(organization.provinceCode);
      assert.dom(screen.getByRole('link', { name: organization.documentationUrl })).exists();
    });

    test('it should submit the form if there is no error', async function (assert) {
      // given
      const onSubmit = () => {};

      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'OIDC-1',
            code: 'OIDC-1',
            application: 'app',
            applicationTld: '.fr',
            organizationName: 'organization 1',
          },
          {
            id: 'OIDC-2',
            code: 'OIDC-2',
            application: 'app',
            applicationTld: '.fr',
            organizationName: 'organization 2',
          },
        ],
      });

      const screen = await render(
        <template><InformationSection @organization={{organization}} @onSubmit={{onSubmit}} /></template>,
      );
      await clickByName(t('common.actions.edit'));

      await fillIn(screen.getByLabelText(`${t('components.organizations.editing.name.label')} *`), 'new name');
      await fillByLabel(t('components.organizations.information-section-view.external-id'), 'new externalId');
      await fillByLabel(t('components.organizations.editing.province-code.label'), '');

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.editing.administration-team.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Équipe 2' }));

      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.editing.country.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      const danemarkOption = await screen.findByRole('option', { name: 'Danemark (99101)' });
      await click(danemarkOption);

      await fillByLabel(t('components.organizations.information-section-view.credits'), 50);
      await fillByLabel(t('components.organizations.information-section-view.documentation-link'), 'https://pix.fr/');

      await clickByName(t('components.organizations.information-section-view.sso'));
      await screen.findByRole('listbox');
      const ssoOption = await screen.findByRole('option', { name: 'organization 2 – app.pix.fr' });
      await click(ssoOption);

      // when
      await clickByName(t('common.actions.save'));

      // then
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.external-id')).nextElementSibling)
        .hasText('new externalId');
      assert
        .dom(screen.queryByText(t('components.organizations.information-section-view.province-code')))
        .doesNotExist();
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.country.label')).nextElementSibling)
        .hasText('Danemark (99101)');
      assert
        .dom(
          screen.getByText(t('components.organizations.information-section-view.administration-team'))
            .nextElementSibling,
        )
        .hasText('Équipe 2');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.credits')).nextElementSibling)
        .hasText('50');
      assert.dom(screen.getByRole('link', { name: 'https://pix.fr/' })).exists();
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.sso')).nextElementSibling)
        .hasText('organization 2 – app.pix.fr');
    });

    test('it should not submit the form if there is an error', async function (assert) {
      // given
      const onSubmit = () => {};
      const screen = await render(
        <template><InformationSection @organization={{organization}} @onSubmit={{onSubmit}} /></template>,
      );
      await clickByName(t('common.actions.edit'));

      await fillIn(screen.getByLabelText(`${t('components.organizations.editing.name.label')} *`), '');

      // when
      await clickByName(t('common.actions.save'));

      // then
      assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
      assert.ok(screen.getByRole('button', { name: t('common.actions.save') }));
      assert.notOk(screen.queryByRole('button', { name: t('common.actions.edit') }));
    });
  });
});
