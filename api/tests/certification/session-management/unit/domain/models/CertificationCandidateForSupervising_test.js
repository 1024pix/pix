import dayjs from 'dayjs';

import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

const START_DATETIME_STUB = new Date('2022-10-01T13:00:00Z');
const COMPLEMENTARY_EXTRATIME_STUB = 45;

describe('Unit | Domain | Models | Certification Candidate for supervising', function () {
  context('when the user is authorized to start', function () {
    it('should update authorizeToStart property to true', function () {
      // given
      const certificationCandidateForSupervising = domainBuilder.buildCertificationCandidateForSupervising({
        authorizedToStart: false,
      });

      // when
      certificationCandidateForSupervising.authorizeToStart();

      // then
      expect(certificationCandidateForSupervising.authorizedToStart).to.be.true;
    });
  });

  context('when the session has not started yet', function () {
    it('should not compute a theorical end datetime', async function () {
      // given
      const certificationCandidateNotStarted = domainBuilder.buildCertificationCandidateForSupervising({
        startDateTime: null,
      });

      // when, then
      expect(certificationCandidateNotStarted.startDateTime).to.be.null;
      expect(certificationCandidateNotStarted.theoricalEndDateTime).to.be.undefined;
    });
  });

  context('when the candidate has no complementary certifications', function () {
    context('when the session has started', function () {
      it('should compute a theorical end datetime', async function () {
        // given
        const certificationCandidateWithNoComplementaryCertification =
          domainBuilder.buildCertificationCandidateForSupervising({
            complementaryCertification: undefined,
            complementaryCertificationKey: undefined,
            isComplementaryCertificationInProgress: false,
            startDateTime: START_DATETIME_STUB,
          });

        // then
        expect(certificationCandidateWithNoComplementaryCertification.startDateTime).to.deep.equal(START_DATETIME_STUB);
        expect(certificationCandidateWithNoComplementaryCertification.theoricalEndDateTime).to.deep.equal(
          _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [DEFAULT_SESSION_DURATION_MINUTES]),
        );
      });
    });
  });

  context('when the candidate has complementary certifications', function () {
    context('when some candidates are still eligible to complementary certifications', function () {
      it("should return the session with the candidates' eligibility", async function () {
        // given
        const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
          key: 'aKey',
          label: 'une certif complémentaire',
          certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
        });

        // when
        const candidate = domainBuilder.buildCertificationCandidateForSupervising({
          userId: 1234,
          startDateTime: START_DATETIME_STUB,
          enrolledComplementaryCertification: complementaryCertification,
          isComplementaryCertificationInProgress: true,
        });

        // then
        expect(candidate).to.deep.equal(
          domainBuilder.buildCertificationCandidateForSupervising({
            userId: 1234,
            startDateTime: START_DATETIME_STUB,
            theoricalEndDateTime: _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
              DEFAULT_SESSION_DURATION_MINUTES,
              COMPLEMENTARY_EXTRATIME_STUB,
            ]),
            enrolledComplementaryCertification: complementaryCertification,
            isComplementaryCertificationInProgress: true,
          }),
        );
      });
    });

    context('when some candidates are not eligible to complementary certifications', function () {
      it("should return the session with the candidates' non eligibility", async function () {
        // given
        const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising();

        // when
        const candidate = domainBuilder.buildCertificationCandidateForSupervising({
          userId: 1234,
          startDateTime: START_DATETIME_STUB,
          enrolledComplementaryCertification: complementaryCertification,
          isComplementaryCertificationInProgress: false,
        });

        // then
        expect(candidate).to.deep.equal(
          domainBuilder.buildCertificationCandidateForSupervising({
            userId: 1234,
            startDateTime: START_DATETIME_STUB,
            theoricalEndDateTime: _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
              DEFAULT_SESSION_DURATION_MINUTES,
            ]),
            enrolledComplementaryCertification: complementaryCertification,
            stillValidBadgeAcquisitions: [],
          }),
        );
      });
    });
  });
});

const _expectedSessionEndDateTimeFromStartDateTime = (startDateTime, extraMinutes = []) => {
  let computedEndDateTime = dayjs(startDateTime);
  extraMinutes.forEach((plusMinutes) => {
    computedEndDateTime = computedEndDateTime.add(plusMinutes, 'minute');
  });
  return computedEndDateTime.toDate();
};
