import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | Preview', function (hooks) {
  setupTest(hooks);

  module('#constructor', function () {
    test('should enable preview mode service', async function (assert) {
      // given
      const enableStub = sinon.stub();
      class PreviewModeServiceStub extends Service {
        enable = enableStub;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

      // when
      createGlimmerComponent('module/preview');

      // then
      assert.true(enableStub.calledOnce);
    });
  });
});
