const { expect } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/csv-service');

describe('Unit | Service | csv-service', function() {

  describe('#sanitize', () => {

    context('when the string is clean', () => {

      it('should return the string when string is empty', () => {
        // given
        const emptyString = '';

        // when
        const sanitizedString = service.sanitize(emptyString);

        // then
        expect(sanitizedString).to.equal(emptyString);
      });

      it('should return the string when it doesn\'t start with an illegal character', () => {
        // given
        const expectedString = 'clean string';

        // when
        const sanitizedString = service.sanitize(expectedString);

        // then
        expect(sanitizedString).to.equal(expectedString);
      });

    });

    context('when the string starts with an illegal character', () => {

      it('should sanitize when starts with @', () => {
        // given
        const uncleanString = '@unclean string';
        const expectedString = '\'@unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        expect(sanitizedString).to.equal(expectedString);
      });

      it('should sanitize when starts with -', () => {
        // given
        const uncleanString = '-unclean string';
        const expectedString = '\'-unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        expect(sanitizedString).to.equal(expectedString);
      });

      it('should sanitize when starts with =', () => {
        // given
        const uncleanString = '=unclean string';
        const expectedString = '\'=unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        expect(sanitizedString).to.equal(expectedString);
      });

      it('should sanitize when starts with +', () => {
        // given
        const uncleanString = '+unclean string';
        const expectedString = '\'+unclean string';

        // when
        const sanitizedString = service.sanitize(uncleanString);

        // then
        expect(sanitizedString).to.equal(expectedString);
      });
    });

    context('when the value is not a string', () => {

      it('should return the same value', () => {
        // given
        const originalValue = new Date();

        // when
        const result = service.sanitize(originalValue);

        // then
        expect(result).to.equal(originalValue);
      });
    });
  });

});
