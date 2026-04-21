import { containsOnlyValidChars } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/xml-organization-learner-set.js';

describe('Unit | Serializer | xml | xml-organization-learner-set', function () {
  describe('#containsOnlyValidChars', function () {
    context('invalid cases', function () {
      ['Math�o', 'CÃ©cile', 'Rose GuyrlÃ¨ne', 'MaÃ«llys', 'LeÃ¯la', 'Noëmie FranÃ§oise Marie'].forEach((str) => {
        it(`should return false if input string contains invalid characters (${str})`, function () {
          expect(containsOnlyValidChars(str)).false;
        });
      });
    });
    context('correct cases', function () {
      [
        "N'golo",
        'Jean Phillipe',
        'Marie-Louise',
        'Paul',
        'Héloïse',
        'Françoise',
        'Læticia',
        'COVERT',
        'HANDMADE',
      ].forEach((str) => {
        it(`should return true if input string is ${str} characters`, function () {
          expect(containsOnlyValidChars(str)).true;
        });
      });
    });
  });
});
