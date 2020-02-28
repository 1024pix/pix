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
  describe('#sanitizeProperties', () => {

    const objectToSanitize = {
      cleanProperty: 'cleanProperty',
      uncleanProperty1: '+uncleanProperty',
      uncleanProperty2: '-uncleanProperty',
      uncleanProperty3: '=uncleanProperty',
      uncleanProperty4: '@uncleanProperty'
    };

    context('when there is no properties', () => {

      it('should return the object as-is', () => {
        // when
        const returnedObject = service.sanitizeProperties({ objectToSanitize, propertiesToSanitize: [] });

        // then
        expect(returnedObject).to.deep.equal(objectToSanitize);
      });
    });

    context('when there is no matching properties', () => {

      it('should return the object as-is', () => {
        // given
        const propertiesToSanitize = [ 'noExistingProperty1', 'noExistingProperty2', 'noExistingProperty3'];

        // when
        const returnedObject = service.sanitizeProperties({ objectToSanitize, propertiesToSanitize });

        // then
        expect(returnedObject).to.deep.equal(objectToSanitize);
      });

    });

    context('when there are properties', () => {

      it('should sanitize the properties ', () => {
        // given
        const propertiesToSanitize = [
          'uncleanProperty1',
          'uncleanProperty2',
          'uncleanProperty3',
          'uncleanProperty4'
        ];

        const expectedSanitizedObject = {
          cleanProperty: 'cleanProperty',
          uncleanProperty1: '\'+uncleanProperty',
          uncleanProperty2: '\'-uncleanProperty',
          uncleanProperty3: '\'=uncleanProperty',
          uncleanProperty4: '\'@uncleanProperty'
        };

        // when
        const sanitizedObject = service.sanitizeProperties({ objectToSanitize, propertiesToSanitize });

        // then
        expect(sanitizedObject).to.deep.equal(expectedSanitizedObject);
      });
    });
  });

});
