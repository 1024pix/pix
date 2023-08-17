import { setupTest } from 'ember-qunit';
import { ENGLISH_INTERNATIONAL_LOCALE } from 'pix-orga/services/locale';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component |  login-or-register', (hooks) => {
  setupTest(hooks);

  module('onLanguageChange', () => {
    test('saves selected locale and remove lang from query params', async function (assert) {
      // given
      const component = await createGlimmerComponent('component:auth/login-or-register');
      const localeService = this.owner.lookup('service:locale');
      const routerService = this.owner.lookup('service:router');
      sinon.stub(localeService, 'setLocale');
      sinon.stub(routerService, 'replaceWith');

      component.args.organizationInvitationCode = 'ABCDE';
      component.args.organizationInvitationId = '12345';

      // when
      component.onLanguageChange(ENGLISH_INTERNATIONAL_LOCALE);

      // then
      sinon.assert.calledWith(localeService.setLocale, ENGLISH_INTERNATIONAL_LOCALE);
      sinon.assert.calledWith(routerService.replaceWith, 'join', {
        queryParams: {
          lang: null,
        },
      });

      assert.ok(component.selectedLanguage, ENGLISH_INTERNATIONAL_LOCALE);
    });
  });
});
