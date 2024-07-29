/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setBreakpoint } from 'ember-responsive/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Profile-content', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('On component rendering', function (hooks) {
    let model;

    hooks.beforeEach(function () {
      this.owner.register(
        'service:session',
        Service.extend({
          data: {
            authenticated: {
              access_token: 'VALID-TOKEN',
            },
          },
        }),
      );

      model = {
        profile: {
          pixScore: '34',
          get: () => 7,
          areas: [{ code: 0 }, { code: 1 }],
          scorecards: [
            {
              id: 1,
              areaColor: 0,
              level: 3,
              name: 'Name',
              percentageAheadOfNextLevel: 0.5,
              area: {
                code: 0,
                title: 'Area title',
              },
            },
            {
              id: 2,
              areaColor: 1,
              level: 2,
              name: 'Name 2',
              percentageAheadOfNextLevel: 0.5,
              area: {
                code: 1,
                title: 'Area title 2',
              },
            },
          ],
        },
      };
    });

    module('When user is on tablet/desktop ', function () {
      test('should be rendered in tablet/desktop mode with big cards', async function (assert) {
        // when
        setBreakpoint('tablet');
        this.set('model', model);
        this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
        await render(hbs`<ProfileContent @model={{this.model}} @media={{this.media}} />`);

        // then
        assert.dom('.competence-card').exists();
        assert.dom('.score-label').exists();
        assert.dom('.competence-card__interactions').exists();
      });
    });

    module('When user is on mobile', function () {
      test('should be rendered in mobile mode with small cards', async function (assert) {
        // when
        setBreakpoint('mobile');
        this.set('model', model);
        this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
        await render(hbs`<ProfileContent @model={{this.model}} @media={{this.media}} />`);

        // then
        assert.dom('.competence-card').exists();
        assert.dom('.score-label').doesNotExist();
        assert.dom('.competence-card__interactions').doesNotExist();
      });
    });
  });
});
