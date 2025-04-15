import _ from 'lodash';

import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { types } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Center', function () {
  context('#isComplementaryAlonePilot', function () {
    it('should return false when center is not complementary alone pilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.false;
    });

    it('should return true when center is complementary alone pilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.true;
    });
  });

  context('#hasBillingMode', function () {
    it('should return false when center is of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(center.hasBillingMode).is.false;
    });

    it('should return true when center is not of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(center.hasBillingMode).is.true;
    });
  });

  context('#get isSco', function () {
    it('should return true when certification center is SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
      });

      // when
      const isSco = center.isSco;

      // then
      expect(isSco).to.be.true;
    });

    it('should return true when center is not SCO', function () {
      // given
      let notScoCenters = Object.values(CERTIFICATION_CENTER_TYPES).map((type) => {
        if (type !== CERTIFICATION_CENTER_TYPES.SCO)
          return domainBuilder.certification.enrolment.buildCenter({
            type: type,
          });
        return null;
      });
      notScoCenters = _.compact(notScoCenters);

      // when
      for (const notScoCenter of notScoCenters) {
        const isSco = notScoCenter.isSco;
        expect(
          isSco,
          `Certification center of type ${notScoCenter.certificationCenterType} should return isSco as false`,
        ).to.be.false;
      }
    });
  });

  context('#isHabilitated', function () {
    it('should return false when the center does not have the habilitation for complementary certification', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: 123,
            key: 'SOME_KEY',
            label: 'some label',
          }),
        ],
      });

      // then
      expect(center.isHabilitated('SOME_OTHER_KEY')).to.be.false;
    });

    it('should return true when the center has the habilitation for complementary certification', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: 123,
            key: 'SOME_KEY',
            label: 'some label',
          }),
        ],
      });

      // then
      expect(center.isHabilitated('SOME_KEY')).to.be.true;
    });
  });

  context('#get matchingOrganizationId', function () {
    it('should return the id when center has a matching organization', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          id: 123,
        }),
      });

      // when
      const matchingOrganizationId = center.matchingOrganizationId;

      // then
      expect(matchingOrganizationId).to.equal(123);
    });

    it('should return null otherwise', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: null,
      });

      // when
      const matchingOrganizationId = center.matchingOrganizationId;

      // then
      expect(matchingOrganizationId).to.be.null;
    });
  });

  context('#get isMatchingOrganizationScoAndManagingStudents', function () {
    it('should return true when center has a matching orga that is sco and managing students', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          type: types.SCO,
          isManagingStudents: true,
        }),
      });

      // when
      const isMatchingOrganizationScoAndManagingStudents = center.isMatchingOrganizationScoAndManagingStudents;

      // then
      expect(isMatchingOrganizationScoAndManagingStudents).to.be.true;
    });

    it('should return false when center has a matching orga that is sco but not managing students', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          type: types.SCO,
          isManagingStudents: false,
        }),
      });

      // when
      const isMatchingOrganizationScoAndManagingStudents = center.isMatchingOrganizationScoAndManagingStudents;

      // then
      expect(isMatchingOrganizationScoAndManagingStudents).to.be.false;
    });

    it('should return false when center has a matching orga that is not sco but managing students', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          type: types.SUP,
          isManagingStudents: true,
        }),
      });

      // when
      const isMatchingOrganizationScoAndManagingStudents = center.isMatchingOrganizationScoAndManagingStudents;

      // then
      expect(isMatchingOrganizationScoAndManagingStudents).to.be.false;
    });

    it('should return false when center has a matching orga that is not sco nor managing students', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          type: types.SUP,
          isManagingStudents: false,
        }),
      });

      // when
      const isMatchingOrganizationScoAndManagingStudents = center.isMatchingOrganizationScoAndManagingStudents;

      // then
      expect(isMatchingOrganizationScoAndManagingStudents).to.be.false;
    });

    it('should return false when center has no matching orga', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        matchingOrganization: null,
      });

      // when
      const isMatchingOrganizationScoAndManagingStudents = center.isMatchingOrganizationScoAndManagingStudents;

      // then
      expect(isMatchingOrganizationScoAndManagingStudents).to.be.false;
    });
  });

  context('#get isCoreComplementaryCompatibilityEnabled', function () {
    it('should return true when center is isComplementaryAlonePilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.true;
    });

    it('should return false when center is not complementary alone pilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        features: [],
      });

      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.false;
    });
  });
});
