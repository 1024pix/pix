import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CappedTubesCriterion from 'pix-admin/components/common/tubes-selection/capped-tubes-criterion';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Common::CappedTubesCriterion', function (hooks) {
  setupIntlRenderingTest(hooks);

  const areas = [];
  const noop = sinon.stub();

  test('it should not display the expand and collapse buttons by default', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CappedTubesCriterion
          @id="criterion"
          @areas={{areas}}
          @onTubesSelectionChange={{noop}}
          @onNameChange={{noop}}
          @onThresholdChange={{noop}}
          @remove={{noop}}
        />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: t('components.expandable-accordions.expand-all') })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Tout replier' })).doesNotExist();
  });

  test('it should display the expand and collapse buttons when asked to', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CappedTubesCriterion
          @id="criterion"
          @areas={{areas}}
          @onTubesSelectionChange={{noop}}
          @onNameChange={{noop}}
          @onThresholdChange={{noop}}
          @remove={{noop}}
          @displayExpandAllButtons={{true}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: t('components.expandable-accordions.expand-all') })).exists();
    assert.dom(screen.getByRole('button', { name: 'Tout replier' })).exists();
  });
});
