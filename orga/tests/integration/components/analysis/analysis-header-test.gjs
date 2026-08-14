import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AnalysisHeader from 'pix-orga/components/analysis/analysis-header';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | analysis-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('for campaign or global analysis', function () {
    test('it should navigate the competences view', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'currentRouteName').value('authenticated.campaigns.campaign.analysis.tubes');
      sinon.stub(router, 'transitionTo').resolves();
      const model = Symbol('model');

      // when
      const screen = await render(<template><AnalysisHeader @model={{model}} /></template>);

      // then
      await click(
        screen.getByRole('radio', { name: t('components.analysis-per-tube-or-competence.toggle.label-competences') }),
      );
      assert.ok(router.transitionTo.calledOnceWithExactly('authenticated.campaigns.campaign.analysis.competences'));
    });

    test('it should navigate the tubes view', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'currentRouteName').value('authenticated.campaigns.campaign.analysis.competences');
      sinon.stub(router, 'transitionTo').resolves();
      const model = Symbol('model');

      // when
      const screen = await render(<template><AnalysisHeader @model={{model}} /></template>);

      // then
      await click(screen.getByLabelText(t('components.analysis-per-tube-or-competence.toggle.label-tubes')));
      assert.ok(router.transitionTo.calledOnceWithExactly('authenticated.campaigns.campaign.analysis.tubes'));
    });
  });

  module('for participant assessment analysis', function () {
    test('it should navigate the competences view', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'currentRouteName').value('authenticated.campaigns.participant-assessment.analysis.tubes');
      sinon.stub(router, 'transitionTo').resolves();
      const model = { analysisData: Symbol('analysisData'), isForParticipant: true };

      // when
      const screen = await render(<template><AnalysisHeader @model={{model}} /></template>);

      // then
      await click(
        screen.getByRole('radio', { name: t('components.analysis-per-tube-or-competence.toggle.label-competences') }),
      );
      assert.ok(
        router.transitionTo.calledOnceWithExactly(
          'authenticated.campaigns.participant-assessment.analysis.competences',
        ),
      );
    });

    test('it should navigate the tubes view', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      sinon
        .stub(router, 'currentRouteName')
        .value('authenticated.campaigns.participant-assessment.analysis.competences');
      sinon.stub(router, 'transitionTo').resolves();
      const model = { analysisData: Symbol('analysisData'), isForParticipant: true };

      // when
      const screen = await render(<template><AnalysisHeader @model={{model}} /></template>);

      // then
      await click(screen.getByLabelText(t('components.analysis-per-tube-or-competence.toggle.label-tubes')));
      assert.ok(
        router.transitionTo.calledOnceWithExactly('authenticated.campaigns.participant-assessment.analysis.tubes'),
      );
    });
  });
});
