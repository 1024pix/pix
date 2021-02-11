import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | previous-page-button', function(hooks) {
  setupRenderingTest(hooks);
  let transitionToStub;

  hooks.beforeEach(function() {
    transitionToStub = sinon.stub();
    class RouterStub extends Service {
      transitionTo = transitionToStub;
    }
    this.owner.register('service:router', RouterStub);
  });

  test('it should render button with yielded content', async function(assert) {
    // when
    await render(hbs`<PreviousPageButton @ariaLabel="Une instruction">Coucou</PreviousPageButton>`);

    // then
    assert.dom('[aria-label="Une instruction"]').exists();
    assert.contains('Coucou');
  });

  module('when clicked on', function() {
    test('it should transition to specified route with provided routeId param if any', async function(assert) {
      // given
      this.route = 'someRoute';
      this.routeId = 'someRouteId';
      await render(hbs`<PreviousPageButton @route={{this.route}} @routeId={{this.routeId}} @ariaLabel="Une instruction"></PreviousPageButton>`);

      // when
      await clickByLabel('Une instruction');

      // then
      assert.ok(transitionToStub.calledWith(this.route, this.routeId));
    });

    test('it should transition to specified route without any params if no routeId param provided', async function(assert) {
      // given
      this.route = 'someRoute';
      this.routeId = 'someRouteId';
      await render(hbs`<PreviousPageButton @route={{this.route}} @ariaLabel="Une instruction"></PreviousPageButton>`);

      // when
      await clickByLabel('Une instruction');

      // then
      assert.ok(transitionToStub.calledWith(this.route));
    });
  });
});
