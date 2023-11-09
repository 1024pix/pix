import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { isSameBinary } from '../../../../../../tooling/binary-comparator.js';
import { getInvigilatorKitPdfBuffer } from '../../../../../../../src/certification/session/infrastructure/utils/pdf/invigilator-kit-pdf.js';
import pdfLibUtils from 'pdf-lib/cjs/utils/index.js';
import * as url from 'url';
import { writeFile } from 'fs/promises';
import { LOCALE } from '../../../../../../../src/shared/domain/constants.js';

const { FRENCH_SPOKEN, ENGLISH_SPOKEN } = LOCALE;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | Certification invigilator kit Pdf', function () {
  beforeEach(function () {
    _makePdfLibPredictable();
  });

  context('when lang is french', function () {
    context('when session is V2', function () {
      it('should return full french invigilator kit as a buffer', async function () {
        // given
        const lang = FRENCH_SPOKEN;
        const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
          id: 12345678,
          invigilatorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const outputFilename = '/invigilator-kit_expected.pdf';

        // when
        const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
          sessionForInvigilatorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

        // then
        expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}.pdf`);
      });

      context('when session details contains long labels', function () {
        it('should return full invigilator kit as a buffer with long labels in multiple lines', async function () {
          // given
          const lang = FRENCH_SPOKEN;
          const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
            id: 12345678,
            invigilatorPassword: 12344,
            accessCode: 'WB64K2',
            date: '2022-09-21',
            examiner: 'Un nom très très très très très très très très très très long',
            address: 'Une adresse qui ne tient pas sur une seule ligne',
            room: 'Une salle particulièrement longue mais on ne sait jamais',
          });
          const outputFilename = '/invigilator-kit-with-long-labels_expected.pdf';

          // when
          const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
            sessionForInvigilatorKit,
            lang,
            creationDate: new Date('2021-01-01'),
          });

          await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

          // then
          expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
          expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}.pdf`);
        });
      });
    });

    context('when session is V3', function () {
      it('should return full french invigilator kit v3 pdf', async function () {
        // given
        const lang = FRENCH_SPOKEN;
        const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
          id: 12345678,
          invigilatorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
          version: 3,
        });
        const outputFilename = '/invigilator-kit_expected-v3.pdf';

        // when
        const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
          sessionForInvigilatorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

        // then
        expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}-v3.pdf`);
      });

      context('when session details contains long labels', function () {
        it('should return full invigilator kit v3 with long labels in multiple lines', async function () {
          // given
          const lang = FRENCH_SPOKEN;
          const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
            id: 12345678,
            invigilatorPassword: 12344,
            accessCode: 'WB64K2',
            date: '2022-09-21',
            examiner: 'Un nom très très très très très très très très très très long',
            address: 'Une adresse qui ne tient pas sur une seule ligne',
            room: 'Une salle particulièrement longue mais on ne sait jamais',
            version: 3,
          });
          const outputFilename = '/invigilator-kit-with-long-labels_expected-v3.pdf';

          // when
          const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
            sessionForInvigilatorKit,
            lang,
            creationDate: new Date('2021-01-01'),
          });

          await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

          // then
          expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
          expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}-v3.pdf`);
        });
      });
    });
  });

  context('when lang is english', function () {
    it('should return full english invigilator kit as a buffer', async function () {
      // given
      const lang = ENGLISH_SPOKEN;
      const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
        id: 12345678,
        invigilatorPassword: 12344,
        accessCode: 'WB64K2',
        date: '2022-09-21',
        examiner: 'Ariete Bordeauxchesnel',
      });
      const outputFilename = '/invigilator-kit-EN_expected.pdf';

      // when
      const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
        sessionForInvigilatorKit,
        lang,
        creationDate: new Date('2021-01-01'),
      });

      await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

      // then
      expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
      expect(fileName).to.equal(`invigilator-kit-${sessionForInvigilatorKit.id}.pdf`);
    });
  });

  context('when lang is not supported', function () {
    context('when lang is not given', function () {
      it('should return full french invigilator kit as a buffer', async function () {
        // given
        const lang = undefined;
        const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
          id: 12345678,
          invigilatorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const outputFilename = '/invigilator-kit_expected.pdf';

        // when
        const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
          sessionForInvigilatorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

        // then
        expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}.pdf`);
      });
    });

    context('when lang is given', function () {
      it('should return full french invigilator kit as a buffer', async function () {
        // given
        const lang = 'pt';
        const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
          id: 12345678,
          invigilatorPassword: 12344,
          accessCode: 'WB64K2',
          date: '2022-09-21',
          examiner: 'Ariete Bordeauxchesnel',
        });
        const outputFilename = '/invigilator-kit_expected.pdf';

        // when
        const { buffer: actualInvigilatorKitBuffer, fileName } = await getInvigilatorKitPdfBuffer({
          sessionForInvigilatorKit,
          lang,
          creationDate: new Date('2021-01-01'),
        });

        await _writeFile({ outputFilename, actualInvigilatorKitBuffer });

        // then
        expect(await isSameBinary(`${__dirname}${outputFilename}`, actualInvigilatorKitBuffer)).to.be.true;
        expect(fileName).to.equal(`kit-surveillant-${sessionForInvigilatorKit.id}.pdf`);
      });
    });
  });
});

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

async function _writeFile({ actualInvigilatorKitBuffer, outputFilename, dryRun = true }) {
  // Note: to update or create the reference pdf, set dryRun to false.
  if (!dryRun) {
    await writeFile(`${__dirname}/${outputFilename}`, actualInvigilatorKitBuffer);
  }
}
