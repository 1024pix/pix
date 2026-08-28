import sinon from 'sinon';

import { VersionNotDraftError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { activateVersion } from '../../../../../../src/certification/configuration/domain/usecases/activate-version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | activate-version', function () {
  let versionRepository;
  let calibrationRepository;
  let calibratedChallengesRepository;

  beforeEach(function () {
    versionRepository = {
      getById: sinon.stub(),
      findActiveByScope: sinon.stub(),
      save: sinon.stub(),
    };
    calibrationRepository = {
      find: sinon.stub(),
    };
    calibratedChallengesRepository = {
      saveMany: sinon.stub(),
    };
  });

  context('when the version does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      versionRepository.getById.resolves(null);

      // when
      const err = await catchErr(activateVersion)({
        id: 1,
        versionRepository,
        calibrationRepository,
        calibratedChallengesRepository,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the version is not a draft', function () {
    it('throws a VersionNotDraftError', async function () {
      // given
      const activeVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2024-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec1'] })
        .build();
      versionRepository.getById.resolves(activeVersion);

      // when
      const err = await catchErr(activateVersion)({
        id: activeVersion.id,
        versionRepository,
        calibrationRepository,
        calibratedChallengesRepository,
      });

      // then
      expect(err).to.be.instanceOf(VersionNotDraftError);
    });
  });

  context('when the version is a draft', function () {
    context('when the calibration does not exist', function () {
      it('throws a NotFoundError', async function () {
        const draftVersion = domainBuilder.certification.configuration
          .versionBuilder()
          .asDraft({ startDate: new Date('2025-01-01') })
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 42, externalCalibrationId: 7 })
          .build();
        versionRepository.getById.resolves(draftVersion);
        calibrationRepository.find.resolves(null);

        const err = await catchErr(activateVersion)({
          id: 42,
          versionRepository,
          calibrationRepository,
          calibratedChallengesRepository,
        });

        expect(err).to.be.instanceOf(NotFoundError);
      });
    });
    it('fetches the calibration and persists the calibrated challenges', async function () {
      // given
      const calibratedChallenges = [{ challengeId: 'chalA', tubeId: 'tubeA', alpha: 1.5, delta: -0.5 }];
      const calibration = { calibratedChallenges };
      const draftVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2025-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 42, externalCalibrationId: 7 })
        .build();
      versionRepository.getById.resolves(draftVersion);
      versionRepository.findActiveByScope.resolves(null);
      versionRepository.save.resolves(draftVersion.id);
      calibrationRepository.find.resolves(calibration);
      calibratedChallengesRepository.saveMany.resolves();

      // when
      await activateVersion({ id: 42, versionRepository, calibrationRepository, calibratedChallengesRepository });

      // then
      sinon.assert.calledWithExactly(calibrationRepository.find, 7);
      sinon.assert.calledWithExactly(calibratedChallengesRepository.saveMany, {
        calibratedChallenges,
        versionId: 42,
      });
    });

    it('activates the draft version', async function () {
      // given
      const now = new Date('2025-09-01');
      sinon.useFakeTimers({ now, toFake: ['Date'] });

      const draftVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2025-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec1'], id: 42, externalCalibrationId: 7 })
        .build();
      versionRepository.getById.resolves(draftVersion);
      versionRepository.findActiveByScope.resolves(null);
      versionRepository.save.resolves();
      calibrationRepository.find.resolves({ calibratedChallenges: [] });
      calibratedChallengesRepository.saveMany.resolves();

      // when
      await activateVersion({ id: 42, versionRepository, calibrationRepository, calibratedChallengesRepository });

      // then
      expect(draftVersion.status).to.equal(VERSION_STATUSES.ACTIVE);
      expect(draftVersion.startDate).to.deep.equal(now);
      sinon.assert.calledWithExactly(versionRepository.save, draftVersion);
    });

    context('when there is a currently active version for the same scope', function () {
      it('archives it before activating the draft', async function () {
        // given
        const now = new Date('2025-09-01');
        sinon.useFakeTimers({ now, toFake: ['Date'] });

        const draftVersion = domainBuilder.certification.configuration
          .versionBuilder()
          .asDraft({ startDate: new Date('2025-01-01') })
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec1'], id: 42, externalCalibrationId: 7 })
          .build();
        const currentActiveVersion = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2024-01-01') })
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec1'], id: 10 })
          .build();
        versionRepository.getById.resolves(draftVersion);
        versionRepository.findActiveByScope.resolves(currentActiveVersion);
        versionRepository.save.resolves();
        calibrationRepository.find.resolves({ calibratedChallenges: [] });
        calibratedChallengesRepository.saveMany.resolves();

        // when
        await activateVersion({ id: 42, versionRepository, calibrationRepository, calibratedChallengesRepository });

        // then
        expect(currentActiveVersion.status).to.equal(VERSION_STATUSES.ARCHIVED);
        expect(currentActiveVersion.expirationDate).to.deep.equal(now);
        sinon.assert.calledWithExactly(versionRepository.save, currentActiveVersion);
      });
    });
  });
});
