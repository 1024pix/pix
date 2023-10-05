import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  isAdminInOrganization = true;
  organization = {
    credit: 10000,
  };
}

module('Integration | Component | Layout::OrganizationCreditInfo', function (hooks) {
  setupIntlRenderingTest(hooks);
  let currentUserStub;

  hooks.beforeEach(function () {
    this.owner.register('service:current-user', CurrentUserStub);
    currentUserStub = this.owner.lookup('service:current-user', CurrentUserStub);
  });

  test('should display organization credit info', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationCreditInfo />`);

    // then
    assert.contains('10 000 crédits');
  });

  test('should display tooltip info', async function (assert) {
    // when
    await render(hbs`<Layout::OrganizationCreditInfo />`);

    // then
    assert.contains(
      'Le nombre de crédits affichés correspond au nombre de crédits acquis par l’organisation et en cours de validité (indépendamment de leur activation).',
    );
  });

  test('should display "credit" when credit is equal 1', async function (assert) {
    // given
    currentUserStub.organization.credit = 1;

    // when
    await render(hbs`<Layout::OrganizationCreditInfo />`);

    // then
    assert.contains('1 crédit');
  });

  test('should be hidden when credit is less than 1', async function (assert) {
    // given
    currentUserStub.organization.credit = 0;

    // when
    await render(hbs`<Layout::OrganizationCreditInfo />`);

    // then
    assert.notContains('crédit');
  });

  test('should hiden when the prescriber is not ADMIN', async function (assert) {
    // given
    currentUserStub.isAdminInOrganization = false;

    // when
    await render(hbs`<Layout::OrganizationCreditInfo />`);

    // then
    assert.notContains('crédit');
    assert.notContains('crédits');
  });
});
