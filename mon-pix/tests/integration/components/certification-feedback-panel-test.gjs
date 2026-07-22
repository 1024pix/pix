import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CertificationFeedbackPanel from 'mon-pix/components/certification-feedback-panel';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification-feedback-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Default rendering', function () {
    test('should not display the feedback panel', async function (assert) {
      // given & when
      const store = this.owner.lookup('service:store');
      const mockAssessment = store.createRecord('assessment', {
        state: 'started',
      });
      const assessment = mockAssessment;

      const screen = await render(<template><CertificationFeedbackPanel @assessment={{assessment}} /></template>);

      // then
      assert.dom(screen.queryByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).doesNotExist();
    });

    module('when warning the invigilator', function () {
      test('should close the panel if the candidate decides to return to the challenge', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const submitLiveAlert = sinon.stub();
        const mockAssessment = store.createRecord('assessment', {
          hasOngoingChallengeLiveAlert: false,
        });
        const assessment = mockAssessment;
        const screen = await render(
          <template>
            <CertificationFeedbackPanel
              @submitLiveAlert={{submitLiveAlert}}
              @assessment={{assessment}}
              @isEnabled={{true}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
        assert.dom(screen.getByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).exists();

        await click(screen.getByRole('button', { name: "Non, je reviens à l'épreuve" }));

        // then
        assert.dom(screen.queryByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).doesNotExist();
      });

      module('when the candidate decides to report a problem', function () {
        test('should display a notification', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const submitLiveAlert = sinon.stub();

          const mockAssessment = store.createRecord('assessment', {
            hasOngoingChallengeLiveAlert: true,
          });
          const assessment = mockAssessment;

          const screen = await render(
            <template>
              <CertificationFeedbackPanel @submitLiveAlert={{submitLiveAlert}} @assessment={{assessment}} />
            </template>,
          );

          // then
          assert.dom(screen.getByText('En attente du surveillant...')).exists();
          assert
            .dom(
              screen.getByText(
                "Prévenez votre surveillant afin qu'il puisse constater votre problème et le gérer en direct dans son interface « Espace Surveillant ».",
              ),
            )
            .exists();
        });

        test('should display a refresh button', async function (assert) {
          const store = this.owner.lookup('service:store');
          const submitLiveAlertActions = sinon.stub();
          const submitLiveAlert = submitLiveAlertActions;

          const mockAssessment = store.createRecord('assessment', {
            hasOngoingChallengeLiveAlert: true,
          });
          const assessment = mockAssessment;

          const screen = await render(
            <template>
              <CertificationFeedbackPanel @submitLiveAlert={{submitLiveAlert}} @assessment={{assessment}} />
            </template>,
          );

          // then
          assert.dom(screen.getByText('En attente du surveillant...')).exists();
          assert.dom(screen.getByText('Rafraîchir la page')).exists();
        });
      });
    });
  });
});
