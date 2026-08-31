import { render } from '@1024pix/ember-testing-library';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { click } from '@ember/test-helpers';
import Component from '@glimmer/component';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

class NavigationHarness extends Component {
  @service router;

  @action
  triggerNavigation() {
    this.router.transitionTo('authenticated.organizations.get', '42');
  }

  <template>
    <button type="button" {{on "click" this.triggerNavigation}}>
      Voir l&apos;organisation
    </button>
  </template>
}

module("Integration | Component | assistant — lien de succès vers l'organisation", function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  test("le lien de succès navigue vers la page de l'organisation", async function (assert) {
    // given
    const router = this.owner.lookup('service:router');
    sinon.stub(router, 'transitionTo');

    const screen = await render(<template><NavigationHarness /></template>);

    // when
    await click(screen.getByText("Voir l'organisation"));

    // then
    assert.ok(router.transitionTo.calledOnce, 'router.transitionTo appelé une fois');
    assert.deepEqual(router.transitionTo.firstCall.args, ['authenticated.organizations.get', '42']);
  });
});
