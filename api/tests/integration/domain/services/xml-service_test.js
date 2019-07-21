const { expect } = require('../../../test-helper');
const xmlService = require('../../../../lib/domain/services/xml-service');

describe('Integration | Services | get-attendance-sheet | xml-service', () => {

  describe('xmlService Session data into Xml', () => {

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

    it('should return the provided xml string filled with correct session data', () => {
      // when
      const result = xmlService.getUpdatedXmlWithSessionData({
        stringifiedXml,
        dataToInject,
        templateValues
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

  });

  describe('xmlService Candidates data into Xml', () => {
    // given
    const templateValues = [
      {
        placeholder: 'PROP_STRING',
        propertyName: 'propString',
      },
      {
        placeholder: 'PROP_DATE',
        propertyName: 'propDate',
      },
      {
        placeholder: 'INCREMENT',
        propertyName: 'propNumber',
      }
    ];

    const candidatesDataToInject = [
      {
        propString: 'I Am Candidate One',
        propDate: '2001-01-01',
        propNumber: 1,
      },
      {
        propString: 'I Am Candidate Two',
        propDate: '2010-10-10',
        propNumber: 2,
      },
      {
        propString: 'I Am Candidate Three',
        propDate: '2012-05-12',
        propNumber: 3,
      },
    ];

    const stringifiedXml =
      '<xml xmlns:some="" xmlns:text="">' +
      '<some:element>' +
        '<some:element>' +
          '<some:element office:value-type="float">' +
            '<text:p>INCREMENT</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="string">' +
            '<text:p>PROP_STRING</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="date">' +
            '<text:p>PROP_DATE</text:p>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
      '</some:element>' +
      '<some:element><text:p>Some text</text:p></some:element>' +
      '</xml>';

    const updatedStringifiedXml =
      '<xml xmlns:some="" xmlns:text="">' +
      '<some:element>' +
        '<some:element>' +
          '<some:element xmlns:office="" office:value-type="float" office:value="1">' +
            '<text:p>1</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="string">' +
            '<text:p>I Am Candidate One</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="date" office:date-value="2001-01-01">' +
            '<text:p>01/01/2001</text:p>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element>' +
          '<some:element office:value-type="float" office:value="2">' +
            '<text:p>2</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="string">' +
            '<text:p>I Am Candidate Two</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="date" office:date-value="2010-10-10">' +
            '<text:p>10/10/2010</text:p>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element>' +
          '<some:element office:value-type="float" office:value="3">' +
            '<text:p>3</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="string">' +
            '<text:p>I Am Candidate Three</text:p>' +
          '</some:element>' +
          '<some:element office:value-type="date" office:date-value="2012-05-12">' +
            '<text:p>12/05/2012</text:p>' +
          '</some:element>' +
        '</some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
        '<some:element><text:p>Some text</text:p></some:element>' +
      '</some:element>' +
      '<some:element><text:p>Some text</text:p></some:element>' +
      '</xml>';

    it('should return the provided xml string filled with correct candidates data', () => {
      // when
      const result = xmlService.getUpdatedXmlWithCertificationCandidatesData({
        stringifiedXml,
        candidatesDataToInject,
        templateValues
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

  });

});
