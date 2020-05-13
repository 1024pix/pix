const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

const { expect, catchErr } = require('../../../../test-helper');
const { UnprocessableEntityError } = require('../../../../../lib/application/http-errors');

const {
  TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION,
} = require('../../../../../lib/infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');
const { CURRENT_ATTENDANCE_SHEET_VERSION } = require('../../../../../lib/infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');

const {
  getContentXml, extractTableDataFromOdsFile, getOdsVersionByHeaders, getSheetDataRowsFromOdsBuffer
} = require('../../../../../lib/infrastructure/utils/ods/read-ods-utils');

describe('Integration | Infrastructure | Utils | Ods | read-ods-utils', () => {

  const GET_CONTENT_ODS_FILE_PATH = `${__dirname}/files/get-content-xml_test.ods`;
  const DEFAULT_ODS_FILE_PATH = `${__dirname}/files/default_test.ods`;
  const EMPTY_TABLE_ODS_FILE_PATH = `${__dirname}/files/empty-table_test.ods`;
  const UNKNOWN_VERSION_ODS_FILE_PATH = `${__dirname}/files/unknown-version_test.ods`;
  const NEW_LINE_ODS_FILE_PATH = `${__dirname}/files/newline_test.ods`;
  const SIMPLE_ATTENDANCE_ODS_FILE_PATH = `${__dirname}/files/simple-attendance_test.ods`;

  const TRANSFORMATION_STRUCTS_BY_VERSION = _.orderBy(
    TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION, ['version'], ['desc']
  );

  let odsBuffer;

  describe('#getContentXml', () => {

    it('should return the content.xml from the ods file as a string', async () => {
      // given
      const expectedStringifiedXml = '<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:rpt="http://openoffice.org/2005/report" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" office:version="1.2"><office:scripts/><office:font-face-decls><style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss" style:font-pitch="variable"/><style:font-face style:name="Arial Unicode MS" svg:font-family="&apos;Arial Unicode MS&apos;" style:font-family-generic="system" style:font-pitch="variable"/><style:font-face style:name="Tahoma" svg:font-family="Tahoma" style:font-family-generic="system" style:font-pitch="variable"/></office:font-face-decls><office:automatic-styles><style:style style:name="co1" style:family="table-column"><style:table-column-properties fo:break-before="auto" style:column-width="2.267cm"/></style:style><style:style style:name="ro1" style:family="table-row"><style:table-row-properties style:row-height="0.427cm" fo:break-before="auto" style:use-optimal-row-height="true"/></style:style><style:style style:name="ta1" style:family="table" style:master-page-name="Default"><style:table-properties table:display="true" style:writing-mode="lr-tb"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Feuille1" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell office:value-type="string"><text:p>TEST </text:p></table:table-cell></table:table-row></table:table><table:table table:name="Feuille2" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table><table:table table:name="Feuille3" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>';

      // when
      const result = await getContentXml({ odsFilePath: GET_CONTENT_ODS_FILE_PATH });

      // then
      expect(result).to.deep.equal(expectedStringifiedXml);
    });
  });

  describe('#extractTableDataFromOdsFile', () => {

    beforeEach(() => {
      odsBuffer = fs.readFileSync(DEFAULT_ODS_FILE_PATH);
    });

    const TRANSFORM_STRUCT = [
      {
        header: 'HEADER1',
        property: 'property1',
        transformFn: (cellVal) => {
          return cellVal + 'toto';
        },
      },
      {
        header: 'HEADER2',
        property: 'property2',
        transformFn: (cellVal) => {
          return cellVal + 'JAIMEPIX';
        },
      },
    ];

    context('when the buffer is invalid', () => {

      it('should throw a UnprocessableEntityError', async () => {
        // given
        const alteredBuffer = Buffer.from(_.map(odsBuffer, (value) => value + 1));

        // when
        const result = await catchErr(extractTableDataFromOdsFile)({
          odsBuffer: alteredBuffer,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });

    });

    context('when the conf header contains new line but the file headers does not',  () => {

      const TRANSFORM_STRUCT_NONE = [
        {
          header: 'HEADER1',
          property: 'property1',
          transformFn: (a) => a
        },
        {
          header: 'HEADER\n2',
          property: 'property2',
          transformFn: (a) => a
        },
      ];

      it('should return the data extracted from the table in the ods file', async () => {
        // given
        const expectedCertificationCandidatesData = [
          {
            property1: 'Valeur1_ligne1',
            property2: 'Valeur2_ligne1',
          },
          {
            property1: 'Valeur1_ligne2',
            property2: 'Valeur2_ligne2',
          },
        ];

        // when
        const certificationCandidatesData = await extractTableDataFromOdsFile(
          {
            odsBuffer,
            tableHeaderTargetPropertyMap: TRANSFORM_STRUCT_NONE,
          });

        // then
        expect(certificationCandidatesData).to.deep.equal(expectedCertificationCandidatesData);
      });
    });

    context('when the headers are not present in the ods file', () => {

      it('should throw a UnprocessableEntityError', async () => {
        // given
        const TRANSFORM_STRUCT_NON_EXISTENT_HEADERS = [
          {
            header: 'NONEXISTENT_HEADER1',
            property: 'lastName',
          },
          {
            header: 'NONEXISTENT_HEADER2',
            property: 'firstName',
          },
        ];

        // when
        const result = await catchErr(extractTableDataFromOdsFile)({
          odsBuffer,
          tableHeaderTargetPropertyMap: TRANSFORM_STRUCT_NON_EXISTENT_HEADERS,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });
    });

    context('when the file does not contain any data in the specified table', () => {

      it('should throw a UnprocessableEntityError', async () => {
        // given
        const emptyOdsBuffer = fs.readFileSync(EMPTY_TABLE_ODS_FILE_PATH);

        // when
        const result = await catchErr(extractTableDataFromOdsFile)({
          odsBuffer: emptyOdsBuffer,
          tableHeaderTargetPropertyMap: TRANSFORM_STRUCT,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });
    });

    it('should return the data extracted from the table in the ods file', async () => {
      // given
      const expectedCertificationCandidatesData = [
        {
          property1: 'Valeur1_ligne1toto',
          property2: 'Valeur2_ligne1JAIMEPIX',
        },
        {
          property1: 'Valeur1_ligne2toto',
          property2: 'Valeur2_ligne2JAIMEPIX',
        },
      ];

      // when
      const certificationCandidatesData = await extractTableDataFromOdsFile(
        {
          odsBuffer,
          tableHeaderTargetPropertyMap: TRANSFORM_STRUCT,
        });

      // then
      expect(certificationCandidatesData).to.deep.equal(expectedCertificationCandidatesData);
    });
  });

  describe('#getOdsVersionByHeaders', () => {

    const HEADERS_BY_VERSION = [
      {
        version: '1',
        headers: ['HEADER1_V1', 'HEADER2_V1'],
      },
      {
        version: '2',
        headers: ['HEADER1', 'HEADER2'],
      },
    ];

    context('when a version is found', () => {

      it('should return the appropriate version', async () => {
        // given
        odsBuffer = fs.readFileSync(DEFAULT_ODS_FILE_PATH);

        // when
        const version = await getOdsVersionByHeaders({
          odsBuffer,
          transformationStructsByVersion: HEADERS_BY_VERSION,
        });

        // then
        expect(version).to.equal('2');
      });

      it('should get the current attendance sheet version', async () => {
        // given
        odsBuffer = fs.readFileSync(SIMPLE_ATTENDANCE_ODS_FILE_PATH);
        const transformationStructsByVersion = TRANSFORMATION_STRUCTS_BY_VERSION;

        // when
        const version = await getOdsVersionByHeaders({ odsBuffer, transformationStructsByVersion });

        // then
        expect(version).to.equal(CURRENT_ATTENDANCE_SHEET_VERSION);
      });
    });

    context('when no version is found', () => {

      it('should throw a UnprocessableEntityError', async () => {
        // given
        odsBuffer = fs.readFileSync(UNKNOWN_VERSION_ODS_FILE_PATH);

        // when
        const result = await catchErr(getOdsVersionByHeaders)({
          odsBuffer,
          transformationStructsByVersion: HEADERS_BY_VERSION,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });
    });

    context('when newlines are present in file headers', () => {

      it('should return the appropriate version regardless of the newlines', async () => {
        // given
        odsBuffer = fs.readFileSync(NEW_LINE_ODS_FILE_PATH);

        // when
        const version = await getOdsVersionByHeaders({
          odsBuffer,
          transformationStructsByVersion: HEADERS_BY_VERSION,
        });

        // then
        expect(version).to.equal('2');
      });
    });
  });

  describe('#getSheetDataRowsFromOdsBuffer', () => {

    const candidatesRange = { range: 'B8:J9' };

    before(() => {
      odsBuffer = fs.readFileSync(SIMPLE_ATTENDANCE_ODS_FILE_PATH);
    });

    it('should read range rows and get the appropriate headers', async () => {
      // given
      const expectedHeaders = _.find(
        TRANSFORMATION_STRUCTS_BY_VERSION, { 'version': CURRENT_ATTENDANCE_SHEET_VERSION }
      ).headers;

      // when
      const dataRows = await getSheetDataRowsFromOdsBuffer({ odsBuffer, jsonOptions: candidatesRange });
      const firstData = dataRows.shift();

      // then
      expect(firstData).to.have.all.keys(expectedHeaders);
    });

    it('should read range rows and get the appropriate values', async () => {
      // given
      const jsonOptions = { ...candidatesRange, dateNF: 'dd/mm/yyyy;@', raw: false };
      const expectedData = {
        'Nom de naissance': 'DUPONT',
        'Prénom': 'André',
        'Date de naissance (format : jj/mm/aaaa)': '10/11/1995',
        'Commune de naissance': 'ANGERS',
        'Code du département de naissance': '40',
        'Pays de naissance': 'France',
        'Adresse e-mail de convocation': 'andre.dupont@example.net',
        'Identifiant local': 'd1525e47-46b8-4916-8bb2-3deda8c3a26c',
        'Temps majoré ?': '30 %',
      };

      // when
      const dataRows = await getSheetDataRowsFromOdsBuffer({ odsBuffer, jsonOptions });
      const firstData = dataRows.shift();

      // then
      expect(firstData).to.deep.equal(expectedData);
    });
  });

});
