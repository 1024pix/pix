import { clickByName, render } from '@1024pix/ember-testing-library';
import Object from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout::UserLoggedMenu', function (hooks) {
  setupIntlRenderingTest(hooks);

  let prescriber, organization, organization2, organization3, loadStub;

  hooks.beforeEach(function () {
    organization = Object.create({ id: '1', name: 'Main organization', externalId: 'EXT' });
    prescriber = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
      userOrgaSettings: Object.create({
        id: 234,
      }),
    });
    organization2 = Object.create({ id: '2', name: 'Organization 2', externalId: 'EXT2' });
    organization3 = Object.create({ id: '3', name: 'Organization 3', externalId: 'EXT3' });
    loadStub = sinon.stub();

    class CurrentUserStub extends Service {
      organization = organization;
      prescriber = prescriber;
      memberships = [
        Object.create({ organization }),
        Object.create({ organization: organization2 }),
        Object.create({ organization: organization3 }),
      ];
      load = loadStub;
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test("should display user's firstName and lastName", async function (assert) {
    // when
    const screen = await render(hbs`<Layout::UserLoggedMenu />`);

    // then
    assert.ok(screen.getByText(`${prescriber.firstName} ${prescriber.lastName}`));
  });

  test('should display the user current organization name and externalId', async function (assert) {
    // when
    const screen = await render(hbs`<Layout::UserLoggedMenu />`);

    // then
    assert.ok(screen.getByText(`${organization.name} (${organization.externalId})`));
  });

  test('should display the chevron-down icon when menu is close', async function (assert) {
    // when
    await render(hbs`<Layout::UserLoggedMenu />`);

    // then
    assert.dom('.fa-chevron-down').exists();
    assert.dom('.fa-chevron-up').doesNotExist();
  });

  test('should display the chevron-up icon when menu is open', async function (assert) {
    // when
    await render(hbs`<Layout::UserLoggedMenu />`);
    await clickByName('Ouvrir le menu utilisateur');

    // then
    assert.dom('.fa-chevron-up').exists();
    assert.dom('.fa-chevron-down').doesNotExist();
  });

  test('should display the disconnect link when menu is open', async function (assert) {
    // when
    const screen = await render(hbs`<Layout::UserLoggedMenu />`);
    await clickByName('Ouvrir le menu utilisateur');

    // then
    assert.ok(screen.getByRole('link', { name: 'Se déconnecter' }));
  });

  test('should display the organizations name and externalId when menu is open', async function (assert) {
    // when
    const screen = await render(hbs`<Layout::UserLoggedMenu />`);
    await clickByName('Ouvrir le menu utilisateur');

    // then
    assert.ok(screen.getByRole('button', { name: `${organization2.name} (${organization2.externalId})` }));
    assert.ok(screen.getByRole('button', { name: `${organization3.name} (${organization3.externalId})` }));
  });

  test('should redirect to authenticated route before reload the current user', async function (assert) {
    const replaceWithStub = sinon.stub();
    const onChangeOrganization = sinon.stub();

    class RouterStub extends Service {
      replaceWith = replaceWithStub;
      currentRoute = { queryParams: [] };
    }

    class StoreStub extends Service {
      peekRecord() {
        return { save() {} };
      }
    }
    this.set('onChangeOrganization', onChangeOrganization);
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:store', StoreStub);

    const screen = await render(hbs`<Layout::UserLoggedMenu @onChangeOrganization={{this.onChangeOrganization}} />`);
    await clickByName('Ouvrir le menu utilisateur');
    await click(screen.getByRole('button', { name: `${organization2.name} (${organization2.externalId})` }));

    sinon.assert.callOrder(replaceWithStub, loadStub);
    assert.ok(onChangeOrganization.calledOnce);
  });
});
