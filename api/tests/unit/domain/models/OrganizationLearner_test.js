import { expect, domainBuilder } from '../../../test-helper.js';
import { OrganizationLearner, PlacementProfile } from '../../../../lib/domain/models/index.js';
import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from '../../../../lib/domain/constants.js';
import range from 'lodash/range.js';

describe('Unit | Domain | Models | OrganizationLearner', function () {
  describe('#updateCertificability', function () {
    it('should update certificability', function () {
      // given
      const certifiableDate = new Date('2023-01-01');
      const organizationLearner = new OrganizationLearner({ isCertifiable: false });
      const userCompetences = range(MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY).map(() =>
        domainBuilder.buildUserCompetence({ estimatedLevel: 1 }),
      );
      const placementProfile = new PlacementProfile({
        userId: organizationLearner.userId,
        profileDate: certifiableDate,
        userCompetences,
      });

      // when
      organizationLearner.updateCertificability(placementProfile);

      //then
      expect(organizationLearner.isCertifiable).to.be.true;
      expect(new Date(organizationLearner.certifiableAt)).to.deep.equal(placementProfile.profileDate);
    });

    it('should not update certifiableAt if not certifiable', function () {
      // given
      const profileDate = new Date('2023-01-01');
      const organizationLearner = new OrganizationLearner({ isCertifiable: false });
      const placementProfile = new PlacementProfile({
        userId: organizationLearner.userId,
        profileDate: profileDate,
        userCompetences: [],
      });

      // when
      organizationLearner.updateCertificability(placementProfile);

      //then
      expect(organizationLearner.isCertifiable).to.be.false;
      expect(organizationLearner.certifiableAt).to.be.null;
    });
  });
});
