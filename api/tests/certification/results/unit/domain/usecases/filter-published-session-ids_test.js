import { expect } from 'chai';
import sinon from 'sinon';

import { NoCertificationResultsToDownloadError } from '../../../../../../src/certification/results/domain/errors.js';
import { filterPublishedSessionIds } from '../../../../../../src/certification/results/domain/usecases/filter-published-session-ids.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Results | UseCase | filter-published-session-ids', function () {
  let sessionForResultsSharingRepository;

  beforeEach(function () {
    sessionForResultsSharingRepository = { findPublishedSessionIds: sinon.stub() };
  });

  context('when no selected session is published', function () {
    it('should throw a NoCertificationResultsToDownloadError', async function () {
      // given
      sessionForResultsSharingRepository.findPublishedSessionIds.withArgs({ sessionIds: [1, 2] }).resolves([]);

      // when
      const error = await catchErr(filterPublishedSessionIds)({
        sessionIds: [1, 2],
        sessionForResultsSharingRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NoCertificationResultsToDownloadError);
    });
  });

  context('when some selected sessions are published', function () {
    it('should return only those session ids, in the selection order', async function () {
      // given
      sessionForResultsSharingRepository.findPublishedSessionIds
        .withArgs({ sessionIds: [3, 1, 2, 4] })
        .resolves([4, 3]);

      // when
      const sessionIds = await filterPublishedSessionIds({
        sessionIds: [3, 1, 2, 4],
        sessionForResultsSharingRepository,
      });

      // then
      expect(sessionIds).to.deep.equal([3, 4]);
    });
  });
});
