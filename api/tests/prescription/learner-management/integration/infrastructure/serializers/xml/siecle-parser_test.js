import * as url from 'url';
import fs from 'fs';
import { expect, catchErr } from '../../../../../../test-helper.js';
import { SIECLE_ERRORS } from '../../../../../../../lib/domain/errors.js';
import { SiecleXmlImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { SiecleParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { detectEncoding } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/detect-encoding.js';

const fixturesDirPath = `${url.fileURLToPath(new URL('../../../../../../', import.meta.url))}tooling/fixtures/`;

describe('Integration | Serializers | siecle-parser', function () {
  describe('parse', function () {
    it('should parse two organizationLearners information', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const organization = { externalId: validUAIFromSIECLE };
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
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const result = await parser.parse();

      //then
      expect(result).to.deep.equal(expectedOrganizationLearners);
    });

    it('should not parse organizationLearners who are no longer in the school', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const organization = { externalId: validUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-registrations-no-longer-in-school.xml`;
      const readableStream = fs.createReadStream(path);

      const expectedOrganizationLearners = [];

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const result = await parser.parse();

      //then
      expect(result).to.deep.equal(expectedOrganizationLearners);
    });

    it('should abort parsing and reject with not valid UAI error', async function () {
      // given
      const wrongUAIFromSIECLE = '123ABC';
      const organization = { externalId: wrongUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-wrong-uai.xml`;
      const readableStream = fs.createReadStream(path);
      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parseUAJ(wrongUAIFromSIECLE))();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.equal('UAI_MISMATCHED');
    });

    it('should abort parsing and reject with not valid UAI error if UAI is missing', async function () {
      // given
      const wrongUAIFromSIECLE = '123ABC';
      const organization = { externalId: wrongUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-no-uai.xml`;
      const readableStream = fs.createReadStream(path);

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parseUAJ(wrongUAIFromSIECLE))();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.equal('UAI_MISMATCHED');
    });

    it('should abort parsing and reject with duplicate national student id error', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const organization = { externalId: validUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-duplicate-national-student-id.xml`;
      const readableStream = fs.createReadStream(path);

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parse())();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.equal('INE_UNIQUE');
      expect(error.meta).to.deep.equal({ nationalStudentId: '00000000123' });
    });

    it('should abort parsing and reject with duplicate national student id error and tag not correctly closed', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const organization = { externalId: validUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-duplicate-national-student-id-and-unclosed-tag.xml`;
      const readableStream = fs.createReadStream(path);

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parse())();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.equal('INE_UNIQUE');
      expect(error.meta).to.deep.equal({ nationalStudentId: '00000000123' });
    });

    it('should abort parsing and reject with missing national student id error', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const organization = { externalId: validUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-with-no-national-student-id.xml`;
      const readableStream = fs.createReadStream(path);

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parse())();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.equal('INE_REQUIRED');
    });

    it('should abort parsing and reject with missing sex ', async function () {
      // given
      const validUAIFromSIECLE = '123ABC';
      const nationalStudentIdFromFile = '12345';
      const organization = { externalId: validUAIFromSIECLE };
      const path = `${fixturesDirPath}/siecle-file/siecle-student-with-no-sex.xml`;
      const readableStream = fs.createReadStream(path);

      // when
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
      const parser = SiecleParser.create(organization, siecleFileStreamer);
      const error = await catchErr(() => parser.parse())();

      //then
      expect(error).to.be.instanceof(SiecleXmlImportError);
      expect(error.code).to.be.equal(SIECLE_ERRORS.SEX_CODE_REQUIRED);
      expect(error.meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
    });
    context('when student is born in France', function () {
      it('should abort parsing and reject with missing birth city code ', async function () {
        // given
        const validUAIFromSIECLE = '123ABC';
        const nationalStudentIdFromFile = '1234';
        const organization = { externalId: validUAIFromSIECLE };
        const path = `${fixturesDirPath}/siecle-file/siecle-french-student-with-no-birth-city-code.xml`;
        const readableStream = fs.createReadStream(path);

        // when
        const siecleFileStreamer = await SiecleFileStreamer.create(readableStream);
        const parser = SiecleParser.create(organization, siecleFileStreamer);
        const error = await catchErr(() => parser.parse())();

        //then
        expect(error).to.be.instanceof(SiecleXmlImportError);
        expect(error.code).to.be.equal(SIECLE_ERRORS.BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT);
        expect(error.meta).to.contains({ nationalStudentId: nationalStudentIdFromFile });
      });
    });
  });
});
