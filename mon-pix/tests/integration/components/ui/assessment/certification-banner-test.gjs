import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Assessment | Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const nbChallenges = 15;

  hooks.beforeEach(function () {
    class CurrentUserStub extends Service {
      user = { id: 2, isAnonymous: false };
    }

    this.owner.register('service:currentUser', CurrentUserStub);
  });

  function createCertificationAssessment(store) {
    return store.createRecord('assessment', {
      type: 'CERTIFICATION',
      certificationNumber: 1234,
      certificationCourse: store.createRecord('certification-course', {
        nbChallenges,
        firstName: 'Pouet-pouit flop',
        lastName: 'miaou',
      }),
    });
  }

  test('should render component with user fullName', async function (assert) {
    //given
    const store = this.owner.lookup('service:store');
    const assessment = createCertificationAssessment(store);

    // when
    const screen = await render(<template><AssessmentBanner @assessment={{assessment}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Pouet Pouit Flop MIAOU' })).exists();
  });

  test('displays the certification number', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const assessment = createCertificationAssessment(store);

    // when
    const screen = await render(<template><AssessmentBanner @assessment={{assessment}} /></template>);

    // then
    assert.dom(screen.getByText(t('components.info-bar.certification-number'))).exists();
    assert.dom(screen.getByText('1 234')).exists();
  });

  test('displays the progression within the certification course', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const assessment = createCertificationAssessment(store);
    const currentChallengeNumber = 2;

    // when
    const screen = await render(
      <template>
        <AssessmentBanner @assessment={{assessment}} @currentChallengeNumber={{currentChallengeNumber}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText(t('components.info-bar.progress.label'))).exists();
    assert
      .dom(screen.getByLabelText(t('components.info-bar.progress.position', { current: 3, total: nbChallenges })))
      .hasText(`3 / ${nbChallenges}`);
  });

  test('does not display the quit button nor the text to speech button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const assessment = createCertificationAssessment(store);

    // when
    const screen = await render(
      <template>
        <AssessmentBanner
          @assessment={{assessment}}
          @displayHomeLink={{true}}
          @displayTextToSpeechActivationButton={{true}}
        />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: t('common.actions.quit') })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Activer la vocalisation' })).doesNotExist();
  });
});
