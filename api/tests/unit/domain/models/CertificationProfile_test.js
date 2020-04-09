const { expect } = require('../../../test-helper');
const CertificationProfile = require('../../../../lib/domain/models/CertificationProfile');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Unit | Domain | Models | CertificationProfile', () => {

  describe('#constructor', () => {

    it('should construct a model CertificationProfile from attributes', () => {
      // given
      const certificationProfileRawData = {
        profileDate: new Date('2018-01-01T00:00:00Z'),
        userId: 1,
        userCompetences: [ new UserCompetence({
          id: 1,
          index: '1',
          name: 'UCName',
          area: 'area',
          pixScore: 10,
          estimatedLevel: 5,
        })],
        challengeIdsCorrectlyAnswered: ['challengeId'],
      };

      // when
      const actualCertificationProfile = new CertificationProfile(certificationProfileRawData);

      // then
      expect(actualCertificationProfile).to.be.an.instanceof(CertificationProfile);
      expect(actualCertificationProfile).to.deep.equal(certificationProfileRawData);
    });
  });

  describe('#isCertifiable', () => {

    it('should return false when the certification profile is not certifiable', () => {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 5 });
      const certificationProfile = new CertificationProfile({ userCompetences: [userCompetence] });

      // when
      const result = certificationProfile.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return true when the certification profile is certifiable', () => {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 5 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 1 });
      const userCompetence3 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence4 = new UserCompetence({ estimatedLevel: 3 });
      const userCompetence5 = new UserCompetence({ estimatedLevel: 1 });
      const certificationProfile = new CertificationProfile({
        userCompetences: [userCompetence1, userCompetence2, userCompetence3, userCompetence4, userCompetence5],
      });

      // when
      const result = certificationProfile.isCertifiable();

      // then
      expect(result).to.be.true;
    });

  });

  describe('#getCertifiableCompetencesCount', () => {

    it('should return 5', () => {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 5 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 1 });
      const userCompetence3 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence4 = new UserCompetence({ estimatedLevel: 3 });
      const userCompetence5 = new UserCompetence({ estimatedLevel: 1 });
      const certificationProfile = new CertificationProfile({
        userCompetences: [userCompetence1, userCompetence2, userCompetence3, userCompetence4, userCompetence5],
      });

      // when
      const certifiableCompetencesCount = certificationProfile.getCertifiableCompetencesCount();

      // then
      expect(certifiableCompetencesCount).to.equal(5);
    });

    it('should return 1', () => {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 0 });
      const certificationProfile = new CertificationProfile({
        userCompetences: [userCompetence1, userCompetence2 ],
      });

      // when
      const certifiableCompetencesCount = certificationProfile.getCertifiableCompetencesCount();

      // then
      expect(certifiableCompetencesCount).to.equal(1);
    });
  });

});
