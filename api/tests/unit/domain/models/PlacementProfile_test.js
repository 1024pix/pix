import { expect, domainBuilder } from '../../../test-helper';
import PlacementProfile from '../../../../lib/domain/models/PlacementProfile';
import UserCompetence from '../../../../lib/domain/models/UserCompetence';

describe('Unit | Domain | Models | PlacementProfile', function () {
  describe('#constructor', function () {
    it('should construct a model PlacementProfile from attributes', function () {
      // given
      const placementProfileRawData = {
        profileDate: new Date('2018-01-01T00:00:00Z'),
        userId: 1,
        userCompetences: [
          new UserCompetence({
            id: 1,
            index: '1',
            name: 'UCName',
            areaId: 'area',
            pixScore: 10,
            estimatedLevel: 5,
          }),
        ],
      };

      // when
      const actualPlacementProfile = new PlacementProfile(placementProfileRawData);

      // then
      expect(actualPlacementProfile).to.be.an.instanceof(PlacementProfile);
      expect(actualPlacementProfile).to.deep.equal(placementProfileRawData);
    });
  });

  describe('#isCertifiable', function () {
    it('should return false when the certification profile is not certifiable', function () {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 5 });
      const placementProfile = new PlacementProfile({ userCompetences: [userCompetence] });

      // when
      const result = placementProfile.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return true when the certification profile is certifiable', function () {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 5 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 1 });
      const userCompetence3 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence4 = new UserCompetence({ estimatedLevel: 3 });
      const userCompetence5 = new UserCompetence({ estimatedLevel: 1 });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2, userCompetence3, userCompetence4, userCompetence5],
      });

      // when
      const result = placementProfile.isCertifiable();

      // then
      expect(result).to.be.true;
    });
  });

  describe('#getCertifiableCompetencesCount', function () {
    it('should return 5', function () {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 5 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 1 });
      const userCompetence3 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence4 = new UserCompetence({ estimatedLevel: 3 });
      const userCompetence5 = new UserCompetence({ estimatedLevel: 1 });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2, userCompetence3, userCompetence4, userCompetence5],
      });

      // when
      const certifiableCompetencesCount = placementProfile.getCertifiableCompetencesCount();

      // then
      expect(certifiableCompetencesCount).to.equal(5);
    });

    it('should return 1', function () {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 0 });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2],
      });

      // when
      const certifiableCompetencesCount = placementProfile.getCertifiableCompetencesCount();

      // then
      expect(certifiableCompetencesCount).to.equal(1);
    });
  });

  describe('#getCompetencesCount', function () {
    it('returns the number of competence', function () {
      const userCompetence1 = new UserCompetence();
      const userCompetence2 = new UserCompetence();
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2],
      });

      const competencesCount = placementProfile.getCompetencesCount();

      expect(competencesCount).to.equal(2);
    });
  });

  describe('#getPixScore', function () {
    it('returns the pixScore', function () {
      const userCompetence1 = new UserCompetence({ pixScore: 12 });
      const userCompetence2 = new UserCompetence({ pixScore: 8 });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2],
      });

      const pixScore = placementProfile.getPixScore();

      expect(pixScore).to.equal(20);
    });
  });

  describe('#getUserCompetence', function () {
    it('returns the userCompetence if exists', function () {
      const userCompetence1 = new UserCompetence({ id: 'rec123' });
      const userCompetence2 = new UserCompetence({ id: 'rec456' });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2],
      });

      const userCompetence = placementProfile.getUserCompetence('rec123');

      expect(userCompetence).to.deep.equal(userCompetence1);
    });

    it("returns null if doesn't exist", function () {
      const userCompetence1 = new UserCompetence({ id: 'rec123' });
      const userCompetence2 = new UserCompetence({ id: 'rec456' });
      const placementProfile = new PlacementProfile({
        userCompetences: [userCompetence1, userCompetence2],
      });

      const userCompetence = placementProfile.getUserCompetence('wrongId');

      expect(userCompetence).to.be.null;
    });
  });

  describe('#getCertifiableUserCompetences', function () {
    it('filters certifiable user competences', function () {
      const uc1 = domainBuilder.buildUserCompetence({ estimatedLevel: 1 });
      const uc2 = domainBuilder.buildUserCompetence({ estimatedLevel: 0 });
      const uc3 = domainBuilder.buildUserCompetence({ estimatedLevel: 1 });
      const uc4 = domainBuilder.buildUserCompetence({ estimatedLevel: 0 });
      const placementProfile = domainBuilder.buildPlacementProfile({
        userCompetences: [uc1, uc2, uc3, uc4],
      });

      const result = placementProfile.getCertifiableUserCompetences();

      expect(result).to.deep.equal([uc1, uc3]);
    });
  });
});
