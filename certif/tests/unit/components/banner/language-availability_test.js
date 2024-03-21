import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Banner::LanguageAvailability', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#closeBanner', function () {
    test('calls session service method updateDataAttribute', async function (assert) {
      // given
      const sessionService = this.owner.lookup('service:session');
      const component = await createGlimmerComponent('component:banner/language-availability');

      component.session = sessionService;
      sinon.stub(sessionService, 'updateDataAttribute');

      // when
      component.closeBanner();

      // then
      assert.true(sessionService.updateDataAttribute.calledWithExactly('localeNotSupportedBannerClosed', true));
    });
  });
});
