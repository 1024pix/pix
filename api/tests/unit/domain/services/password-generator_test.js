import { expect, sinon } from '../../../test-helper';
import service from '../../../../lib/domain/services/password-generator';
import randomString from 'randomstring';

describe('Unit | Service | password-generator', function () {
  let generatedPassword;

  context('#generateSimplePassword', function () {
    it('should have a length of 8 characters', function () {
      // given & when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(generatedPassword.length).to.equal(8);
    });

    it('should not contains hard to read characters', function () {
      // given
      const hardToReadCharacters = '[ilo]';

      // when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(RegExp(hardToReadCharacters).test(generatedPassword)).to.be.false;
    });

    it('should contains 6 lowercase letters and two digits', function () {
      // given & when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(RegExp('^[a-z]{6}[0-9]{2}$').test(generatedPassword)).to.be.true;
    });
  });

  context('#generateComplexPassword', function () {
    it('should have a length of 32 characters', function () {
      // given
      sinon.stub(randomString, 'generate');

      // when
      generatedPassword = service.generateComplexPassword();

      // then
      expect(randomString.generate).to.have.been.calledWith({
        length: 32,
        charset: 'alphanumeric',
      });
    });
  });
});
