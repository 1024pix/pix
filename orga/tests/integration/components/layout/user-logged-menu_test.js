import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | Layout::UserLoggedMenu', function (hooks) {
  setupIntlRenderingTest(hooks);

  let prescriber, organization, organization2, organization3;

  hooks.beforeEach(function () {
    organization = Object.create({ id: 1, name: 'Main organization', externalId: 'EXT' });
    prescriber = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
    });
    organization2 = Object.create({ id: 2, name: 'Organization 2', externalId: 'EXT2' });
    organization3 = Object.create({ id: 3, name: 'Organization 3', externalId: 'EXT3' });

    class CurrentUserStub extends Service {
      organization = organization;
      prescriber = prescriber;
      memberships = [
        Object.create({ organization }),
        Object.create({ organization: organization2 }),
        Object.create({ organization: organization3 }),
      ];
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test("should display user's firstName and lastName", async function (assert) {
    // when
    await render(hbs`<Layout::UserLoggedMenu />`);

    // then
    assert.contains(`${prescriber.firstName} ${prescriber.lastName}`);
  });

  test('should display the user current organization name and externalId', async function (assert) {
    // when
    await render(hbs`<Layout::UserLoggedMenu />`);

    // then
    assert.contains(`${organization.name} (${organization.externalId})`);
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
    await render(hbs`<Layout::UserLoggedMenu />`);
    await clickByName('Ouvrir le menu utilisateur');

    // then
    assert.contains('Se déconnecter');
  });

  test('should display the organizations name and externalId when menu is open', async function (assert) {
    // when
    await render(hbs`<Layout::UserLoggedMenu />`);
    await clickByName('Ouvrir le menu utilisateur');

    // then
    assert.contains(organization2.name);
    assert.contains(`(${organization2.externalId})`);
    assert.contains(organization3.name);
    assert.contains(`(${organization3.externalId})`);
  });
});
