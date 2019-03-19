const { expect } = require('../../../test-helper');
const xmlService = require('../../../../lib/domain/services/xml-service');

describe('Unit | Services | get-attendance-sheet | xml-service', () => {

  const templateValues = [
    {
      placeholder: 'PLACEHOLDER_1',
      propertyName: 'name'
    },
    {
      placeholder: 'PLACEHOLDER_2',
      propertyName: 'age'
    }
  ];

  const dataToInject = {
    name: 'Dummy name',
    age: 'Dummy age'
  };

  const stringifiedXml =
    '<xml xmlns:some="" xmlns:text="">' +
      '<some:element>' +
        '<text:p>PLACEHOLDER_1</text:p>' +
        '<text:p>Some value</text:p>' +
        '<some:block>' +
          '<text:p>PLACEHOLDER_2</text:p>' +
        '</some:block>' +
      '</some:element>' +
      '<text:p>Some other value</text:p>' +
    '</xml>';

  const updatedStringifiedXml =
    '<xml xmlns:some="" xmlns:text="">' +
      '<some:element>' +
        '<text:p>Dummy name</text:p>' +
        '<text:p>Some value</text:p>' +
        '<some:block>' +
          '<text:p>Dummy age</text:p>' +
        '</some:block>' +
      '</some:element>' +
      '<text:p>Some other value</text:p>' +
    '</xml>';

  describe('xmlServiceIntoXml', () => {

    it('should return the content.xml file filled with correct session data', () => {
      // when
      const result = xmlService.getUpdatedXml({
        stringifiedXml,
        dataToInject,
        templateValues
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

  });

});
