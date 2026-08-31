import { render } from '@1024pix/ember-testing-library';
import CappedTubesCriterion from 'pix-admin/components/target-profiles/badge-form/capped-tubes-criterion';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::BadgeForm::CappedTubesCriterion', function (hooks) {
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
    assert.dom(screen.queryByRole('button', { name: 'Tout déplier' })).doesNotExist();
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
    assert.dom(screen.getByRole('button', { name: 'Tout déplier' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Tout replier' })).exists();
  });
});
