import sinon from 'sinon';

import { getSessionForSupervising } from '../../../../../../src/certification/session-management/domain/usecases/get-session-for-supervising.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-session-for-supervising', function () {
  let sessionForSupervisingRepository, certificationBadgesService, dependencies;

  beforeEach(function () {
    sessionForSupervisingRepository = {
      get: sinon.stub(),
    };
    certificationBadgesService = {
      findStillValidBadgeAcquisitions: sinon.stub(),
    };

    dependencies = {
      certificationBadgesService,
      sessionForSupervisingRepository,
    };
  });

  context('when no candidates are subscribed to CLEA', function () {
    it('returns the session for supervising', async function () {
      // given
      const sessionId = 1;
      const certificationCandidateId = 51;
      const certificationCandidateWithNoComplementaryCertification =
        domainBuilder.buildCertificationCandidateForSupervising({
          id: certificationCandidateId,
          subscription: Frameworks.CORE,
          assessmentDuration: 60,
          startDateTime: new Date('2021-01-01T14:00:00Z'),
          stillValidBadgeAcquisitions: [],
        });

      const session = domainBuilder.buildSessionForSupervising({
        sessionId,
        certificationCandidates: [certificationCandidateWithNoComplementaryCertification],
      });
      sessionForSupervisingRepository.get.withArgs({ id: sessionId }).resolves(session);

      // when
      const actualSessionForSupervising = await getSessionForSupervising({
        sessionId,
        ...dependencies,
      });

      // then
      expect(actualSessionForSupervising).to.deepEqualInstance(session);
      expect(
        actualSessionForSupervising.certificationCandidates.map(
          ({ stillValidBadgeAcquisitions }) => stillValidBadgeAcquisitions,
        ),
      ).to.deepEqualArray([[]]);
      expect(certificationBadgesService.findStillValidBadgeAcquisitions).to.not.have.been.called;
    });
  });

  context('when candidates are registered to CLEA (double certification)', function () {
    context('when candidate is still eligible', function () {
      it("returns the session with the candidate's eligibility and badge acquisitions fetched", async function () {
        // given
        const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
          complementaryCertificationKey: Frameworks.CLEA,
        });

        const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
          id: 1,
          certificationCandidates: [
            domainBuilder.buildCertificationCandidateForSupervising({
              userId: 1234,
              assessmentDuration: 60,
              startDateTime: new Date('2021-01-01T14:00:00Z'),
              subscription: Frameworks.CLEA,
              stillValidBadgeAcquisitions: [],
            }),
          ],
        });

        sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(retrievedSessionForSupervising);
        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId: 1234 })
          .resolves([stillValidBadgeAcquisition]);

        // when
        const actualSession = await getSessionForSupervising({
          sessionId: 1,
          ...dependencies,
        });

        // then
        expect(actualSession.certificationCandidates[0].isStillEligibleToDoubleCertification).to.be.true;
      });
    });

    context('when candidate is not eligible', function () {
      it("returns the session with the candidate's non eligibility", async function () {
        // given
        const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
          id: 1,
          certificationCandidates: [
            domainBuilder.buildCertificationCandidateForSupervising({
              userId: 1234,
              assessmentDuration: 60,
              startDateTime: new Date('2021-01-01T14:00:00Z'),
              subscription: Frameworks.CLEA,
              stillValidBadgeAcquisitions: [],
            }),
          ],
        });

        sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(retrievedSessionForSupervising);
        certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

        // when
        const actualSession = await getSessionForSupervising({
          sessionId: 1,
          ...dependencies,
        });

        // then
        expect(actualSession.certificationCandidates[0].isStillEligibleToDoubleCertification).to.be.false;
      });
    });
  });
});
