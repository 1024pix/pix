import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Unit | Component | Organizations::ListItems', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.triggerFiltering = () => {};
    this.goToOrganizationPage = () => {};
    this.detachOrganizations = sinon.stub();

    const organization1 = { id: 123, name: 'Orga1', externalId: 'O1' };
    const organization2 = { id: 456, name: 'Orga2', externalId: 'O2' };
    const organizations = [organization1, organization2];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = organizations;
  });

  test('it should not display an Actions column to detach organizations', async function (assert) {
    // given
    const screen = await render(
      hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
/>`
    );

    // then
    assert.dom(screen.queryByText('Actions')).doesNotExist();
    assert.strictEqual(screen.queryAllByRole('button', { name: "Détacher l'organisation" }).length, 0);
  });

  module('when detaching organizations from a target profiles', () => {
    test('it should display an Actions column to detach organizations', async function (assert) {
      // given
      const screen = await render(
        hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @showDetachColumn={{true}}
/>`
      );

      // then
      assert.strictEqual(
        screen.queryAllByRole('button', { name: "Détacher l'organisation" }).length,
        this.organizations.length
      );
      screen.queryByText('Actions');
      assert.dom(screen.queryByText('Actions')).exists();
    });

    test('it should detach an organization when the user cliks on "Désactiver" button', async function (assert) {
      // given
      const screen = await render(
        hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @showDetachColumn={{true}}
/>`
      );
      const detachButton = screen.queryAllByRole('button', { name: "Détacher l'organisation" })[0];

      //when
      await click(detachButton);

      // then
      assert.true(this.detachOrganizations.calledWith(this.organizations[0].id));
    });
  });
});
