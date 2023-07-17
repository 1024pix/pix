import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { clickByName } from '@1024pix/ember-testing-library';

module('Integration | Component | Ui::PreviousPageButton', function (hooks) {
  setupRenderingTest(hooks);
  let routerService;

  hooks.beforeEach(function () {
    routerService = this.owner.lookup('service:router');

    sinon.stub(routerService, 'transitionTo');
  });

  test('it should render previous page button', async function (assert) {
    // when
    await render(hbs`<Ui::PreviousPageButton @backButtonAriaLabel='Une instruction' />`);

    // then
    assert.dom('[aria-label="Une instruction"]').exists();
  });

  test('it should render with yielded content', async function (assert) {
    // when
    await render(hbs`<Ui::PreviousPageButton aria-label='Nom de la campagne'>Coucou</Ui::PreviousPageButton>`);

    // then
    assert.dom('[aria-label="Nom de la campagne"]').containsText('Coucou');
    assert.contains('Coucou');
  });

  module('when clicked on', function () {
    test('it should transition to specified route with provided routeId param if any', async function (assert) {
      // given
      this.route = 'someRoute';
      this.routeId = 'someRouteId';
      await render(
        hbs`<Ui::PreviousPageButton @route={{this.route}} @routeId={{this.routeId}} @backButtonAriaLabel='Une instruction' />`,
      );

      // when
      await clickByName('Une instruction');

      // then
      assert.ok(routerService.transitionTo.calledWith(this.route, this.routeId));
    });

    test('it should transition to specified route without any params if no routeId param provided', async function (assert) {
      // given
      this.route = 'someRoute';
      this.routeId = 'someRouteId';
      await render(hbs`<Ui::PreviousPageButton @route={{this.route}} @backButtonAriaLabel='Une instruction' />`);

      // when
      await clickByName('Une instruction');

      // then
      assert.ok(routerService.transitionTo.calledWith(this.route));
    });
  });
});
