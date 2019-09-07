const { expect, catchErr } = require('../../../../test-helper');
const odsService = require('../../../../../lib/domain/services/ods-service');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

const { ODSTableDataEmptyError, ODSTableHeadersNotFoundError, ODSBufferReadFailedError } = require('../../../../../lib/domain/errors');

describe('ods-service', () => {

  describe('Integration | Services | get-attendance-sheet | ods-service', () => {

    const odsFilePath = `${__dirname}/ods-service-test-get-content-xml.ods`;
    const updatedOdsFilePath = `${__dirname}/ods-service-test-make-updated-ods-by-content-xml.ods`;

    describe('getContentXml', () => {

      it('should return the content.xml from the ods file as a string', async () => {
        // given
        const expectedStringifiedXml = '<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:rpt="http://openoffice.org/2005/report" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" office:version="1.2"><office:scripts/><office:font-face-decls><style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss" style:font-pitch="variable"/><style:font-face style:name="Arial Unicode MS" svg:font-family="&apos;Arial Unicode MS&apos;" style:font-family-generic="system" style:font-pitch="variable"/><style:font-face style:name="Tahoma" svg:font-family="Tahoma" style:font-family-generic="system" style:font-pitch="variable"/></office:font-face-decls><office:automatic-styles><style:style style:name="co1" style:family="table-column"><style:table-column-properties fo:break-before="auto" style:column-width="2.267cm"/></style:style><style:style style:name="ro1" style:family="table-row"><style:table-row-properties style:row-height="0.427cm" fo:break-before="auto" style:use-optimal-row-height="true"/></style:style><style:style style:name="ta1" style:family="table" style:master-page-name="Default"><style:table-properties table:display="true" style:writing-mode="lr-tb"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Feuille1" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell office:value-type="string"><text:p>TEST </text:p></table:table-cell></table:table-row></table:table><table:table table:name="Feuille2" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table><table:table table:name="Feuille3" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>';

        // when
        const result = await odsService.getContentXml({ odsFilePath });

        // then
        expect(result).to.deep.equal(expectedStringifiedXml);
      });

    });

    describe('makeUpdatedOdsByContentXml', () => {

      it('should return the edited ods file as a buffer', async () => {
        // given
        const updatedStringifiedXml = '<xml>New xml</xml>';

        // when
        const updatedOdsFileBuffer = await odsService.makeUpdatedOdsByContentXml({ stringifiedXml: updatedStringifiedXml, odsFilePath });
        fs.writeFileSync(updatedOdsFilePath, updatedOdsFileBuffer);
        const result = await odsService.getContentXml({ odsFilePath: updatedOdsFilePath });

        // then
        expect(result).to.deep.equal(updatedStringifiedXml);
      });

      afterEach(() => {
        fs.unlinkSync(updatedOdsFilePath);
      });

    });

  });

  describe('Integration | Services | parse-certification-candidates-in-attendance-sheet | ods-service', () => {

    describe('extractTableDataFromOdsFile', () => {

      const TABLEHEADER_PROPERTY_MAP = [
        {
          header: 'NOM',
          property: 'lastName',
          transformFn: _toNotEmptyStringOrNull,
        },
        {
          header: 'Prénom',
          property: 'firstName',
          transformFn: _toNotEmptyStringOrNull,
        },
        {
          header: 'Date de naissance (format : jj/mm/aaaa)',
          property: 'birthdate',
          transformFn: (cellVal) => {
            if (cellVal && moment(cellVal).isValid()) {
              return moment(cellVal).format('YYYY-MM-DD');
            }
            return null;
          },
        },
        {
          header: 'Lieu de naissance',
          property: 'birthplace',
          transformFn: _toNotEmptyStringOrNull,
        },
        {
          header: 'Identifiant local',
          property: 'externalId',
          transformFn: _toNotEmptyStringOrNull,
        },
        {
          header: 'Temps majoré ?',
          property: 'extraTimePercentage',
          transformFn: (cellVal) => {
            const value = _.toNumber(cellVal);
            return _.isNaN(value) ? null : value;
          },
        },
      ];

      const odsFilePath = `${__dirname}/ods-service-test-extract-table-data-from-ods-file.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      context('when the buffer is invalid', () => {

        it('should throw a ODSInvalidDataError', async () => {
          // given
          const alteredBuffer = Buffer.from(_.map(odsBuffer, (value) => value + 1));

          // when
          const result = await catchErr(odsService.extractTableDataFromOdsFile)({
            odsBuffer: alteredBuffer,
            tableHeaderPropertyMap: [],
          });

          // then
          expect(result).to.be.instanceof(ODSBufferReadFailedError);
        });

      });

      context('when the headers are not present in the ods file', () => {

        it('should throw a ODSTableHeadersNotFoundError', async () => {
          // given
          const NONEXISTANT_TABLEHEADER_PROPERTY_MAP = [
            {
              header: 'NOMMMM',
              property: 'lastName',
            },
            {
              header: 'Prénommmmm',
              property: 'firstName',
            },
            {
              header: 'Date de naissance (format : jj/mm/aaaa)',
              property: 'birthdate',
            },
            {
              header: 'Lieu de naissance',
              property: 'birthdate',
            },
            {
              header: 'Identifiant local',
              property: 'externalId',
            },
            {
              header: 'Temps majoré ?',
              property: 'extraTimePercentage',
            },
          ];

          // when
          const result = await catchErr(odsService.extractTableDataFromOdsFile)({
            odsBuffer,
            tableHeaderPropertyMap: NONEXISTANT_TABLEHEADER_PROPERTY_MAP,
          });

          // then
          expect(result).to.be.instanceof(ODSTableHeadersNotFoundError);
        });
      });

      context('when the file does not contain any data in the specified table', () => {

        it('should throw a ODSTableDataEmptyError', async () => {
          // given
          const emptyOdsFilePath = `${__dirname}/ods-service-test-extract-table-data-from-ods-file-empty.ods`;
          const emptyOdsBuffer = fs.readFileSync(emptyOdsFilePath);

          // when
          const result = await catchErr(odsService.extractTableDataFromOdsFile)({
            odsBuffer: emptyOdsBuffer,
            tableHeaderPropertyMap: TABLEHEADER_PROPERTY_MAP,
          });

          // then
          expect(result).to.be.instanceof(ODSTableDataEmptyError);
        });

      });

      // given
      it('should return the data extracted from the table in the ods file', async () => {

        const expectedCertificationCandidatesData = [
          {
            lastName: 'NOM1',
            firstName: 'PRENOM1',
            birthdate: '2001-01-01',
            birthplace: 'VILLE1',
            externalId: 'ABC1',
            extraTimePercentage: null,
          },
          {
            lastName: 'NOM2',
            firstName: 'PRENOM2',
            birthdate: '2002-02-02',
            birthplace: 'VILLE2',
            externalId: null,
            extraTimePercentage: 0.1,
          },
        ];
        // when
        const certificationCandidatesData = await odsService.extractTableDataFromOdsFile(
          {
            odsBuffer,
            tableHeaderPropertyMap: TABLEHEADER_PROPERTY_MAP,
          });

        // then
        expect(certificationCandidatesData).to.deep.equal(expectedCertificationCandidatesData);
      });

    });

  });

});

function _toNotEmptyStringOrNull(val) {
  const value = _.toString(val);
  return _.isEmpty(value) ? null : value;
}
