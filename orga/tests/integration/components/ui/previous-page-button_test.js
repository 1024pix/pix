import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Ui::PreviousPageButton', function (hooks) {
  setupRenderingTest(hooks);
  let routerService;

  hooks.beforeEach(function () {
    routerService = this.owner.lookup('service:router');

    sinon.stub(routerService, 'transitionTo');
  });

  test('it should render previous page button', async function (assert) {
    // when
    const screen = await render(hbs`<Ui::PreviousPageButton @backButtonAriaLabel='Une instruction' />`);

    // then
    assert.ok(screen.getByRole('button', { name: 'Une instruction' }));
  });

  test('it should render with yielded content', async function (assert) {
    // when
    const screen = await render(
      hbs`<Ui::PreviousPageButton aria-label='Nom de la campagne'>Coucou</Ui::PreviousPageButton>`,
    );

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: 'Nom de la campagne', value: 'Coucou' }));
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
