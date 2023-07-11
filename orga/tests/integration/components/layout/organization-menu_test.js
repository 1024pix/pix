import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | Layout::OrganizationMenu', function (hooks) {
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

  test('should display the user current organization name', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationMenu />`);

    // then
    assert.contains(`${organization.name}`);
  });

  test('should display the chevron-down icon when menu is close', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationMenu />`);

    // then
    assert.dom('.fa-chevron-down').exists();
    assert.dom('.fa-chevron-up').doesNotExist();
  });

  test('should display the chevron-up icon when menu is open', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationMenu />`);
    await clickByName('Sélectionner une organisation');

    // then
    assert.dom('.fa-chevron-up').exists();
    assert.dom('.fa-chevron-down').doesNotExist();
  });

  test('should display the organizations name when menu is open', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationMenu />`);
    await clickByName('Sélectionner une organisation');

    // then
    assert.contains(organization2.name);
    assert.contains(organization3.name);
  });
});
