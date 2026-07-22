import sinon from 'sinon';

import * as service from '../../../../../src/identity-access-management/domain/services/password-generator.service.js';
import { expect } from '../../../../test-helper.js';

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
      const hardToReadCharacters = /[ilo]/;

      // when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(generatedPassword).to.not.match(hardToReadCharacters);
    });

    it('contains 6 lowercase letters and two digits', function () {
      // given & when
      generatedPassword = service.generateSimplePassword();

      // then
      expect(generatedPassword).to.match(/^[abcdefghjkmnpqrstuvwxyz]{6}[0-9]{2}$/);
    });
  });

  context('#generateComplexPassword', function () {
    it('has a length of 32 characters', function () {
      // given
      const generateCode = sinon.stub();

      // when
      service.generateComplexPassword({ generateCode });

      // then
      expect(generateCode).to.have.been.calledWithExactly(32, 'alphanumeric');
    });
  });
});
