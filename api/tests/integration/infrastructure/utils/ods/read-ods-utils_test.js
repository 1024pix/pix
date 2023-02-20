import { promises } from 'fs';

const { readFile: readFile } = promises;

import _ from 'lodash';
import { expect, catchErr } from '../../../../test-helper';
import { UnprocessableEntityError } from '../../../../../lib/application/http-errors';
import { getTransformationStructsForPixCertifCandidatesImport } from '../../../../../lib/infrastructure/files/candidates-import/candidates-import-transformation-structures';

import {
  getContentXml,
  extractTableDataFromOdsFile,
  validateOdsHeaders,
  getSheetDataRowsFromOdsBuffer,
} from '../../../../../lib/infrastructure/utils/ods/read-ods-utils';

describe('Integration | Infrastructure | Utils | Ods | read-ods-utils', function () {
  const GET_CONTENT_ODS_FILE_PATH = `${__dirname}/files/get-content-xml_test.ods`;
  const DEFAULT_ODS_FILE_PATH = `${__dirname}/files/default_test.ods`;
  const EMPTY_TABLE_ODS_FILE_PATH = `${__dirname}/files/empty-table_test.ods`;
  const UNKNOWN_VERSION_ODS_FILE_PATH = `${__dirname}/files/unknown-version_test.ods`;
  const NEW_LINE_ODS_FILE_PATH = `${__dirname}/files/newline_test.ods`;
  const SIMPLE_ATTENDANCE_ODS_FILE_PATH = `${__dirname}/files/simple-attendance_test.ods`;

  let odsBuffer;

  describe('#getContentXml', function () {
    it('should return the content.xml from the ods file as a string', async function () {
      // given
      const expectedStringifiedXml =
        '<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0" xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0" xmlns:math="http://www.w3.org/1998/Math/MathML" xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer" xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events" xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:rpt="http://openoffice.org/2005/report" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#" xmlns:tableooo="http://openoffice.org/2009/table" xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0" office:version="1.2"><office:scripts/><office:font-face-decls><style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss" style:font-pitch="variable"/><style:font-face style:name="Arial Unicode MS" svg:font-family="&apos;Arial Unicode MS&apos;" style:font-family-generic="system" style:font-pitch="variable"/><style:font-face style:name="Tahoma" svg:font-family="Tahoma" style:font-family-generic="system" style:font-pitch="variable"/></office:font-face-decls><office:automatic-styles><style:style style:name="co1" style:family="table-column"><style:table-column-properties fo:break-before="auto" style:column-width="2.267cm"/></style:style><style:style style:name="ro1" style:family="table-row"><style:table-row-properties style:row-height="0.427cm" fo:break-before="auto" style:use-optimal-row-height="true"/></style:style><style:style style:name="ta1" style:family="table" style:master-page-name="Default"><style:table-properties table:display="true" style:writing-mode="lr-tb"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Feuille1" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell office:value-type="string"><text:p>TEST </text:p></table:table-cell></table:table-row></table:table><table:table table:name="Feuille2" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table><table:table table:name="Feuille3" table:style-name="ta1" table:print="false"><table:table-column table:style-name="co1" table:default-cell-style-name="Default"/><table:table-row table:style-name="ro1"><table:table-cell/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>';

      // when
      const result = await getContentXml({ odsFilePath: GET_CONTENT_ODS_FILE_PATH });

      // then
      expect(result).to.deep.equal(expectedStringifiedXml);
    });
  });

  describe('#extractTableDataFromOdsFile', function () {
    beforeEach(async function () {
      odsBuffer = await readFile(DEFAULT_ODS_FILE_PATH);
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

    context('when the buffer is invalid', function () {
      it('should throw a UnprocessableEntityError', async function () {
        // given
        const alteredBuffer = Buffer.from(_.map(odsBuffer, (value) => value + 'a'));

        // when
        const result = await catchErr(extractTableDataFromOdsFile)({
          odsBuffer: alteredBuffer,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });
    });

    context('when the conf header contains new line but the file headers does not', function () {
      const TRANSFORM_STRUCT_NONE = [
        {
          header: 'HEADER1',
          property: 'property1',
          transformFn: (a) => a,
        },
        {
          header: 'HEADER\n2',
          property: 'property2',
          transformFn: (a) => a,
        },
      ];

      it('should return the data extracted from the table in the ods file', async function () {
        // given
        const expectedCertificationCandidatesData = {
          7: {
            property1: 'Valeur1_ligne1',
            property2: 'Valeur2_ligne1',
          },
          8: {
            property1: 'Valeur1_ligne2',
            property2: 'Valeur2_ligne2',
          },
        };

        // when
        const certificationCandidatesData = await extractTableDataFromOdsFile({
          odsBuffer,
          tableHeaderTargetPropertyMap: TRANSFORM_STRUCT_NONE,
        });

        // then
        expect(certificationCandidatesData).to.deep.equal(expectedCertificationCandidatesData);
      });
    });

    context('when the headers are not present in the ods file', function () {
      it('should throw a UnprocessableEntityError', async function () {
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

    context('when the file does not contain any data in the specified table', function () {
      it('should throw a UnprocessableEntityError', async function () {
        // given
        const emptyOdsBuffer = await readFile(EMPTY_TABLE_ODS_FILE_PATH);

        // when
        const result = await catchErr(extractTableDataFromOdsFile)({
          odsBuffer: emptyOdsBuffer,
          tableHeaderTargetPropertyMap: TRANSFORM_STRUCT,
        });

        // then
        expect(result).to.be.instanceof(UnprocessableEntityError);
      });
    });

    it('should return the data extracted from the table in the ods file', async function () {
      // given
      const expectedCertificationCandidatesData = {
        7: {
          property1: 'Valeur1_ligne1toto',
          property2: 'Valeur2_ligne1JAIMEPIX',
        },
        8: {
          property1: 'Valeur1_ligne2toto',
          property2: 'Valeur2_ligne2JAIMEPIX',
        },
      };

      // when
      const certificationCandidatesData = await extractTableDataFromOdsFile({
        odsBuffer,
        tableHeaderTargetPropertyMap: TRANSFORM_STRUCT,
      });

      // then
      expect(certificationCandidatesData).to.deep.equal(expectedCertificationCandidatesData);
    });
  });

  describe('#validateOdsHeaders', function () {
    const VALID_HEADERS = ['HEADER1', 'HEADER2'];
    const INVALID_HEADERS = ['HEADER3', 'HEADER4'];

    context('when the headers are found', function () {
      it('should not throw a UnprocessableEntityError', async function () {
        // given
        odsBuffer = await readFile(DEFAULT_ODS_FILE_PATH);

        // when
        const call = async () => {
          await validateOdsHeaders({
            odsBuffer,
            headers: VALID_HEADERS,
          });
        };

        // then
        expect(call).to.not.throw();
      });
    });

    context('when the headers are not found', function () {
      it('should throw a UnprocessableEntityError', async function () {
        // given
        odsBuffer = await readFile(UNKNOWN_VERSION_ODS_FILE_PATH);

        // when
        const error = await catchErr(validateOdsHeaders)({
          odsBuffer,
          headers: INVALID_HEADERS,
        });

        // then
        expect(error).to.be.instanceof(UnprocessableEntityError);
      });
    });

    context('when newlines are present in file headers', function () {
      it('should not throw', async function () {
        // given
        odsBuffer = await readFile(NEW_LINE_ODS_FILE_PATH);

        // when
        const call = () => {
          validateOdsHeaders({
            odsBuffer,
            headers: VALID_HEADERS,
          });
        };
        // then
        expect(call).to.not.throw();
      });
    });
  });

  describe('#getSheetDataRowsFromOdsBuffer', function () {
    const candidatesRange = { range: 'B12:M13' };

    before(async function () {
      odsBuffer = await readFile(SIMPLE_ATTENDANCE_ODS_FILE_PATH);
    });

    it('should read range rows and get the appropriate headers', async function () {
      // given
      const expectedHeaders = getTransformationStructsForPixCertifCandidatesImport({
        complementaryCertifications: [],
        isSco: true,
      }).headers;

      // when
      const dataRows = await getSheetDataRowsFromOdsBuffer({ odsBuffer, jsonOptions: candidatesRange });
      const firstData = dataRows.shift();

      // then
      expect(firstData).to.have.all.keys(expectedHeaders);
    });

    it('should read range rows and get the appropriate values', async function () {
      // given
      const jsonOptions = { ...candidatesRange, dateNF: 'dd/mm/yyyy;@', raw: false };
      const expectedData = {
        '* Date de naissance (format : jj/mm/aaaa)': '05/10/88',
        '* Nom de naissance': 'Delarue',
        '* Prénom': 'Sophie',
        '* Sexe (M ou F)': 'F',
        'Code Insee': ' ',
        'Code postal': '75001',
        'E-mail de convocation': 'convocation@example.net',
        'E-mail du destinataire des résultats (formateur, enseignant…)': 's.d@example.net',
        'Identifiant local': '1',
        'Nom de la commune': 'Paris',
        Pays: 'France',
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
