import randomString from 'randomstring';
import sinon from 'sinon';

import * as service from '../../../../../src/identity-access-management/domain/services/password-generator.service.js';

describe('Unit | Identity Access Management | Domain | Service | password-generator', function () {
  let generatedPassword;

  context('#generateSimplePassword', function () {
    it('has a length of 8 characters', function () {
      // given & when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(generatedPassword).to.have.lengthOf(8);
    });

    it('does not contain hard to read characters', function () {
      // given
      const hardToReadCharacters = '[ilo]';

      // when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(RegExp(hardToReadCharacters).test(generatedPassword)).to.be.false;
    });

    it('contains 6 lowercase letters and two digits', function () {
      // given & when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(RegExp('^[a-z]{6}[0-9]{2}$').test(generatedPassword)).to.be.true;
    });
  });

  context('#generateComplexPassword', function () {
    it('has a length of 32 characters', function () {
      // given
      sinon.stub(randomString, 'generate');

      // when
      generatedPassword = service.generateComplexPassword();

      // then
      expect(randomString.generate).to.have.been.calledWithExactly({
        length: 32,
        charset: 'alphanumeric',
      });
    });
  });
});
