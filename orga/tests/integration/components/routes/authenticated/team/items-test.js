import { module, test } from 'qunit';
import sinon from 'sinon';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/team | list-items | items', function(hooks) {

  setupIntlRenderingTest(hooks);
  let adminMembership;
  let memberMembership;

  hooks.beforeEach(function() {
    adminMembership = {
      id: 1,
      displayRole: 'Administrateur',
      organizationRole: 'ADMIN',
      user: {
        id: 111,
        firstName: 'Gigi',
        lastName: 'La Terreur',
      },
      save: sinon.stub(),
    };

    memberMembership = {
      id: 1,
      displayRole: 'Membre',
      organizationRole: 'MEMBER',
      user: {
        id: 111,
        firstName: 'Jojo',
        lastName: 'La Panique',
      },
      save: sinon.stub(),
    };
  });

  test('it should display an administrator firstName, lastName, role and edit button', async function(assert) {
    // given
    this.set('membership', adminMembership);

    // when
    await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('Administrateur');
    assert.dom('button[aria-label="Gérer"]').exists;
  });

  module('When edit organization role button is clicked', function() {

    test('it should show update and save button, and show the drop down to select role to update', async function(assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

      // when
      await clickByLabel('Gérer');
      await clickByLabel('Modifier le rôle');

      // then
      assert.dom('.zone-save-cancel-role').exists({ count: 1 });
      assert.dom('#save-organization-role').exists({ count: 1 });
      assert.dom('#cancel-update-organization-role').exists({ count: 1 });
    });

    test('it should cancel the update if using the cancel button', async function(assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

      await clickByLabel('Gérer');
      await clickByLabel('Modifier le rôle');

      // when
      await click('#cancel-update-organization-role');

      // then
      assert.equal(memberMembership.organizationRole, 'MEMBER');
      sinon.assert.notCalled(memberMembership.save);
    });

    test('it should change the value of the drop down to Administrateur and display the modified role', async function(assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);
      await clickByLabel('Gérer');
      await clickByLabel('Modifier le rôle');

      // when
      await fillIn('select', 'ADMIN');
      await click('#save-organization-role');

      // then
      assert.equal(memberMembership.organizationRole, 'ADMIN');
      sinon.assert.called(memberMembership.save);
    });

    test('it should change the value of the drop down to Membre and display the modified role', async function(assert) {
      // given
      this.set('membership', adminMembership);

      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);
      await clickByLabel('Gérer');
      await clickByLabel('Modifier le rôle');

      // when
      await fillIn('select', 'MEMBER');
      await click('#save-organization-role');

      // then
      assert.equal(adminMembership.organizationRole, 'MEMBER');
      sinon.assert.called(adminMembership.save);
    });
  });

  module('When remove member button is clicked', (hooks) => {

    let removeMembershipStub;

    hooks.beforeEach(async function() {
      // given
      removeMembershipStub = sinon.stub();
      memberMembership.user.get = (attr) => {
        return attr === 'firstName' ? memberMembership.user.firstName : memberMembership.user.lastName;
      };
      this.set('membership', memberMembership);
      this.set('removeMembership', removeMembershipStub);

      // when
      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}} @removeMembership={{removeMembership}} />`);
      await clickByLabel('Gérer');
      await clickByLabel('Supprimer');
    });

    test('should display a confirmation modal', (assert) => {
      // then
      assert.contains('Confirmez-vous la suppression ?');
      assert.contains('Annuler');
      assert.contains('Supprimer');
    });

    test('should display the membership first name and last name in the modal', (assert) => {
      // then
      assert.contains(memberMembership.user.firstName);
      assert.contains(memberMembership.user.lastName);
    });

    test('should close the modal by clicking on cancel button', async (assert) => {
      // when
      await clickByLabel('Annuler');

      // then
      assert.notContains('Supprimer de l\'équipe');
    });

    test('should call removeMembership and close modal by clicking on remove button', async (assert) => {
      // when
      await click('button[data-test-modal-remove-button]');

      // then
      sinon.assert.calledWith(removeMembershipStub, memberMembership);
      assert.notContains('Supprimer de l\'équipe');
    });
  });
});
