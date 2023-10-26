import { domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { isSameBinary } from '../../../../tooling/binary-comparator.js';
import { getSupervisorKitPdfBuffer } from '../../../../../lib/infrastructure/utils/pdf/supervisor-kit-pdf.js';
import pdfLibUtils from 'pdf-lib/cjs/utils/index.js';
import * as url from 'url';
import { LOCALE } from '../../../../../lib/domain/constants.js';

const { FRENCH_SPOKEN, ENGLISH_SPOKEN } = LOCALE;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | Certification supervisor kit Pdf', function () {
  beforeEach(function () {
    _makePdfLibPredictable();
  });

  context('when lang is french', function () {
    context('when session is V2', function () {
      it('should return full french supervisor kit as a buffer', async function () {
        // given
        const lang = FRENCH_SPOKEN;
        const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
          id: 12345678,
          supervisorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const expectedPdfPath = __dirname + '/kit-surveillant_expected.pdf';

        // when
        const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
          sessionForSupervisorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        // Note: to update the reference pdf, you can run the test with the following lines.
        //
        // import { writeFile } from 'fs/promises';
        // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

        // then
        expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
      });

      context('when session details contains long labels', function () {
        it('should return full supervisor kit as a buffer with long labels in multiple lines', async function () {
          // given
          const lang = FRENCH_SPOKEN;
          const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
            id: 12345678,
            supervisorPassword: 12344,
            accessCode: 'WB64K2',
            date: '2022-09-21',
            examiner: 'Un nom très très très très très très très très très très long',
            address: 'Une adresse qui ne tient pas sur une seule ligne',
            room: 'Une salle particulièrement longue mais on ne sait jamais',
          });
          const expectedPdfPath = __dirname + '/kit-surveillant-with-long-labels_expected.pdf';

          // when
          const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
            sessionForSupervisorKit,
            lang,
            creationDate: new Date('2021-01-01'),
          });

          // Note: to update the reference pdf, you can run the test with the following lines.
          //
          // import { writeFile } from 'fs/promises';
          // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

          // then
          expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
          expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
        });
      });
    });

    context('when session is V3', function () {
      it('should return full french supervisor kit v3 pdf', async function () {
        // given
        const lang = FRENCH_SPOKEN;
        const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
          id: 12345678,
          supervisorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
          version: 3,
        });
        const expectedPdfPath = __dirname + '/kit-surveillant_expected-v3.pdf';

        // when
        const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
          sessionForSupervisorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        // Note: to update the reference pdf, you can run the test with the following lines.
        //
        // import { writeFile } from 'fs/promises';
        // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

        // then
        expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}-v3.pdf`);
      });

      context('when session details contains long labels', function () {
        it('should return full supervisor kit v3 with long labels in multiple lines', async function () {
          // given
          const lang = FRENCH_SPOKEN;
          const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
            id: 12345678,
            supervisorPassword: 12344,
            accessCode: 'WB64K2',
            date: '2022-09-21',
            examiner: 'Un nom très très très très très très très très très très long',
            address: 'Une adresse qui ne tient pas sur une seule ligne',
            room: 'Une salle particulièrement longue mais on ne sait jamais',
            version: 3,
          });
          const expectedPdfPath = __dirname + '/kit-surveillant-with-long-labels_expected-v3.pdf';

          // when
          const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
            sessionForSupervisorKit,
            lang,
            creationDate: new Date('2021-01-01'),
          });

          // Note: to update the reference pdf, you can run the test with the following lines.
          //
          // import { writeFile } from 'fs/promises';
          // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

          // then
          expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
          expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}-v3.pdf`);
        });
      });
    });
  });

  context('when lang is english', function () {
    it('should return full english supervisor kit as a buffer', async function () {
      // given
      const lang = ENGLISH_SPOKEN;
      const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
        id: 12345678,
        supervisorPassword: 12344,
        accessCode: 'WB64K2',
        date: '2022-09-21',
        examiner: 'Ariete Bordeauxchesnel',
      });
      const expectedPdfPath = __dirname + '/invigilator-kit_expected.pdf';

      // when
      const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
        sessionForSupervisorKit,
        lang,
        creationDate: new Date('2021-01-01'),
      });

      // Note: to update the reference pdf, you can run the test with the following lines.
      //
      // import { writeFile } from 'fs/promises';
      // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

      // then
      expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
      expect(fileName).to.equal(`invigilator-kit-${sessionForSupervisorKit.id}.pdf`);
    });
  });

  context('when lang is not supported', function () {
    context('when lang is not given', function () {
      it('should return full french supervisor kit as a buffer', async function () {
        // given
        const lang = undefined;
        const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
          id: 12345678,
          supervisorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const expectedPdfPath = __dirname + '/kit-surveillant_expected.pdf';

        // when
        const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
          sessionForSupervisorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        // Note: to update the reference pdf, you can run the test with the following lines.
        //
        // import { writeFile } from 'fs/promises';
        // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

        // then
        expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
      });
    });

    context('when lang is given', function () {
      it('should return full french supervisor kit as a buffer', async function () {
        // given
        const lang = 'pt';
        const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
          id: 12345678,
          supervisorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const expectedPdfPath = __dirname + '/kit-surveillant_expected.pdf';

        // when
        const { buffer: actualSupervisorKitBuffer, fileName } = await getSupervisorKitPdfBuffer({
          sessionForSupervisorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        // Note: to update the reference pdf, you can run the test with the following lines.
        //
        // import { writeFile } from 'fs/promises';
        // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

        // then
        expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
      });
    });
  });
});

// Warning: call _restorePdfLib() when finished /!\
function _makePdfLibPredictable() {
  const suffixes = new Map();

  function autoIncrementSuffixByPrefix(prefix, suffixLength) {
    if (suffixLength === void 0) {
      suffixLength = 4;
    }

    const suffix = (suffixes.get(prefix) ?? Math.pow(10, suffixLength)) + 1;
    suffixes.set(prefix, suffix);

    return prefix + '-' + Math.floor(suffix);
  }

  sinon.stub(pdfLibUtils, 'addRandomSuffix').callsFake(autoIncrementSuffixByPrefix);
}
