import { promises } from 'fs';

const { writeFile: writeFile, unlink: unlink } = promises;

import { expect } from '../../../../test-helper';
import { getContentXml } from '../../../../../lib/infrastructure/utils/ods/read-ods-utils';

import {
  makeUpdatedOdsByContentXml,
  updateXmlRows,
  updateXmlSparseValues,
  addCellToEndOfLineWithStyleOfCellLabelled,
  incrementRowsColumnSpan,
  addValidatorRestrictedList,
  addTooltipOnCell,
} from '../../../../../lib/infrastructure/utils/ods/write-ods-utils';

import AddedCellOption from '../../../../../lib/infrastructure/utils/ods/added-cell-option';

describe('Integration | Infrastructure | Utils | Ods | write-ods-utils', function () {
  const GET_CONTENT_ODS_FILE_PATH = `${__dirname}/files/get-content-xml_test.ods`;

  describe('makeUpdatedOdsByContentXml', function () {
    let updatedOdsFilePath;

    it('should return the edited ods file as a buffer', async function () {
      // given
      updatedOdsFilePath = `${__dirname}/write-ods-utils-make-updated-ods-by-content-xml_test_tmp.ods`;
      const updatedStringifiedXml = '<xml>New xml</xml>';

      // when
      const updatedOdsFileBuffer = await makeUpdatedOdsByContentXml({
        stringifiedXml: updatedStringifiedXml,
        odsFilePath: GET_CONTENT_ODS_FILE_PATH,
      });
      await writeFile(updatedOdsFilePath, updatedOdsFileBuffer);
      const result = await getContentXml({ odsFilePath: updatedOdsFilePath });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

    afterEach(async function () {
      await unlink(updatedOdsFilePath);
    });
  });

  describe('#updateXmlSparseValues', function () {
    const templateValues = [
      {
        placeholder: 'PLACEHOLDER_1',
        propertyName: 'name',
      },
      {
        placeholder: 'PLACEHOLDER_2',
        propertyName: 'age',
      },
    ];

    const dataToInject = {
      name: 'Dummy name',
      age: 'Dummy age',
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

    it('should transform an xml by replacing templatized cells and data to inject', function () {
      // when
      const result = updateXmlSparseValues({
        stringifiedXml,
        templateValues,
        dataToInject,
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });
  });

  describe('#updateXmlRows', function () {
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

    it('should transform an xml given a templatized row, a starting position and data to inject', function () {
      // when
      const result = updateXmlRows({
        stringifiedXml,
        rowMarkerPlaceholder,
        rowTemplateValues,
        dataToInject,
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

    context('when a column has a validator', function () {
      it('should transform an xml given a templatized row, a starting position and data to inject', function () {
        // given
        const rowMarkerPlaceholder = 'PROP_STRING';

        const rowTemplateValues = [
          {
            placeholder: 'PROP_STRING',
            propertyName: 'propString',
          },
          {
            placeholder: 'PROP_DATE',
            propertyName: 'propDate',
            validator: 'validator2000',
          },
        ];

        const dataToInject = [
          {
            propString: 'Bibidi',
            propDate: '2001-01-01',
          },
        ];

        const stringifiedXml = `
          <xml xmlns:some="" xmlns:text="">
            <some:element>
              <some:element>
                <some:element office:value-type="string"><text:p>PROP_STRING</text:p></some:element>
                <some:element office:value-type="date"><text:p>PROP_DATE</text:p></some:element>
              </some:element>
            </some:element>
            <some:element><text:p>Some text</text:p></some:element>
          </xml>
          `;

        const updatedStringifiedXml = `
          <xml xmlns:some="" xmlns:text="">
            <some:element>
              <some:element>
                <some:element xmlns:office="" office:value-type="string">
                  <text:p>Bibidi</text:p>
                </some:element>
                <some:element
                  office:value-type="date"
                  table:content-validation-name="validator2000"
                  office:date-value="2001-01-01"
                />
              </some:element>
            </some:element>
            <some:element>
              <text:p>Some text</text:p>
            </some:element>
          </xml>
        `;
        // when
        const result = updateXmlRows({
          stringifiedXml,
          rowMarkerPlaceholder,
          rowTemplateValues,
          dataToInject,
        });

        // then

        expect(_removeSpaces(result)).to.deep.equal(_removeSpaces(updatedStringifiedXml));
      });
    });
  });

  describe('#addCellToEndOfLineWithStyleOfCellLabelled', function () {
    it('should add a cell at the end of a line ignoring repeated blank cells', function () {
      // given
      const stringifiedXml =
        '<xml xmlns:table="" xmlns:text="">' +
        '<table:table-row>' +
        '<table:table-cell>' +
        '<text:p>Title</text:p>' +
        '</table:table-cell>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:style-name="ce123">' +
        '<text:p>Cell 1</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell>' +
        '<text:p>Cell 2</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '</xml>';

      // when
      const result = addCellToEndOfLineWithStyleOfCellLabelled({
        stringifiedXml,
        lineNumber: 1,
        cellToCopyLabel: 'Cell 1',
        addedCellOption: new AddedCellOption({ labels: ['New Cell'] }),
      });

      // then
      const updatedStringifiedXml =
        '<xml xmlns:table="" xmlns:text="">' +
        '<table:table-row>' +
        '<table:table-cell>' +
        '<text:p>Title</text:p>' +
        '</table:table-cell>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:style-name="ce123">' +
        '<text:p>Cell 1</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell>' +
        '<text:p>Cell 2</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:style-name="ce123">' +
        '<text:p>New Cell</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '</xml>';
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

    context('when there is more than one label to display in added cell', function () {
      it('should add more than one text element', function () {
        // given
        const stringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';

        // when
        const result = addCellToEndOfLineWithStyleOfCellLabelled({
          stringifiedXml,
          lineNumber: 1,
          cellToCopyLabel: 'Cell 1',
          addedCellOption: new AddedCellOption({ labels: ['This', 'is', 'a', 'new', 'cell'] }),
        });

        // then
        const updatedStringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>This</text:p>' +
          '<text:p>is</text:p>' +
          '<text:p>a</text:p>' +
          '<text:p>new</text:p>' +
          '<text:p>cell</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';
        expect(result).to.deep.equal(updatedStringifiedXml);
      });
    });

    context('when there is a rowspan option provided', function () {
      it('should add a number-rows-spanned attribute to the added cell', function () {
        // given
        const stringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';

        // when
        const result = addCellToEndOfLineWithStyleOfCellLabelled({
          stringifiedXml,
          lineNumber: 1,
          cellToCopyLabel: 'Cell 1',
          addedCellOption: new AddedCellOption({ labels: ['New Cell'], rowspan: 3 }),
        });

        // then
        const updatedStringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:style-name="ce123" table:number-rows-spanned="3">' +
          '<text:p>New Cell</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';
        expect(result).to.deep.equal(updatedStringifiedXml);
      });
    });

    context('when there is a colspan option provided', function () {
      it('should add a number-columns-spanned attribute to the added cell', function () {
        // given
        const stringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';

        // when
        const result = addCellToEndOfLineWithStyleOfCellLabelled({
          stringifiedXml,
          lineNumber: 1,
          cellToCopyLabel: 'Cell 1',
          addedCellOption: new AddedCellOption({ labels: ['New Cell'], colspan: 3 }),
        });

        // then
        const updatedStringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:style-name="ce123" table:number-columns-spanned="3">' +
          '<text:p>New Cell</text:p>' +
          '</table:table-cell>' +
          '<table:covered-table-cell table:number-columns-repeated="2"/>' +
          '<table:table-cell table:number-columns-repeated="10"/>' +
          '</table:table-row>' +
          '</xml>';
        expect(result).to.deep.equal(updatedStringifiedXml);
      });
    });

    context('when there is a position offset option provided', function () {
      it('should insert the added cell at a customized position from the end of the line', function () {
        // given
        const stringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="3"/>' +
          '<table:table-cell table:number-columns-repeated="4"/>' +
          '<table:table-cell table:number-columns-repeated="3"/>' +
          '</table:table-row>' +
          '</xml>';

        // when
        const result = addCellToEndOfLineWithStyleOfCellLabelled({
          stringifiedXml,
          lineNumber: 1,
          cellToCopyLabel: 'Cell 1',
          addedCellOption: new AddedCellOption({ labels: ['New Cell'], positionOffset: 3 }),
        });

        // then
        const updatedStringifiedXml =
          '<xml xmlns:table="" xmlns:text="">' +
          '<table:table-row>' +
          '<table:table-cell>' +
          '<text:p>Title</text:p>' +
          '</table:table-cell>' +
          '</table:table-row>' +
          '<table:table-row>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>Cell 1</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell>' +
          '<text:p>Cell 2</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:style-name="ce123">' +
          '<text:p>New Cell</text:p>' +
          '</table:table-cell>' +
          '<table:table-cell table:number-columns-repeated="3"/>' +
          '<table:table-cell table:number-columns-repeated="4"/>' +
          '<table:table-cell table:number-columns-repeated="3"/>' +
          '</table:table-row>' +
          '</xml>';
        expect(result).to.deep.equal(updatedStringifiedXml);
      });
    });
  });

  describe('#incrementRowsColumnSpan', function () {
    it('should increment column span of last cell of rows from a line number to another', function () {
      // given
      const stringifiedXml =
        '<xml xmlns:table="" xmlns:text="">' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="5">' +
        '<text:p>Title</text:p>' +
        '</table:table-cell>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="3">' +
        '<text:p>Cell 1</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-spanned="2">' +
        '<text:p>Cell 2</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="5">' +
        '<text:p>Cell 3</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="5">' +
        '<text:p>Cell 4</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '</xml>';

      // when
      const result = incrementRowsColumnSpan({
        stringifiedXml,
        startLine: 1,
        endLine: 2,
        increment: 2,
      });

      // then
      const updatedStringifiedXml =
        '<xml xmlns:table="" xmlns:text="">' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="5">' +
        '<text:p>Title</text:p>' +
        '</table:table-cell>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="3">' +
        '<text:p>Cell 1</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-spanned="4">' +
        '<text:p>Cell 2</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="7">' +
        '<text:p>Cell 3</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '<table:table-row>' +
        '<table:table-cell table:number-columns-spanned="5">' +
        '<text:p>Cell 4</text:p>' +
        '</table:table-cell>' +
        '<table:table-cell table:number-columns-repeated="10"/>' +
        '</table:table-row>' +
        '</xml>';
      expect(result).to.deep.equal(updatedStringifiedXml);
    });
  });

  describe('#addValidatorRestrictedList', function () {
    context('when allow empty cells is true', function () {
      it('should add a tooltip, dropdown menu and entry validation', function () {
        // given
        const stringifiedXml = `
        <xml xmlns:table="">
          <table:content-validations></table:content-validations>
        </xml>`;

        // when
        const result = addValidatorRestrictedList({
          stringifiedXml,
          tooltipTitle: 'Code de prépaiement',
          tooltipContentLines: [
            "(Requis notamment dans le cas d'un achat de crédits combinés)",
            'Doit être composé du SIRET de l’organisation et du numéro de facture. Ex : 12345678912345/FACT12345',
            'Si vous ne possédez pas de facture, un code de prépaiement doit être établi avec Pix.',
          ],
          validatorName: 'validator2000',
          restrictedList: ['a', 'b'],
          allowEmptyCell: true,
        });

        // then
        const updatedStringifiedXml = `
         <xml xmlns:table="">
              <table:content-validations>
                  <table:content-validation table:name="validator2000"
                                            table:condition="of:cell-content-is-in-list(&quot;a&quot;;&quot;b&quot;)"
                                            table:allow-empty-cell="true">
                      <table:help-message table:title="Code de prépaiement" table:display="true">
                          <text:p>(Requis notamment dans le cas d'un achat de crédits combinés)</text:p>
                          <text:p>Doit être composé du SIRET de l’organisation et du numéro de facture. Ex :
                              12345678912345/FACT12345
                          </text:p>
                          <text:p>Si vous ne possédez pas de facture, un code de prépaiement doit être établi avec Pix.</text:p>
                      </table:help-message>
                      <table:error-message table:display="true" table:message-type="stop"/>
                  </table:content-validation>
              </table:content-validations>
          </xml>
          `;
        expect(_removeSpaces(result)).to.deep.equal(_removeSpaces(updatedStringifiedXml));
      });
    });

    context('when allow empty cells is false', function () {
      it('should add a tooltip, dropdown menu and an optional entry validation', function () {
        // given
        const stringifiedXml = `
        <xml xmlns:table="">
          <table:content-validations></table:content-validations>
        </xml>`;

        // when
        const result = addValidatorRestrictedList({
          stringifiedXml,
          tooltipTitle: 'Code de prépaiement',
          tooltipContentLines: [
            "(Requis notamment dans le cas d'un achat de crédits combinés)",
            'Doit être composé du SIRET de l’organisation et du numéro de facture. Ex : 12345678912345/FACT12345',
            'Si vous ne possédez pas de facture, un code de prépaiement doit être établi avec Pix.',
          ],
          validatorName: 'validator2000',
          restrictedList: ['a', 'b'],
          allowEmptyCell: true,
        });

        // then
        const expectedXml = `
         <xml xmlns:table="">
              <table:content-validations>
                  <table:content-validation table:name="validator2000"
                                            table:condition="of:cell-content-is-in-list(&quot;a&quot;;&quot;b&quot;)"
                                            table:allow-empty-cell="true">
                      <table:help-message table:title="Code de prépaiement" table:display="true">
                          <text:p>(Requis notamment dans le cas d'un achat de crédits combinés)</text:p>
                          <text:p>Doit être composé du SIRET de l’organisation et du numéro de facture. Ex :
                              12345678912345/FACT12345
                          </text:p>
                          <text:p>Si vous ne possédez pas de facture, un code de prépaiement doit être établi avec Pix.</text:p>
                      </table:help-message>
                      <table:error-message table:display="true" table:message-type="stop"/>
                  </table:content-validation>
              </table:content-validations>
          </xml>
          `;
        expect(_removeSpaces(result)).to.deep.equal(_removeSpaces(expectedXml));
      });
    });
  });

  describe('#addTooltipOnCell', function () {
    it('should add a tooltip on a cell range', function () {
      // given
      const stringifiedXml = `
        <xml xmlns:table="">
          <table:content-validations></table:content-validations>
        </xml>`;

      const targetCellRange = '.A1';

      // when
      const result = addTooltipOnCell({
        stringifiedXml,
        targetCellAddress: targetCellRange,
        tooltipName: 'important-info',
        tooltipTitle: 'Please read this important information',
        tooltipContentLines: ['Cant touch this', 'Tuuuu tu tu tu', 'Tu tu', 'Tu tu', 'Cant touch this'],
      });

      // then
      const updatedStringifiedXml = `
        <xml xmlns:table="">
          <table:content-validations>
            <table:content-validation table:name="important-info">
                <table:help-message table:title="Please read this important information" table:display="true">
                    <text:p>Cant touch this</text:p>
                    <text:p>Tuuuu tu tu tu</text:p>
                    <text:p>Tu tu</text:p>
                    <text:p>Tu tu</text:p>
                    <text:p>Cant touch this</text:p>
                </table:help-message>
                <table:error-message table:display="true" table:message-type="stop"/>
            </table:content-validation>
          </table:content-validations>
        </xml>
          `;

      expect(_removeSpaces(result)).to.deep.equal(_removeSpaces(updatedStringifiedXml));
    });
  });
});

function _removeSpaces(value) {
  return value.replace(/\s*/g, '');
}
