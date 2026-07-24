import sinon from 'sinon';

import { NoCertificationResultsToDownloadError } from '../../../../../../src/certification/results/domain/errors.js';
import { getSelectedSessionsResultsZip } from '../../../../../../src/certification/results/domain/usecases/get-selected-sessions-results-zip.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Results | UseCase | get-selected-sessions-results-zip', function () {
  describe('when no selected session has certification results', function () {
    it('should throw a NoCertificationResultsToDownloadError', async function () {
      // given
      const certificationResultRepository = { findBySessionId: sinon.stub().resolves([]) };

      // when
      const error = await catchErr(getSelectedSessionsResultsZip)({
        sessionIds: [1, 2],
        i18n: Symbol('i18n'),
        certificationResultRepository,
        sessionForResultsSharingRepository: Symbol('sessionForResultsSharingRepository'),
      });

      // then
      expect(error).to.be.an.instanceOf(NoCertificationResultsToDownloadError);
    });
  });
});
