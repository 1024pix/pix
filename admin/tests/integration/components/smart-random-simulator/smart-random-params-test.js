import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | SmartRandomSimulator::TubesViewer', function (hooks) {
  setupRenderingTest(hooks);
  let loadCampaignParams;
  let component;

  hooks.beforeEach(async function () {
    loadCampaignParams = sinon.stub();
    this.set('knowledgeElements', []);
    this.set('answers', []);
    this.set('skills', []);
    this.set('challenges', []);
    this.set('locale', 'fr-fr');
    this.set('assessmentId', 1);
    this.set('loadCampaignParams', loadCampaignParams);
    this.set('updateParametersValue', () => {});

    component = hbs`
      <SmartRandomSimulator::SmartRandomParams
        @knowledgeElements={{this.knowledgeElements}}
        @answers={{this.answers}}
        @skills={{this.skills}}
        @challenges={{this.challenges}}
        @locale={{this.locale}}
        @assessmentId={{this.assessmentId}}
        @loadCampaignParams={{this.loadCampaignParams}}
        @updateParametersValue={{this.updateParametersValue}}
      />
    `;
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
