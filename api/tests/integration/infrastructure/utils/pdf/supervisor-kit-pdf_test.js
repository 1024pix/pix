import { domainBuilder, expect } from '../../../../test-helper';
import { isSameBinary } from '../../../../tooling/binary-comparator';
import { getSupervisorKitPdfBuffer } from '../../../../../lib/infrastructure/utils/pdf/supervisor-kit-pdf';
import { addRandomSuffix } from 'pdf-lib/cjs/utils';

describe('Integration | Infrastructure | Utils | Pdf | Certification supervisor kit Pdf', function () {
  beforeEach(function () {
    _makePdfLibPredictable();
  });

  afterEach(function () {
    _restorePdfLib();
  });

  it('should return full supervisor kit as a buffer', async function () {
    // given
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
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the following lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

    // then
    expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
    expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
  });

  context('when session details contains long labels', function () {
    it('should return full supervisor kit as a buffer with long labels in multiple lines', async function () {
      // given
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
        creationDate: new Date('2021-01-01'),
      });

      // Note: to update the reference pdf, you can run the test with the following lines.
      //
      // const { writeFile } = require('fs/promises');
      // await writeFile(expectedPdfPath, actualSupervisorKitBuffer);

      // then
      expect(await isSameBinary(expectedPdfPath, actualSupervisorKitBuffer)).to.be.true;
      expect(fileName).to.equal(`kit-surveillant-${sessionForSupervisorKit.id}.pdf`);
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

  require('pdf-lib/cjs/utils').addRandomSuffix = autoIncrementSuffixByPrefix;
}

function _restorePdfLib() {
  require('pdf-lib/cjs/utils').addRandomSuffix = addRandomSuffix;
}
