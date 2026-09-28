import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui | Assessment | Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const assessment = {};

  module('On component rendering', function (hooks) {
    const firstName = 'tom';
    const lastName = 'jedusor';
    const fullName = 'Tom JEDUSOR';
    const certificationNumber = 100;
    const state = {};

    hooks.beforeEach(function () {
      // given
      const certification = EmberObject.create({
        id: certificationNumber,
        firstName,
        lastName,
      });
      state.certificationNumber = certificationNumber;
      state.certification = certification;
    });

    test('should render component with user fullName', async function (assert) {
      // when
      const screen = await render(
        <template><AssessmentBanner @certification={{state.certification}} @assessment={{assessment}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: fullName })).exists();
    });

    test('should render component with certificationNumber', async function (assert) {
      // when
      const certification = EmberObject.create({
        id: certificationNumber,
        firstName,
        lastName,
      });
      const screen = await render(
        <template>
          <AssessmentBanner
            @certificationNumber={{state.certificationNumber}}
            @assessment={{assessment}}
            @certification={{certification}}
          />
        </template>,
      );
      // then
      assert.dom(screen.getByText('N° de certification')).exists();
      assert.dom(screen.getByText(certificationNumber)).exists();
    });
  });
});
