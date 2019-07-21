const { expect } = require('../../../../test-helper');
const odsService = require('../../../../../lib/domain/services/ods-service');
const fs = require('fs');
const _ = require('lodash');

const { ODSTableDataEmptyError, ODSTableHeadersNotFoundError, ODSInvalidDataError } = require('../../../../../lib/domain/errors');

describe('ods-service', () => {

  describe('Integration | Services | get-attendance-sheet | ods-service', () => {

    const odsFilePath = `${__dirname}/testFile.ods`;
    const updatedOdsFilePath = `${__dirname}/testFileUpdated.ods`;

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
        },
        {
          header: 'Prénom',
          property: 'firstName',
        },
        {
          header: 'Date de naissance (format : jj/mm/aaaa)',
          property: 'birtdate',
        },
        {
          header: 'Lieu de naissance',
          property: 'birthCity',
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

      const odsFilePath = `${__dirname}/attendance_sheet_ods_service_parse_xls.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      context('when the buffer is invalid', () => {

        it('should throw a ODSInvalidDataError', async () => {
          // given
          const alteredBuffer = Buffer.from(_.map(odsBuffer, (value) => value + 1));

          // when
          try {
            await odsService.extractTableDataFromOdsFile({ odsBuffer: alteredBuffer, tableHeaderPropertyMap: [] });
          } catch (error) {
            // then
            expect(error).to.be.instanceOf(ODSInvalidDataError);
          }
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
              property: 'birtdate',
            },
            {
              header: 'Lieu de naissance',
              property: 'birthCity',
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
          try {
            await odsService.extractTableDataFromOdsFile(
              {
                odsBuffer,
                tableHeaderPropertyMap: NONEXISTANT_TABLEHEADER_PROPERTY_MAP
              });
          } catch (error) {
            // then
            expect(error).to.be.instanceOf(ODSTableHeadersNotFoundError);
          }
        });
      });

      context('when the file does not contain any data in the specified table', () => {

        it('should throw a ODSTableDataEmptyError', async () => {
          // given
          const emptyOdsFilePath = `${__dirname}/empty_attendance_sheet_ods_service_parse.ods`;
          const emptyOdsBuffer = fs.readFileSync(emptyOdsFilePath);

          // when
          try {
            await odsService.extractTableDataFromOdsFile(
              {
                odsBuffer: emptyOdsBuffer,
                tableHeaderPropertyMap: TABLEHEADER_PROPERTY_MAP
              });
          } catch (error) {
            // then
            expect(error).to.be.instanceOf(ODSTableDataEmptyError);
          }

        });

      });

      // given
      it('should return the data extracted from the table in the ods file', async () => {

        const expectedCertificationCandidatesData = [
          {
            lastName: 'NOM1',
            firstName: 'PRENOM1',
            birtdate: new Date('2001-01-01T00:00:00Z'),
            birthCity: 'VILLE1',
            externalId: 'ABC1',
            extraTimePercentage: 0,
          },
          {
            lastName: 'NOM2',
            firstName: 'PRENOM2',
            birtdate: new Date('2002-02-02T00:00:00Z'),
            birthCity: 'VILLE2',
            externalId: null,
            extraTimePercentage: 10,
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
