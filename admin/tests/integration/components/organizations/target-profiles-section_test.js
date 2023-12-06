import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | organizations/target-profiles-section', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  module('when user has access', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      store = this.owner.lookup('service:store');
    });

    test('it disables the button when the input is empty', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
        attachTargetProfiles: sinon.stub(),
      });

      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Valider' })).isDisabled();
    });

    test('it calls the organization action when the input is not empty and user clicks on button', async function (assert) {
      // given
      const getStub = sinon.stub();
      getStub.returns([]);
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
        attachTargetProfiles: sinon.stub(),
        get: getStub,
      });
      this.set('organization', organization);

      // when
      await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);
      await fillByLabel('ID du ou des profil(s) cible(s)', '1');
      await clickByName('Valider');

      // then
      assert.ok(organization.attachTargetProfiles.calledWith({ 'target-profile-ids': ['1'] }));
    });

    test('it should have a link to redirect on target profile page', async function (assert) {
      const targetProfileSummary = store.createRecord('target-profile-summary', {
        id: 666,
        name: 'Number of The Beast',
      });
      const organization = store.createRecord('organization', {
        id: 1,
        targetProfiles: [],
        targetProfileSummaries: [targetProfileSummary],
      });

      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);

      assert
        .dom(screen.getByRole('link', { name: 'Number of The Beast' }))
        .hasAttribute('href', '/target-profiles/666');
    });

    module('when detaching a target profile from an organization', function () {
      test('it should display an Actions column with a detach button', async function (assert) {
        // given
        const publicTargetProfileSummary = store.createRecord('target-profile-summary', {
          id: 666,
          name: 'Number of The Beast',
          canDetach: false,
        });
        const privateTargetProfileSummary = store.createRecord('target-profile-summary', {
          id: 777,
          name: 'Super Lucky',
          canDetach: true,
        });
        const organization = store.createRecord('organization', {
          id: 1,
          targetProfiles: [],
          targetProfileSummaries: [publicTargetProfileSummary, privateTargetProfileSummary],
        });

        this.set('organization', organization);

        // when
        const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);

        //then
        assert.ok(screen.getByText('Actions'));
        const row = screen.getByRole('cell', { name: 'Super Lucky' }).closest('tr');
        assert.ok(within(row).getByRole('button', { name: 'Détacher' }));
      });

      test('it should open confirm modal when click on "Détacher" button', async function (assert) {
        // given
        const targetProfileSummary = store.createRecord('target-profile-summary', {
          id: 666,
          name: 'Number of The Beast',
          canDetach: true,
        });
        const organization = store.createRecord('organization', {
          id: 1,
          targetProfiles: [],
          targetProfileSummaries: [targetProfileSummary],
        });

        this.set('organization', organization);
        // when
        const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);
        const detachButton = screen.getByRole('button', { name: 'Détacher' });
        await click(detachButton);
        await screen.findByRole('dialog');
        //then
        assert.ok(screen.getByRole('heading', { name: "Détacher le profil cible de l'organisation" }));
      });

      test('it should detach a target profile when click on "Confirmer" button', async function (assert) {
        // given

        const notificationService = this.owner.lookup('service:notifications');
        sinon.stub(notificationService, 'success');

        const adapter = store.adapterFor('target-profile');
        const detachOrganizationsTargetProfileStub = sinon.stub(adapter, 'detachOrganizations').resolves();
        const targetProfileSummary = store.createRecord('target-profile-summary', {
          id: 666,
          name: 'Number of The Beast',
          canDetach: true,
        });
        const organization = store.createRecord('organization', {
          id: 1,
          targetProfiles: [],
          targetProfileSummaries: [targetProfileSummary],
          get: sinon.stub().returns({ reload: sinon.stub() }),
        });

        this.set('organization', organization);

        //when
        const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);
        const detachButton = screen.getByRole('button', { name: 'Détacher' });
        await click(detachButton);
        const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
        await click(confirmButton);
        // then
        assert.true(detachOrganizationsTargetProfileStub.calledOnceWith(targetProfileSummary.id));
      });

      test('it should show a notification on success', async function (assert) {
        // given
        const notificationService = this.owner.lookup('service:notifications');
        const notificationSuccessStub = sinon.stub(notificationService, 'success');

        const adapter = store.adapterFor('target-profile');
        sinon.stub(adapter, 'detachOrganizations').resolves();

        const organization = store.createRecord('organization', {
          id: 1,
          targetProfiles: [],
          targetProfileSummaries: [
            store.createRecord('target-profile-summary', {
              id: 666,
              name: 'Number of The Beast',
              canDetach: true,
            }),
          ],
          get: sinon.stub().returns({ reload: sinon.stub() }),
        });

        this.set('organization', organization);
        // when
        const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);
        const detachButton = screen.getByRole('button', { name: 'Détacher' });
        await click(detachButton);
        const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
        await click(confirmButton);

        // then
        assert.ok(notificationSuccessStub.calledOnceWithExactly('Profil cible détaché avec succès.'));
      });
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to add target profiles', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
      });
      this.set('organization', organization);
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{this.organization}} />`);

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
      assert.dom(screen.queryByText('Rattacher un ou plusieurs profil(s) cible(s)')).doesNotExist();
    });
  });
});
