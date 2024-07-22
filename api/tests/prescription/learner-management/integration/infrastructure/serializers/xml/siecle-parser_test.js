import fs from 'node:fs';
import * as url from 'node:url';

import {
  AggregateImportError,
  SiecleXmlImportError,
} from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { SiecleParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';
import { detectEncoding } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/detect-encoding.js';
import { SiecleFileStreamer } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { FileValidationError, SIECLE_ERRORS } from '../../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

const fixturesDirPath = `${url.fileURLToPath(new URL('../../../../../../', import.meta.url))}tooling/fixtures/`;

describe('Integration | Serializers | siecle-parser', function () {
  describe('parseUAJ', function () {
    it('should not throw', async function () {
      // given
      const path = `${fixturesDirPath}/siecle-file/siecle-with-two-valid-students.xml`;

      // when
      const encoding = await detectEncoding(path);
      const readableStream = fs.createReadStream(path);

      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, encoding);
      const parser = SiecleParser.create(siecleFileStreamer);
      const call = () => parser.parseUAJ('123ABC');

      //then
      expect(call).to.not.throw();
    });

    describe('error cases', function () {
      it('should throw an AggregateImportError', async function () {
        // given
        const wrongUAIFromSIECLE = '123ABC';
        const path = `${fixturesDirPath}/siecle-file/siecle-with-wrong-uai.xml`;
        const readableStream = fs.createReadStream(path);
        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(parser.parseUAJ, parser)(wrongUAIFromSIECLE);

        //then
        expect(errors).to.be.instanceof(AggregateImportError);
      });

      it('should abort parsing and reject with not valid UAI error', async function () {
        // given
        const wrongUAIFromSIECLE = '123ABC';
        const path = `${fixturesDirPath}/siecle-file/siecle-with-wrong-uai.xml`;
        const readableStream = fs.createReadStream(path);
        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(parser.parseUAJ, parser)(wrongUAIFromSIECLE);

        //then
        expect(errors.meta).to.be.lengthOf(1);
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.equal('UAI_MISMATCHED');
      });

      it('should abort parsing and reject with not valid UAI error if UAI is missing', async function () {
        // given
        const wrongUAIFromSIECLE = '123ABC';
        const path = `${fixturesDirPath}/siecle-file/siecle-with-no-uai.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parseUAJ(wrongUAIFromSIECLE))();

        //then
        expect(errors.meta).to.be.lengthOf(1);
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.equal('UAI_MISMATCHED');
      });
    });
  });

  describe('parse', function () {
    it('should parse two organizationLearners information', async function () {
      // given
      const path = `${fixturesDirPath}/siecle-file/siecle-with-two-valid-students.xml`;

      const expectedOrganizationLearners = [
        {
          lastName: 'HANDMADE',
          preferredLastName: '',
          firstName: 'Luciole',
          middleName: 'Léa',
          thirdName: 'Lucy',
          sex: 'F',
          birthdate: '1994-12-31',
          birthCityCode: '33318',
          birthCity: null,
          birthCountryCode: '100',
          birthProvinceCode: '033',
          MEFCode: '123456789',
          status: 'AP',
          nationalStudentId: '00000000123',
          division: '4A',
        },
        {
          lastName: 'COVERT',
          preferredLastName: 'COJAUNE',
          firstName: 'Harry',
          middleName: 'Cocœ',
          thirdName: '',
          sex: 'M',
          birthdate: '1994-07-01',
          birthCity: 'LONDRES',
          birthCityCode: null,
          birthCountryCode: '132',
          birthProvinceCode: null,
          MEFCode: '12341234',
          status: 'ST',
          nationalStudentId: '00000000124',
          division: '4A',
        },
      ];

      // when
      const encoding = await detectEncoding(path);
      const readableStream = fs.createReadStream(path);

      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, encoding);
      const parser = SiecleParser.create(siecleFileStreamer);

      const result = await parser.parse();

      //then
      expect(result).to.deep.equal(expectedOrganizationLearners);
    });

    it('should ignore invalid organizationLearners', async function () {
      // given
      const path = `${fixturesDirPath}/siecle-file/siecle-with-only-ignored-student.xml`;
      const readableStream = fs.createReadStream(path);

      const expectedOrganizationLearners = [];

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(siecleFileStreamer);
      const result = await parser.parse();

      //then
      expect(result).to.deep.equal(expectedOrganizationLearners);
    });

    describe('error cases', function () {
      it('should throw AggregateImportError', async function () {
        // given
        const path = `${fixturesDirPath}/siecle-file/siecle-with-duplicate-national-student-id.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors).to.be.instanceof(AggregateImportError);
      });

      it('should abort parsing and reject with duplicate national student id error', async function () {
        // given
        const path = `${fixturesDirPath}/siecle-file/siecle-with-duplicate-national-student-id.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.equal('INE_UNIQUE');
        expect(errors.meta[0].meta).to.deep.equal({ nationalStudentId: '00000000123' });
      });

      it('should abort parsing and reject with duplicate national student id error and tag not correctly closed', async function () {
        // given
        const path = `${fixturesDirPath}/siecle-file/siecle-with-duplicate-national-student-id-and-unclosed-tag.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta).lengthOf(2);
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[1]).to.be.instanceof(FileValidationError);
      });

      it('should abort parsing and reject with missing national student id error', async function () {
        // given
        const path = `${fixturesDirPath}/siecle-file/siecle-with-no-national-student-id.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.equal('INE_REQUIRED');
      });

      it('should abort parsing and reject with missing sex ', async function () {
        // given
        const nationalStudentIdFromFile = '12345';
        const path = `${fixturesDirPath}/siecle-file/siecle-student-with-no-sex.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.be.equal(SIECLE_ERRORS.SEX_CODE_REQUIRED);
        expect(errors.meta[0].meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
      });

      it('should abort parsing and reject with missing birthdate ', async function () {
        // given
        const nationalStudentIdFromFile = '12345';
        const path = `${fixturesDirPath}/siecle-file/siecle-student-with-no-birthdate.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.be.equal(SIECLE_ERRORS.BIRTHDATE_REQUIRED);
        expect(errors.meta[0].meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
      });

      it('should abort parsing and reject with invalid birthdate format ', async function () {
        // given
        const nationalStudentIdFromFile = '12345';
        const path = `${fixturesDirPath}/siecle-file/siecle-student-with-invalid-birthdate-format.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[0].code).to.be.equal(SIECLE_ERRORS.INVALID_BIRTHDATE_FORMAT);
        expect(errors.meta[0].meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
      });

      it('should abort parsing and reject multiple error', async function () {
        // given
        const path = `${fixturesDirPath}/siecle-file/siecle-student-with-no-sex-no-birthdate.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(siecleFileStreamer);
        const errors = await catchErr(() => parser.parse())();

        //then
        expect(errors.meta).lengthOf(2);
        expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
        expect(errors.meta[1]).to.be.instanceof(SiecleXmlImportError);
      });

      context('when student is born in France', function () {
        it('should abort parsing and reject with missing birth city code ', async function () {
          // given
          const nationalStudentIdFromFile = '1234';
          const path = `${fixturesDirPath}/siecle-file/siecle-french-student-with-no-birth-city-code.xml`;
          const readableStream = fs.createReadStream(path);

          // when
          const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
          const parser = SiecleParser.create(siecleFileStreamer);
          const errors = await catchErr(() => parser.parse())();

          //then
          expect(errors.meta[0]).to.be.instanceof(SiecleXmlImportError);
          expect(errors.meta[0].code).to.be.equal(SIECLE_ERRORS.BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT);
          expect(errors.meta[0].meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
        });
      });
    });
  });
});
