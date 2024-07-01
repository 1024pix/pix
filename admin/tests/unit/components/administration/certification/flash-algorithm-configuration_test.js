import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Component | authenticated/certifications/flash-algorithm-configuration', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#onCreateFlashAlgorithmConfiguration', function () {
    test('should call createRecord with the correct parameters', async function (assert) {
      // given
      const component = createGlimmerComponent('component:administration/certification/flash-algorithm-configuration');
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('flash-algorithm-configuration');
      const createRecordStub = sinon.stub(adapter, 'createRecord');

      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      const event = {
        preventDefault: () => {},
      };

      const flashAlgorithmConfiguration = {
        maximumAssessmentLength: 0,
        warmUpLength: 1,
        challengesBetweenSameCompetence: 2,
        variationPercent: 3,
        variationPercentUntil: 4,
        doubleMeasuresUntil: 5,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
      };

      component.form = flashAlgorithmConfiguration;

      // when
      await component.onCreateFlashAlgorithmConfiguration(event);

      // then
      sinon.assert.calledWithExactly(createRecordStub, flashAlgorithmConfiguration);
      sinon.assert.calledWith(notificationSuccessStub, 'La configuration a été créée');
      assert.ok(true);
    });

    module('when an error occurs', function () {
      test('should display an error notification', async function (assert) {
        // given
        const component = createGlimmerComponent(
          'component:administration/certification/flash-algorithm-configuration',
        );
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('scoring-and-capacity-simulator-report');
        const createRecordStub = sinon.stub(adapter, 'createRecord');

        createRecordStub.rejects();

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        const event = {
          preventDefault: () => {},
        };

        const flashAlgorithmConfiguration = {
          maximumAssessmentLength: 0,
          warmUpLength: 1,
          challengesBetweenSameCompetence: 2,
          variationPercent: 3,
          variationPercentUntil: 4,
          doubleMeasuresUntil: 5,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
        };

        component.form = flashAlgorithmConfiguration;

        // when
        await component.onCreateFlashAlgorithmConfiguration(event);

        // then
        sinon.assert.calledWith(notificationErrorStub, "La configuration n'a pu être créée");
        assert.ok(true);
      });
    });
  });
});
