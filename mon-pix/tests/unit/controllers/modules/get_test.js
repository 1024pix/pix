import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Module | Controller | get', function (hooks) {
  setupTest(hooks);

  module('#action submitAnswer', function () {
    test('it should use the store and save the element answer', async function (assert) {
      // given
      const expectedCorrection = 'correction';
      const userResponse = 'userResponse';
      const elementId = 'elementId';
      const passageId = 'passageId';
      const element = 'element';
      const moduleSlug = 'moduleSlug';

      const answerData = {
        userResponse,
        elementId,
        moduleSlug,
        element,
      };

      const metricAddStub = sinon.stub();

      class MetricsStubService extends Service {
        add = metricAddStub;
      }

      this.owner.register('service:metrics', MetricsStubService);
      const metricsService = this.owner.lookup('service:metrics');

      const controller = this.owner.lookup('controller:module/get');
      controller.model = {
        module: {
          id: moduleSlug,
        },
        passage: {
          id: passageId,
        },
      };

      controller.store = {
        createRecord: sinon.stub(),
      };
      const saveStub = sinon.stub();

      controller.store.createRecord
        .withArgs('element-answer', {
          userResponse,
          element,
        })
        .returns({
          save: saveStub,
        });

      saveStub
        .withArgs({
          adapterOptions: {
            passageId,
          },
        })
        .resolves({ correction: expectedCorrection });

      // when
      await controller.submitAnswer(answerData);

      // then
      sinon.assert.calledWith(metricsService.add, {
        event: 'custom-event',
        'pix-event-category': 'Modulix',
        'pix-event-action': `Passage du module : ${moduleSlug}`,
        'pix-event-name': `Click sur le bouton vérifier de l'élément : ${elementId}`,
      });
      assert.ok(true);
    });
  });
});
