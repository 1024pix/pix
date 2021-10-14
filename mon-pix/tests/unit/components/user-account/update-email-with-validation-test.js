import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | user-account | update-email-with-validation', function () {
  setupTest();

  context('#showVerificationCode', function () {
    it('should show verification code page', async function () {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      expect(component.showEmailForm).to.be.false;
    });

    it('should save new email trimmed and in lowercase on sendVerificationCode', async function () {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = '   Toto@Example.net    ';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      expect(component.newEmail).to.equal('Toto@Example.net');
    });

    it('should save password on sendVerificationCode', async function () {
      // given
      const component = createGlimmerComponent('component:user-account/update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      expect(component.password).to.equal('pix123');
    });
  });
});
