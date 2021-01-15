import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | <Certification::CertificationInfoField/>', function(hooks) {
  setupRenderingTest(hooks);

  module('[Consultation mode]', async function() {

    test('it should be in "consultation (read only) mode" by default when @edition (optional) argument is not provided', async function(assert) {

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Field label:' @value='field_value' />`);

      // Then
      assert.dom('.certification-info-field').doesNotHaveClass('edited');
    });

    test('it should render label and field value', async function(assert) {

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Field label:' @value='field_value' />`);

      // Then
      assert.dom('.certification-info-field .certification-info-field__label').hasText('Field label:');
      assert.dom('.certification-info-field .certification-info-value').hasText('field_value');
    });

    test('it should render field value with suffix when @suffix (optional) argument is provided', async function(assert) {

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Field label:' @value='field_value' @suffix='unit(s)' />`);

      // Then
      assert.dom('.certification-info-field .certification-info-value').hasText('field_value unit(s)');
    });

    test('it should format value as date with format "DD/MM/YYYY" when @isDate (optional) argument is set to "true"', async function(assert) {
      // Given
      this.set('value', new Date('1961-08-04'));

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Birth date:' @value={{this.value}} @isDate=true />`);

      // Then
      assert.dom('.certification-info-field .certification-info-value').hasText('04/08/1961');
    });

    test('it should display value as link when @linkRoute (optional) argument is provided', async function(assert) {
      // Given
      this.setProperties({
        label: 'Field label:',
        value: 'field_value',
      });

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Session:' @value=1234 @linkRoute="authenticated.sessions.session" />`);

      // Then
      assert.dom('.certification-info-field .certification-info-value').hasText('1234');
    });
  });

  module('[Edition mode]', async function() {

    test('it should be in "edition (writable) mode" when @edition (optional) argument is set to "true"', async function(assert) {

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Field label:' @value='field_value' @edition=true />`);

      // Then
      assert.dom('.certification-info-field').hasClass('edited');
    });

    test('it should display field value with suffix when @suffix (optional) argument is provided', async function(assert) {

      // When
      await render(hbs`<Certification::CertificationInfoField @label='Field label:' @value='field_value' @suffix='unit(s)' @edition=true />`);

      // Then
      assert.dom('.certification-info-field__suffix').hasText('unit(s)');
    });

    test('it should render a flatpickr when @isDate (optional) argument is set to "true"', async function(assert) {
      // Given
      this.setProperties({
        value: new Date('2019-02-18'),
        onUpdateCertificationBirthdate: () => resolve(),
      });

      // When
      await render(hbs`<Certification::CertificationInfoField
            @label='Birth date:'
            @value={{this.value}}
            @edition=true
            @isDate=true
            @onUpdateCertificationBirthdate={{this.onUpdateCertificationBirthdate}} />`);

      // Then
      assert.dom('.ember-flatpickr-input').exists();
    });
  });

});
