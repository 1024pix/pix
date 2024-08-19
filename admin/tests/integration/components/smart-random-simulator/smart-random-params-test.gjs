import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import SmartRandomParams from 'pix-admin/components/smart-random-simulator/smart-random-params';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | SmartRandomSimulator::TubesViewer', function (hooks) {
  setupRenderingTest(hooks);
  let component;
  const loadCampaignParams = sinon.stub();

  hooks.beforeEach(async function () {
    const knowledgeElements = [];
    const answers = [];
    const skills = [];
    const challenges = [];
    const locale = 'fr-fr';
    const assessmentId = 1;
    const updateParametersValue = () => {};

    component = <template>
      <SmartRandomParams
        @knowledgeElements={{knowledgeElements}}
        @answers={{answers}}
        @skills={{skills}}
        @challenges={{challenges}}
        @locale={{locale}}
        @assessmentId={{assessmentId}}
        @loadCampaignParams={{loadCampaignParams}}
        @updateParametersValue={{updateParametersValue}}
      />
    </template>;
  });

  module('when url does not contain campaign id search query', function () {
    test('should not call loadCampaignParams argument', async function (assert) {
      // when
      await render(component);

      // then
      sinon.assert.notCalled(loadCampaignParams);
      assert.ok(true);
    });
  });

  module('when url contains campaign id search query', function () {
    test('should call loadCampaignParams argument', async function (assert) {
      // given
      URLSearchParams.prototype.get = () => '12';

      // when
      await render(component);

      // then
      sinon.assert.calledOnce(loadCampaignParams);
      assert.ok(true);
    });
  });
});
