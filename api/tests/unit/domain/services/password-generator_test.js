const { expect } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/password-generator');

describe('Unit | Service | password-generator', () => {

  let generatedPassword;

  beforeEach(() => {
    generatedPassword = service.generate();
  });

  it('should have a length of 8 characters', function() {
    expect(generatedPassword.length).to.equal(8);
  });

  it('should not contains hard to read characters', function() {
    const hardToReadCharacters = '[ilo]';
    expect(RegExp(hardToReadCharacters).test(generatedPassword)).to.be.false;
  });

  it('should contains 6 lowercase letters and two digits', function() {
    expect(RegExp('^[a-z]{6}[0-9]{2}$').test(generatedPassword)).to.be.true;
  });

});
