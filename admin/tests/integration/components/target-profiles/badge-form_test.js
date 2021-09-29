import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::BadgeForm', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the form', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom('form').exists();
    assert.dom('input').exists();
  });

  test('it should display the expected number of inputs', async function(assert) {
    // given
    const expectedNumberOfInputsInForm = 7;
    const expectedNumberOfCheckboxesInForm = 2;

    // when
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    const actualNumberOfInputsInForm = findAll('input').length;
    assert.equal(actualNumberOfInputsInForm, expectedNumberOfInputsInForm);

    const actualNumberOfCheckboxesInForm = findAll('input[type="checkbox"]').length;
    assert.equal(actualNumberOfCheckboxesInForm, expectedNumberOfCheckboxesInForm);
  });

  test('it should display form actions', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom('a[data-test="badge-form-cancel-button"]').exists();
  });
});
