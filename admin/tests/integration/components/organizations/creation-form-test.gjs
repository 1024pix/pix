import { fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreationForm from 'pix-admin/components/organizations/creation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  const onSubmit = () => {};
  const onCancel = () => {};

  let store, errorNotificationStub;

  const countries = [
    { code: '99100', name: 'France' },
    { code: '99101', name: 'Danemark' },
  ];

  const administrationTeams = [
    { id: 'team-1', name: 'Équipe 1' },
    { id: 'team-2', name: 'Équipe 2' },
  ];

  const organizationLearnerTypes = [
    { id: '123', name: 'Student' },
    { id: '456', name: 'Teacher' },
  ];

  const structureCategories = [
    { id: '1234', label: 'Catégorie 1' },
    { id: '5678', label: 'Catégorie 2' },
  ];

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    errorNotificationStub = sinon.stub();
    class NotificationsStub extends Service {
      sendErrorNotification = errorNotificationStub;
    }
    this.owner.register('service:pixToast', NotificationsStub);
  });

  module('Render', function () {
    test('it renders', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreationForm
            @administrationTeams={{administrationTeams}}
            @organizationLearnerTypes={{organizationLearnerTypes}}
            @structureCategories={{structureCategories}}
            @countries={{countries}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('textbox', { name: `${t('components.organizations.creation.name.label')} *` }));
      assert.ok(screen.getByLabelText(`${t('components.organizations.creation.type.label')} *`));
      assert.ok(screen.getByText(t('components.organizations.creation.administration-team.selector.placeholder')));
      assert.ok(
        screen.getByLabelText(`${t('components.organizations.creation.organization-learner-type.selector.label')} *`),
      );
      assert.ok(screen.getByLabelText(`${t('components.organizations.creation.country.selector.label')} *`));
      assert.ok(
        screen.getByRole('button', { name: `${t('components.organizations.creation.category.selector.label')} *` }),
      );
      assert.ok(screen.getByRole('textbox', { name: t('components.organizations.creation.province-code') }));
      assert.ok(screen.getByRole('textbox', { name: t('components.organizations.creation.external-id.label') }));
      assert.ok(screen.getByRole('textbox', { name: t('components.organizations.creation.documentation-link') }));
      assert.ok(screen.getByRole('textbox', { name: `${t('components.organizations.creation.dpo.lastname')}DPO` }));
      assert.ok(screen.getByRole('textbox', { name: `${t('components.organizations.creation.dpo.firstname')}DPO` }));
      assert.ok(screen.getByRole('textbox', { name: `${t('components.organizations.creation.dpo.email')}DPO` }));
      assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
      assert.ok(screen.getByRole('button', { name: t('common.actions.add') }));
    });

    test('should render countries options in list', async function (assert) {
      // given
      const organization = store.createRecord('organization', { type: '' });

      const screen = await render(
        <template>
          <CreationForm
            @organization={{organization}}
            @administrationTeams={{administrationTeams}}
            @organizationLearnerTypes={{organizationLearnerTypes}}
            @structureCategories={{structureCategories}}
            @countries={{countries}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.country.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      const options = await screen.getAllByRole('option');

      // then
      assert.strictEqual(options.length, 2);
      assert.strictEqual(options[0].title, 'France (99100)');
      assert.strictEqual(options[1].title, 'Danemark (99101)');
    });

    test('should render learner types options in list', async function (assert) {
      // given
      const organization = store.createRecord('organization', { type: '' });

      const screen = await render(
        <template>
          <CreationForm
            @organization={{organization}}
            @administrationTeams={{administrationTeams}}
            @organizationLearnerTypes={{organizationLearnerTypes}}
            @structureCategories={{structureCategories}}
            @countries={{countries}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.organization-learner-type.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      const options = await screen.getAllByRole('option');

      // then
      assert.strictEqual(options.length, 2);
      assert.strictEqual(options[0].title, 'Student');
      assert.strictEqual(options[1].title, 'Teacher');
    });

    module('when there is a parent organization', function () {
      test("it prefills the administration team selector with its parent's", async function (assert) {
        // given - when
        const organization = store.createRecord('organization', { administrationTeamId: 'team-1' });

        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{organization}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(await screen.getByRole('button', { name: 'Équipe en charge *' }).innerText, 'Équipe 1');
      });

      test("it prefills the category selector with its parent's", async function (assert) {
        // given - when
        const organization = store.createRecord('organization', { categoryId: '1234' });

        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{organization}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(await screen.getByRole('button', { name: 'Catégorie *' }).innerText, 'Catégorie 1');
      });

      test("it prefills the type selector with its parent's", async function (assert) {
        // given - when
        const organization = store.createRecord('organization', { type: 'SCO' });

        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{organization}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: "Type de l'organisation *" }).innerText,
          'Établissement scolaire',
        );
      });

      test("it prefills the country selector with its parent's", async function (assert) {
        // given - when
        const organization = store.createRecord('organization', { countryCode: '99101' });

        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{organization}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: 'Pays (code INSEE) *' }).innerText,
          'Danemark (99101)',
        );
      });

      test("it prefills the documentation url with its parent's", async function (assert) {
        // given - when
        const organization = store.createRecord('organization', {
          documentationUrl: 'https://example-documentation.com',
        });

        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{organization}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('textbox', { name: 'Lien vers la documentation' }))
          .hasValue('https://example-documentation.com');
      });
    });

    module('when there is no parent organization', function () {
      test('it does not prefill the administration team selector', async function (assert) {
        // given - when
        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{null}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @countries={{countries}}
              @structureCategories={{structureCategories}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: 'Équipe en charge *' }).innerText,
          'Sélectionner une équipe',
        );
      });

      test('it does not prefill the category selector', async function (assert) {
        // given - when
        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{null}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @countries={{countries}}
              @structureCategories={{structureCategories}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: 'Catégorie *' }).innerText,
          'Sélectionner une catégorie',
        );
      });

      test('it does not prefill the type selector', async function (assert) {
        // given - when
        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{null}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: "Type de l'organisation *" }).innerText,
          'Sélectionner un type',
        );
      });

      test('it does not prefill the country selector', async function (assert) {
        // given - when
        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{null}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.strictEqual(
          await screen.getByRole('button', { name: 'Pays (code INSEE) *' }).innerText,
          'Sélectionner un pays',
        );
      });

      test('it does not prefill the documentation url input', async function (assert) {
        // given - when
        const screen = await render(
          <template>
            <CreationForm
              @parentOrganization={{null}}
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @structureCategories={{structureCategories}}
              @countries={{countries}}
              @onSubmit={{onSubmit}}
              @onCancel={{onCancel}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Lien vers la documentation' })).hasValue('');
        assert.strictEqual(
          screen.getByRole('textbox', { name: 'Lien vers la documentation' }).placeholder,
          'ex: https://www.documentation.org',
        );
      });
    });
  });

  module('when submitting form', function () {
    test('should call onSubmit function with form as argument', async function (assert) {
      // given
      const handleSubmitStub = sinon.stub();

      const screen = await render(
        <template>
          <CreationForm
            @administrationTeams={{administrationTeams}}
            @organizationLearnerTypes={{organizationLearnerTypes}}
            @structureCategories={{structureCategories}}
            @countries={{countries}}
            @onSubmit={{handleSubmitStub}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      await fillByLabel(`${t('components.organizations.creation.name.label')} *`, 'Organisation de Test');

      click(screen.getByRole('button', { name: `${t('components.organizations.creation.type.label')} *` }));
      await screen.findByRole('listbox');
      click(screen.getByRole('option', { name: 'Établissement scolaire' }));

      await fillByLabel(t('components.organizations.creation.external-id.label'), 'Mon identifiant externe');

      click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.administration-team.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      click(await screen.findByRole('option', { name: 'Équipe 2' }));

      click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.organization-learner-type.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      click(await screen.findByRole('option', { name: 'Student' }));

      await fillByLabel(t('components.organizations.creation.province-code'), '78');

      click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.country.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      click(await screen.findByRole('option', { name: 'France (99100)' }));

      click(
        screen.getByRole('button', {
          name: `${t('components.organizations.creation.category.selector.label')} *`,
        }),
      );
      await screen.findByRole('listbox');
      click(await screen.findByRole('option', { name: 'Catégorie 1' }));

      await fillByLabel(t('components.organizations.creation.documentation-link'), 'https://www.documentation.fr');

      await fillByLabel(`${t('components.organizations.creation.dpo.firstname')}DPO`, 'Justin');
      await fillByLabel(`${t('components.organizations.creation.dpo.lastname')}DPO`, 'Ptipeu');
      await fillByLabel(`${t('components.organizations.creation.dpo.email')}DPO`, 'justin.ptipeu@example.net');

      // when
      await click(screen.getByRole('button', { name: t('common.actions.add') }));

      // then
      const expectedForm = {
        name: 'Organisation de Test',
        type: 'SCO',
        externalId: 'Mon identifiant externe',
        administrationTeamId: 'team-2',
        organizationLearnerTypeId: '123',
        provinceCode: '78',
        countryCode: '99100',
        categoryId: '1234',
        documentationUrl: 'https://www.documentation.fr',
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      };

      assert.ok(handleSubmitStub.calledWith(expectedForm));
    });

    module('errors', function () {
      module('when required fields are not filled in', function () {
        test('should not submit form', async function (assert) {
          // given
          const handleSubmitStub = sinon.stub();

          const screen = await render(
            <template>
              <CreationForm
                @administrationTeams={{administrationTeams}}
                @organizationLearnerTypes={{organizationLearnerTypes}}
                @countries={{countries}}
                @structureCategories={{structureCategories}}
                @onSubmit={{handleSubmitStub}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          assert.ok(handleSubmitStub.notCalled);
        });

        test('should display error toast and display specific error messages on required fields', async function (assert) {
          // given
          const screen = await render(
            <template>
              <CreationForm
                @administrationTeams={{administrationTeams}}
                @organizationLearnerTypes={{organizationLearnerTypes}}
                @countries={{countries}}
                @structureCategories={{structureCategories}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          const nameErrorMessage = screen.getByText(t('components.organizations.creation.error-messages.name'));
          const typeErrorMessage = screen.getByText(t('components.organizations.creation.error-messages.type'));
          const administrationTeamErrorMessage = screen.getByText(
            t('components.organizations.creation.error-messages.administration-team'),
          );
          const organizationLearnerTypeErrorMessage = screen.getByText(
            t('components.organizations.creation.error-messages.organization-learner-type'),
          );
          const countryErrorMessage = screen.getByText(t('components.organizations.creation.error-messages.country'));

          const categoryErrorMessage = screen.getByText(
            t('components.organizations.creation.category.selector.error-message'),
          );
          assert.ok(nameErrorMessage);
          assert.ok(typeErrorMessage);
          assert.ok(administrationTeamErrorMessage);
          assert.ok(organizationLearnerTypeErrorMessage);
          assert.ok(countryErrorMessage);
          assert.ok(categoryErrorMessage);
          assert.ok(
            errorNotificationStub.calledWithExactly({
              message: t('components.organizations.creation.error-messages.error-toast'),
            }),
          );
        });
      });

      module('validation for optional fields', function () {
        test('should display specific error if documentation link or DPO email are not valid', async function (assert) {
          // given
          const screen = await render(
            <template>
              <CreationForm
                @administrationTeams={{administrationTeams}}
                @organizationLearnerTypes={{organizationLearnerTypes}}
                @countries={{countries}}
                @structureCategories={{structureCategories}}
              />
            </template>,
          );

          await fillByLabel(t('components.organizations.creation.documentation-link'), 'non-valid-documentation-url');
          await fillByLabel(`${t('components.organizations.creation.dpo.email')}DPO`, 'non-valid-email');

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          // then
          const nonValidDocumentationUrlErrorMessage = screen.getByText(
            t('components.organizations.creation.error-messages.documentation-url'),
          );

          const nonValidDPOEmailErrorMessage = screen.getByText(
            t('components.organizations.creation.error-messages.dpo-email'),
          );

          assert.ok(nonValidDocumentationUrlErrorMessage);
          assert.ok(nonValidDPOEmailErrorMessage);
        });
      });

      test('should make error messages disappear when updating fields in error with correct values', async function (assert) {
        // given
        const screen = await render(
          <template>
            <CreationForm
              @administrationTeams={{administrationTeams}}
              @organizationLearnerTypes={{organizationLearnerTypes}}
              @countries={{countries}}
              @structureCategories={{structureCategories}}
            />
          </template>,
        );

        await fillByLabel(`${t('components.organizations.creation.name.label')} *`, 'Organisation de Test');

        click(screen.getByRole('button', { name: `${t('components.organizations.creation.type.label')} *` }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Établissement scolaire' }));

        click(
          screen.getByRole('button', {
            name: `${t('components.organizations.creation.administration-team.selector.label')} *`,
          }),
        );
        await screen.findByRole('listbox');
        await click(await screen.findByRole('option', { name: 'Équipe 2' }));

        const dpoEmailLabel = `${t('components.organizations.creation.dpo.email')}DPO`;
        const dpoEmailInput = screen.getByRole('textbox', { name: dpoEmailLabel });
        await fillByLabel(dpoEmailLabel, 'invalid-email');
        await triggerEvent(dpoEmailInput, 'focusout');

        await click(screen.getByRole('button', { name: t('common.actions.add') }));

        // when
        click(
          screen.getByRole('button', {
            name: `${t('components.organizations.creation.country.selector.label')} *`,
          }),
        );
        await screen.findByRole('listbox');
        await click(await screen.findByRole('option', { name: 'France (99100)' }));

        await fillByLabel(dpoEmailLabel, 'justin.ptipeu@example.net');
        await triggerEvent(dpoEmailInput, 'focusout');

        //then
        assert.notOk(screen.queryByText(t('components.organizations.creation.error-messages.country')));
        assert.notOk(screen.queryByText(t('components.organizations.creation.error-messages.dpo-email')));
      });

      module('when first field in error is an input field', function () {
        test('it should focus on it after submit', async function (assert) {
          // given
          const screen = await render(
            <template>
              <CreationForm
                @administrationTeams={{administrationTeams}}
                @organizationLearnerTypes={{organizationLearnerTypes}}
                @countries={{countries}}
                @structureCategories={{structureCategories}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          //then
          const organizationNameInput = screen.getByRole('textbox', {
            name: `${t('components.organizations.creation.name.label')} *`,
          });
          assert.strictEqual(document.activeElement, organizationNameInput);
        });
      });

      module('when first field in error is a select field', function () {
        test('it should focus on it after submit', async function (assert) {
          // given
          const screen = await render(
            <template>
              <CreationForm
                @administrationTeams={{administrationTeams}}
                @organizationLearnerTypes={{organizationLearnerTypes}}
                @countries={{countries}}
                @structureCategories={{structureCategories}}
              />
            </template>,
          );

          await fillByLabel(`${t('components.organizations.creation.name.label')} *`, 'Organisation de Test');

          await click(screen.getByRole('button', { name: t('common.actions.add') }));

          //then
          const organizationTypeSelect = screen.getByRole('button', {
            name: `${t('components.organizations.creation.type.label')} *`,
          });
          assert.strictEqual(document.activeElement, organizationTypeSelect);
        });
      });
    });
  });

  module('when filling form', function () {
    test("should display error messages 'on the go' when filling form with non-valid information", async function (assert) {
      // given
      const screen = await render(
        <template>
          <CreationForm
            @administrationTeams={{administrationTeams}}
            @organizationLearnerTypes={{organizationLearnerTypes}}
            @countries={{countries}}
            @structureCategories={{structureCategories}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // when
      const nameInputLabel = `${t('components.organizations.creation.name.label')} *`;
      const nameInput = screen.getByRole('textbox', { name: nameInputLabel });
      await fillByLabel(nameInputLabel, 'Organisation de Test');
      await fillByLabel(nameInputLabel, '');
      await triggerEvent(nameInput, 'focusout');

      const documentationUrlLabel = t('components.organizations.creation.documentation-link');
      const documentationUrlInput = screen.getByRole('textbox', { name: documentationUrlLabel });
      await fillByLabel(documentationUrlLabel, 'invalid-documentation-url');
      await triggerEvent(documentationUrlInput, 'focusout');

      const dpoEmailLabel = `${t('components.organizations.creation.dpo.email')}DPO`;
      const dpoEmailInput = screen.getByRole('textbox', { name: dpoEmailLabel });
      await fillByLabel(dpoEmailLabel, 'invalid-email');
      await triggerEvent(dpoEmailInput, 'focusout');

      //then
      assert.ok(screen.getByText(t('components.organizations.creation.error-messages.name')));
      assert.ok(screen.getByText(t('components.organizations.creation.error-messages.documentation-url')));
      assert.ok(screen.getByText(t('components.organizations.creation.error-messages.dpo-email')));
    });
  });
});
