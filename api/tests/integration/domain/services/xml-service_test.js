const { expect } = require('../../../test-helper');
const xmlService = require('../../../../lib/domain/services/xml-service');

describe('Integration | Services | get-attendance-sheet | xml-service', () => {

  describe('#updateXmlSparseValues', () => {

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

    it('should transform an xml by replacing templatized cells and data to inject', () => {
      // when
      const result = xmlService.updateXmlSparseValues({
        stringifiedXml,
        templateValues,
        dataToInject,
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

  });

  describe('updateXmlRows', () => {

    const rowMarkerPlaceholder = 'PROP_STRING';

    const rowTemplateValues = [
      {
        placeholder: 'PROP_STRING',
        propertyName: 'propString',
      },
      {
        placeholder: 'PROP_DATE',
        propertyName: 'propDate',
      },
      {
        placeholder: 'PROP_PERCENTAGE',
        propertyName: 'propPercentage',
      },
    ];

    const dataToInject = [
      {
        propString: 'Bibidi',
        propDate: '2001-01-01',
        propPercentage: 0.5,
      },
      {
        propString: 'Babidi',
        propDate: '2010-10-10',
        propPercentage: 0.15,
      },
      {
        propString: 'Bou',
        propDate: '2012-05-12',
        propPercentage: '',
      },
    ];

    const stringifiedXml =
      '<xml xmlns:some="" xmlns:text="">' +
        '<some:element>' +
          '<some:element>' +
            '<some:element office:value-type="percentage">' +
              '<text:p>PROP_PERCENTAGE</text:p>' +
            '</some:element>' +
            '<some:element office:value-type="string">' +
              '<text:p>PROP_STRING</text:p>' +
            '</some:element>' +
            '<some:element office:value-type="date">' +
              '<text:p>PROP_DATE</text:p>' +
            '</some:element>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
      '</xml>';

    const updatedStringifiedXml =
      '<xml xmlns:some="" xmlns:text="">' +
        '<some:element>' +
          '<some:element>' +
            '<some:element xmlns:office="" office:value-type="percentage" office:value="0.5"/>' +
            '<some:element office:value-type="string">' +
              '<text:p>Bibidi</text:p>' +
            '</some:element>' +
            '<some:element office:value-type="date" office:date-value="2001-01-01"/>' +
          '</some:element>' +
          '<some:element>' +
            '<some:element office:value-type="percentage" office:value="0.15"/>' +
            '<some:element office:value-type="string">' +
              '<text:p>Babidi</text:p>' +
            '</some:element>' +
            '<some:element office:value-type="date" office:date-value="2010-10-10"/>' +
          '</some:element>' +
          '<some:element>' +
            '<some:element/>' +
            '<some:element office:value-type="string">' +
              '<text:p>Bou</text:p>' +
            '</some:element>' +
            '<some:element office:value-type="date" office:date-value="2012-05-12"/>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element>' +
          '<text:p>Some text</text:p>' +
        '</some:element>' +
      '</xml>';

    it('should transform an xml given a templatized row, a starting position and data to inject', () => {
      // when
      const result = xmlService.updateXmlRows({
        stringifiedXml,
        rowMarkerPlaceholder,
        rowTemplateValues,
        dataToInject,
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

  });

});
