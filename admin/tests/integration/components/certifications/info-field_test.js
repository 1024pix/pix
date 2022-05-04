import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/info-field', function (hooks) {
  setupRenderingTest(hooks);

  module('[Consultation mode]', function () {
    test('it should be in "consultation (read only) mode" by default when @edition (optional) argument is not provided', async function (assert) {
      // given & when
      const screen = await render(hbs`<Certifications::InfoField @label='Field label:' @value='field_value' />`);

      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Field label:' })).doesNotExist();
    });

    test('it should render label and field value', async function (assert) {
      // given & when
      const screen = await render(hbs`<Certifications::InfoField @label='Session:' @value='commencé' />`);

      // then
      assert.dom(screen.getByText('Session:')).containsText('commencé');
    });

    test('it should render field value with suffix when @suffix (optional) argument is provided', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Certifications::InfoField @label='Session:' @value='commencé' @suffix='unit(s)' />`
      );

      // then
      assert.dom(screen.getByText('Session:')).containsText('commencé unit(s)');
    });

    test('it should format value as date with format "DD/MM/YYYY" when @isDate (optional) argument is set to "true"', async function (assert) {
      // given
      this.set('value', new Date('1961-08-04'));

      // when
      const screen = await render(
        hbs`<Certifications::InfoField @label='Date de naissance:' @value={{this.value}} @isDate=true />`
      );

      // then
      assert.dom(screen.getByText('Date de naissance:')).containsText('04/08/1961');
    });

    test('it should display value as link when @linkRoute (optional) argument is provided', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Certifications::InfoField @label='Session:' @value=1234 @linkRoute="authenticated.sessions.session" />`
      );

      // then
      assert.dom(screen.getByText('Session:')).containsText('1234');
      assert.dom(screen.getByRole('link', { name: '1234' })).exists();
    });
  });

  module('[Edition mode]', function () {
    test('it should be in "edition (writable) mode" when @edition (optional) argument is set to "true"', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Certifications::InfoField @label='Publiée :' @value='oui' @edition=true @fieldId="certification-publication" />`
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Publiée :' })).exists();
    });

    test('it should display field value with suffix when @suffix (optional) argument is provided', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Certifications::InfoField @label='Field label:' @value='field_value' @suffix='unit(s)' @edition=true />`
      );

      // then
      assert.dom(screen.getByText('unit(s)')).exists();
    });
  });
});
