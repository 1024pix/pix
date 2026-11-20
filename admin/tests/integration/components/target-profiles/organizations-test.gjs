import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Organizations from 'pix-admin/components/target-profiles/organizations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | target-profiles | Organizations', function (hooks) {
  setupIntlRenderingTest(hooks);

  const goToOrganizationPage = () => {};
  const detachOrganizations = () => {};
  const queryParams = { hideArchived: false };
  const administrationTeam = EmberObject.create({ id: 1, name: 'Admin Team 1' });
  const administrationTeam2 = EmberObject.create({ id: 2, name: 'Admin Team 2' });
  const administrationTeams = [administrationTeam, administrationTeam2];

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
  });

  test('it should display the organizations', async function (assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organization2 = EmberObject.create({ id: 456, name: 'Orga2', externalId: 'O2' });
    const organizations = [organization1, organization2];

    organizations.meta = { page: 1, pageSize: 1 };

    // when
    const screen = await render(
      <template>
        <Organizations
          @organizations={{organizations}}
          @administrationTeams={{administrationTeams}}
          @goToOrganizationPage={{goToOrganizationPage}}
          @hideArchived={{queryParams.hideArchived}}
          @detachOrganizations={{detachOrganizations}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Orga1')).exists();
    assert.dom(screen.getByText('Orga2')).exists();
  });

  test('it should display organization informations', async function (assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organizations = [organization1];

    organizations.meta = { page: 1, pageSize: 1 };

    // when
    const screen = await render(
      <template>
        <Organizations
          @organizations={{organizations}}
          @administrationTeams={{administrationTeams}}
          @goToOrganizationPage={{goToOrganizationPage}}
          @hideArchived={{queryParams.hideArchived}}
          @detachOrganizations={{detachOrganizations}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Orga1')).exists();
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('O1')).exists();
  });

  test('it displays a message when there is no organizations', async function (assert) {
    // given
    const organizations = [];

    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = [];

    // when
    const screen = await render(
      <template>
        <Organizations
          @organizations={{organizations}}
          @administrationTeams={{administrationTeams}}
          @goToOrganizationPage={{goToOrganizationPage}}
          @hideArchived={{queryParams.hideArchived}}
          @detachOrganizations={{detachOrganizations}}
        />
      </template>,
    );

    assert.dom(screen.getByText('Aucun résultat')).exists();
  });

  module('#triggerFiltering', function () {
    [
      {
        fieldName: 'id',
        fieldInteraction: async function () {
          await fillByLabel('Identifiant', '1');
        },
        value: '1',
      },
      {
        fieldName: 'name',
        fieldInteraction: async function () {
          await fillByLabel('Nom', 'Test');
        },
        value: 'Test',
      },
      {
        fieldName: 'type',
        fieldInteraction: async function (screen) {
          await click(screen.getByLabelText('Type'));
          await click(await screen.findByRole('option', { name: 'SCO' }));
        },
        value: 'SCO',
      },
      {
        fieldName: 'administrationTeamId',
        fieldInteraction: async function (screen) {
          await click(
            screen.getByLabelText(t('components.organizations.list-items.table.header.administration-team-name')),
          );
          await click(await screen.findByRole('option', { name: administrationTeam.name }));
        },
        value: administrationTeam.id,
      },
      {
        fieldName: 'externalId',
        fieldInteraction: async function () {
          await fillByLabel('Identifiant externe', 'UAI1');
        },
        value: 'UAI1',
      },
      {
        fieldName: 'hideArchived',
        fieldInteraction: async function (screen) {
          await click(screen.getByLabelText('Oui'));
        },
        value: true,
      },
    ].forEach((testData) => {
      test(`should set a filter on ${testData.fieldName} selection`, async function (assert) {
        // given
        const router = this.owner.lookup('service:router');
        const transitionToStub = sinon.stub(router, 'transitionTo');
        const organizations = [];

        organizations.meta = { page: 1, pageSize: 1 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await testData.fieldInteraction(screen);

        // then
        sinon.assert.calledWith(transitionToStub, { queryParams: { [testData.fieldName]: testData.value } });
        assert.ok(true);
      });
    });
  });

  module('#onResetFilters', function () {
    test('should reset all filters', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      const transitionToStub = sinon.stub(router, 'transitionTo');
      const organizations = [];

      organizations.meta = { page: 1, pageSize: 1 };

      // when
      const screen = await render(
        <template>
          <Organizations
            @type="SCO"
            @organizations={{organizations}}
            @administrationTeams={{administrationTeams}}
            @goToOrganizationPage={{goToOrganizationPage}}
            @hideArchived={{queryParams.hideArchived}}
            @detachOrganizations={{detachOrganizations}}
          />
        </template>,
      );
      await click(screen.getByRole('button', { name: 'Effacer les filtres', exact: false }));

      // then
      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          id: null,
          name: null,
          type: null,
          externalId: null,
          hideArchived: null,
          administrationTeamId: null,
        },
      });
      assert.ok(true);
    });
  });

  module('Organizations/Target Profiles linking system', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('it should disable buttons when the inputs are empty', async function (assert) {
      // given
      const organizations = [];

      organizations.meta = { page: 1, pageSize: 1 };

      // when
      const screen = await render(
        <template>
          <Organizations
            @organizations={{organizations}}
            @administrationTeams={{administrationTeams}}
            @goToOrganizationPage={{goToOrganizationPage}}
            @hideArchived={{queryParams.hideArchived}}
            @detachOrganizations={{detachOrganizations}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Valider le rattachement')).hasAttribute('aria-disabled');
      assert
        .dom(screen.getByLabelText('Valider le rattachement à partir de ce profil cible'))
        .hasAttribute('aria-disabled');
    });

    module('#attachOrganizations', function () {
      test('it should display a field to attach organizations', async function (assert) {
        // given
        const organizations = [];

        // when
        await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel('Rattacher une ou plusieurs organisation(s)', '1, 2');

        assert.dom('[placeholder="1, 2"]').hasValue('1, 2');
      });

      test('it should enable button when input has content', async function (assert) {
        // given
        const organizations = [];
        const administrationTeam = EmberObject.create({ id: 1, name: 'Admin Team 1' });
        const administrationTeam2 = EmberObject.create({ id: 2, name: 'Admin Team 2' });
        const administrationTeams = [administrationTeam, administrationTeam2];
        const queryParams = { hideArchived: false };
        const targetProfile = { id: 56 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @targetProfile={{targetProfile}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel('Rattacher une ou plusieurs organisation(s)', '1, 2');

        // then
        assert.dom(screen.getByLabelText('Valider le rattachement')).doesNotHaveAttribute('aria-disabled');
      });

      test('it should call adapter when form is submitted', async function (assert) {
        // given
        const organizations = [];
        const administrationTeam = EmberObject.create({ id: 1, name: 'Admin Team 1' });
        const administrationTeam2 = EmberObject.create({ id: 2, name: 'Admin Team 2' });
        const administrationTeams = [administrationTeam, administrationTeam2];
        const targetProfile = { id: 56 };
        const adapter = store.adapterFor('target-profile');
        const attachOrganizationsStub = sinon.stub(adapter, 'attachOrganizations').resolves({
          data: { attributes: { 'duplicated-ids': [], 'attached-ids': [1, 2] } },
        });
        const router = this.owner.lookup('service:router');
        const refreshStub = sinon.stub(router, 'refresh');

        // when
        await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @targetProfile={{targetProfile}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel('Rattacher une ou plusieurs organisation(s)', '1, 2');
        await clickByName('Valider le rattachement');

        // then
        assert.true(refreshStub.calledOnce);
        assert.ok(attachOrganizationsStub.calledWith({ organizationIds: [1, 2], targetProfileId: 56 }));
      });
    });
    module('#organizationsFromExistingTargetProfileToAttach', function () {
      test('it should display a field to attach organizations from an existing target profile', async function (assert) {
        // given
        const organizations = [];

        // when
        await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel("Rattacher les organisations d'un profil cible existant", 1);
        await clickByName('Valider le rattachement à partir de ce profil cible');

        assert.dom('[placeholder="1135"]').hasValue('1');
      });

      test('it should enable button for existing target profile attachment', async function (assert) {
        // given
        const organizations = [];
        const administrationTeam = EmberObject.create({ id: 1, name: 'Admin Team 1' });
        const administrationTeam2 = EmberObject.create({ id: 2, name: 'Admin Team 2' });
        const administrationTeams = [administrationTeam, administrationTeam2];
        const targetProfile = { id: 56 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @targetProfile={{targetProfile}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel("Rattacher les organisations d'un profil cible existant", '123');

        // then
        assert
          .dom(screen.getByLabelText('Valider le rattachement à partir de ce profil cible'))
          .doesNotHaveAttribute('aria-disabled');
      });

      test('it should call adapter when form is submitted', async function (assert) {
        // given
        const organizations = [];
        const administrationTeam = EmberObject.create({ id: 1, name: 'Admin Team 1' });
        const administrationTeam2 = EmberObject.create({ id: 2, name: 'Admin Team 2' });
        const administrationTeams = [administrationTeam, administrationTeam2];
        const targetProfile = { id: 56 };
        const adapter = store.adapterFor('target-profile');
        const attachOrganizationsFromExistingTargetProfileStub = sinon.stub(
          adapter,
          'attachOrganizationsFromExistingTargetProfile',
        );
        const router = this.owner.lookup('service:router');
        const refreshStub = sinon.stub(router, 'refresh');

        // when
        await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @targetProfile={{targetProfile}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );
        await fillByLabel("Rattacher les organisations d'un profil cible existant", '123');
        await clickByName('Valider le rattachement à partir de ce profil cible');

        // then
        assert.true(refreshStub.calledOnce);
        assert.ok(
          attachOrganizationsFromExistingTargetProfileStub.calledWith({
            targetProfileId: 56,
            targetProfileIdToCopy: '123',
          }),
        );
      });
    });
    module('#detachOrganizations', function () {
      test('it should show a column to detach organization from profile-cible', async function (assert) {
        // given
        const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
        const organizations = [organization1];

        organizations.meta = { page: 1, pageSize: 1 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );

        const detachButton = await screen.queryByRole('button', { name: 'Détacher' });
        assert.dom(detachButton).exists();
      });

      test('it should call adapter when button is clicked', async function (assert) {
        // given
        const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
        const organizations = [organization1];
        const targetProfile = { id: 56 };

        organizations.meta = { page: 1, pageSize: 1 };

        const adapter = store.adapterFor('target-profile');
        const detachOrganizationsStub = sinon.stub(adapter, 'detachOrganizations').resolves([123]);
        const router = this.owner.lookup('service:router');
        const refreshStub = sinon.stub(router, 'refresh');

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @targetProfile={{targetProfile}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );

        const detachButton = screen.getByRole('button', { name: 'Détacher' });
        await click(detachButton);
        const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
        await click(confirmButton);

        // then
        assert.true(refreshStub.calledOnce);
        assert.ok(detachOrganizationsStub.calledWith(56, [123]));
      });

      test('it should not show a column to detach organization from profile-cible if not super-admin', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false };

        const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
        const organizations = [organization1];

        organizations.meta = { page: 1, pageSize: 1 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );

        const detachButton = await screen.queryByRole('button', { name: 'Détacher' });
        assert.dom(detachButton).doesNotExist();
      });

      test('it should show a column to detach organization from profile-cible if metier', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false, isMetier: true };

        const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
        const organizations = [organization1];

        organizations.meta = { page: 1, pageSize: 1 };

        // when
        const screen = await render(
          <template>
            <Organizations
              @organizations={{organizations}}
              @administrationTeams={{administrationTeams}}
              @goToOrganizationPage={{goToOrganizationPage}}
              @hideArchived={{queryParams.hideArchived}}
              @detachOrganizations={{detachOrganizations}}
            />
          </template>,
        );

        const detachButton = await screen.queryByRole('button', { name: 'Détacher' });
        assert.dom(detachButton).exists();
      });
    });
  });
});
