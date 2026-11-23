import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Checkpoint from 'mon-pix/templates/assessments/checkpoint';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Template | Assessments | Checkpoint', function (hooks) {
  setupIntlRenderingTest(hooks);

  let assessment;

  hooks.beforeEach(function () {
    class CurrentUserStub extends Service {
      user = { id: 2, isAnonymous: false };
    }

    this.owner.register('service:currentUser', CurrentUserStub);

    const store = this.owner.lookup('service:store');
    const campaign = store.createRecord('campaign', {
      id: 12,
      customResultPageButtonUrl: null,
    });
    assessment = store.createRecord('assessment', {
      title: 'Mon titre',
      type: 'CAMPAIGN',
      campaign,
    });
  });

  module('sharing results banner', function () {
    test('it should display share results information banner', async function (assert) {
      // given
      const controller = {
        displayShareResultsBanner: true,
        shouldDisplayAnswers: false,
      };
      const model = assessment;

      // when
      const screen = await render(
        <template>
          <div id="pix-layout-banner-container" />
          <Checkpoint @model={{model}} @controller={{controller}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.checkpoint.sharing-results.information-banner'), { exact: false }));
    });

    test('it should not display share results information banner', async function (assert) {
      // given
      const controller = {
        displayShareResultsBanner: false,
        shouldDisplayAnswers: false,
      };
      const model = assessment;

      // when
      const screen = await render(
        <template>
          <div id="pix-layout-banner-container" />
          <Checkpoint @model={{model}} @controller={{controller}} />
        </template>,
      );

      // then
      assert.notOk(screen.queryByText(t('pages.checkpoint.sharing-results.information-banner'), { exact: false }));
    });
  });
});
