import sinon from 'sinon';

import * as simulateFlashAssessmentScenarioModule from '../../../../../../src/certification/evaluation/domain/usecases/simulate-flash-assessment-scenario.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const { simulateFlashAssessmentScenario } = simulateFlashAssessmentScenarioModule;

describe('Unit | Domain | Usecases | simulate-flash-assessment-scenario', function () {
  describe('#simulateFlashAssessmentScenario', function () {
    it('should fetch the referential challenges', async function () {
      // given
      const locale = FRENCH_FRANCE;
      const accessibilityAdjustmentNeeded = false;
      const versionId = 1;
      const challengesConfiguration = { minimumEstimatedSuccessRateRanges: [], defaultCandidateCapacity: -1 };
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({ scope: SCOPES.PIX_PLUS_DROIT, id: versionId, challengesConfiguration })
        .build();

      const calibratedChallengeRepository = { findActiveFlashCompatible: sinon.stub() };

      const versionApiStub = {
        getById: sinon.stub().resolves(version),
      };

      // when
      await catchErr(simulateFlashAssessmentScenario)({
        locale,
        accessibilityAdjustmentNeeded,
        complementaryCertificationKey: undefined,
        calibratedChallengeRepository,
        versionApi: versionApiStub,
      });

      // then
      expect(calibratedChallengeRepository.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
        locale,
        version,
      });
    });
  });
});
