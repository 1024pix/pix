import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  isAdminInOrganization = true
  organization = {
    credit: 10000,
  };
}

module('Integration | Component | organization-credit-info', function(hooks) {
  setupIntlRenderingTest(hooks);
  let currentUserStub;

  hooks.beforeEach(function() {
    this.owner.register('service:current-user', CurrentUserStub);
    currentUserStub = this.owner.lookup('service:current-user', CurrentUserStub);
  });

  test('should display organization credit info', async function(assert) {
    // when
    await render(hbs`<OrganizationCreditInfo />`);
    const displayedCreditInfo = document.querySelector('.organization-credit-info').textContent;

    // then
    assert.contains(displayedCreditInfo.trim());
  });

  test('should display credit number label', async function(assert) {
    // when
    await render(hbs`<OrganizationCreditInfo />`);
    const displayedCredit = document.querySelector('.organization-credit-info__label').textContent;
    const expectedCredit = '10 000 crédits';

    // then
    assert.contains(expectedCredit);
    assert.equal(displayedCredit, expectedCredit);
  });

  test('should display tooltip info', async function(assert) {
    // when
    await render(hbs`<OrganizationCreditInfo />`);
    const displayedContentTooltip = document.querySelector('.pix-tooltip__content').textContent;

    // then
    assert.contains(displayedContentTooltip.trim());
  });

  test('should change the credit value when changing organization that has credits ', async function(assert) {
    // given
    currentUserStub.organization.credit = 500;

    // when
    await render(hbs`<OrganizationCreditInfo />`);
    const displayedCredit = document.querySelector('.organization-credit-info__label').textContent;
    const expectedCredit = currentUserStub.organization.credit.toLocaleString() + ' crédits';

    // then
    assert.contains(expectedCredit);
    assert.equal(displayedCredit, expectedCredit);
  });

  test('should display "credit" when credit is equal 1', async function(assert) {
    // given
    currentUserStub.organization.credit = 1;

    // when
    await render(hbs`<OrganizationCreditInfo />`);
    const displayedCredit = document.querySelector('.organization-credit-info__label').textContent;
    const expectedCredit = currentUserStub.organization.credit.toLocaleString() + ' crédit';

    // then
    assert.contains(expectedCredit);
    assert.equal(displayedCredit, expectedCredit);
  });

  test('should be hidden when credit is less than 1', async function(assert) {
    // given
    currentUserStub.organization.credit = 0;

    // when
    await render(hbs`<OrganizationCreditInfo />`);

    // then
    assert.notContains('crédit');
  });

  test('should hiden when the prescriber is not ADMIN', async function(assert) {
    // given
    currentUserStub.isAdminInOrganization = false;

    // when
    await render(hbs`<OrganizationCreditInfo />`);

    // then
    assert.notContains('crédit');
    assert.notContains('crédits');
    assert.equal(currentUserStub.isAdminInOrganization, false);
  });

});
