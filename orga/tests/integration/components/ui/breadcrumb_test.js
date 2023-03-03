import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | Ui | Breadcrumb', function (hooks) {
  setupIntlRenderingTest(hooks);

  class RoutingStub extends Service {
    generateURL() {
      return '/';
    }
  }

  hooks.beforeEach(function () {
    // Stubbing internal routing service of Ember because LinkTo needs it and we don't want to use the application router :/
    this.owner.register('service:-routing', RoutingStub);
  });

  test('it should display breadcrumbs with given item', async function (assert) {
    this.set('links', [
      {
        route: 'authenticated.campaigns',
        label: 'Campagnes',
      },
      {
        route: 'authenticated.campaigns.campaign',
        label: 'Campagne n°1',
        model: 1,
      },
      {
        route: 'authenticated.campaigns.participant-assessment',
        label: 'Participation de Luna Akajoua',
        models: [1, 4],
      },
    ]);

    // when
    const screen = await render(hbs`<Ui::Breadcrumb @links={{this.links}} />`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Campagnes', current: false })).exists();
    assert.dom(screen.getByRole('link', { name: 'Campagne n°1', current: false })).exists();
    assert.dom(screen.getByRole('link', { name: 'Participation de Luna Akajoua', current: 'page' })).exists();
  });
});
