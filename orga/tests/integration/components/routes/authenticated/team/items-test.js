import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | routes/authenticated/team | list-items | items', function(hooks) {

  setupRenderingTest(hooks);
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
    assert.dom('button[aria-label="Afficher les actions"]').exists;
  });

  module('When edit organization role button is clicked', function() {

    test('it should show update and save button, and show the drop down to select role to update', async function(assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

      // when
      await clickByLabel('Afficher les actions');
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

      await clickByLabel('Afficher les actions');
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
      await clickByLabel('Afficher les actions');
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
      await clickByLabel('Afficher les actions');
      await clickByLabel('Modifier le rôle');

      // when
      await fillIn('select', 'MEMBER');
      await click('#save-organization-role');

      // then
      assert.equal(adminMembership.organizationRole, 'MEMBER');
      sinon.assert.called(adminMembership.save);
    });
  });
});
