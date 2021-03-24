const { expect } = require('../../../test-helper');
const CampaignProfile = require('../../../../lib/domain/read-models/CampaignProfile');

describe('Unit | Domain | Read-Models | CampaignProfile', function() {
  describe('#pixScore', function() {
    context('when the campaign participation is shared', function() {
      it('compute the total pix score certification profile', function() {
        const params = { isShared: true };
        const placementProfile = { getPixScore: () => 8 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.pixScore).to.equal(8);
      });
    });

    context('when the campaign participation is not shared', function() {
      it('does not compute the pix score', function() {
        const params = { isShared: false };
        const placementProfile = { getPixScore: () => 2 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.pixScore).to.equal(null);
      });
    });
  });

  describe('#isCertifiable', function() {
    describe('when the  campaign participation is shared', function() {
      it('compute the number of certifiable competence', function() {
        const params = { isShared: true };
        const placementProfile = { isCertifiable: () => true };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.isCertifiable).to.equal(true);
      });
    });
    describe('when the campaign participation is not Shared', function() {
      it('does not give information about certification status', function() {
        const params = { isShared: false };
        const placementProfile = { isCertifiable: () => true };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.isCertifiable).to.equal(null);
      });
    });
  });

  describe('#certifiableCompetencesCount', function() {
    context('when the campaign participation is shared', function() {
      it('compute the number of certifiable competence', function() {
        const params = { isShared: true };
        const placementProfile = { getCertifiableCompetencesCount: () => 2 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.certifiableCompetencesCount).to.equal(2);
      });
    });

    context('when the campaign participation is not shared', function() {
      it('does not compute the number of certifiable competences', function() {
        const params = { isShared: false };
        const placementProfile = { getCertifiableCompetencesCount: () => 2 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.certifiableCompetencesCount).to.equal(null);
      });
    });
  });

  describe('#competencesCount', function() {
    context('when the campaign participation is shared', function() {
      it('compute the number of competence', function() {
        const params = { isShared: true };
        const placementProfile = { getCompetencesCount: () => 3 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.competencesCount).to.equal(3);
      });
    });

    context('when the campaign participation is not shared', function() {
      it('does not compute the number of competence', function() {
        const params = { isShared: false };
        const placementProfile = { getCompetencesCount: () => 2 };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.competencesCount).to.equal(null);
      });
    });
  });

  describe('#competences', function() {
    context('when the campaign participation is shared', function() {
      it('returns user competences', function() {
        const params = { isShared: true };
        const competence = {
          id: 1,
          name: 'competence1',
          pixScore: 1,
          estimatedLevel: 1,
          area: { color: 'blue' },
          index: '1.1',
        };
        const placementProfile = { userCompetences: [competence] };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.competences).to.deep.equal([{
          id: 1,
          name: 'competence1',
          pixScore: 1,
          estimatedLevel: 1,
          areaColor: 'blue',
          index: '1.1',
        }]);
      });
    });

    context('when the campaign participation is not shared', function() {
      it('does not compute the number of competence', function() {
        const params = { isShared: false };
        const placementProfile = { userCompetences: [{ name: 'competence1' }] };

        const campaignProfile = new CampaignProfile({ ...params, placementProfile });

        expect(campaignProfile.competences).to.be.empty;
      });
    });
  });

  describe('#firstName', function() {
    it('returns the user first name', function() {
      const params = { firstName: 'John' };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.firstName).to.equal('John');
    });
  });

  describe('#lastName', function() {
    it('returns the user last name', function() {
      const params = { lastName: 'Wick' };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.lastName).to.equal('Wick');
    });
  });

  describe('#campaignParticipationId', function() {
    it('returns the campaignParticipationId', function() {
      const params = { campaignParticipationId: 12 };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.campaignParticipationId).to.equal(12);
    });
  });

  describe('#campaignId', function() {
    it('returns the campaignId', function() {
      const params = { campaignId: 11 };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.campaignId).to.equal(11);
    });
  });

  describe('#externalId', function() {
    it('returns the externalId', function() {
      const params = { participantExternalId: 'BabaYaga' };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.externalId).to.equal('BabaYaga');
    });
  });

  describe('#sharedAt', function() {
    it('returns the sharing date', function() {
      const params = { sharedAt: new Date('2020-01-01') };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.sharedAt).to.deep.equal(new Date('2020-01-01'));
    });
  });

  describe('#createdAt', function() {
    it('returns the creation date', function() {
      const params = { createdAt: new Date('2020-01-02') };

      const campaignProfile = new CampaignProfile(params);

      expect(campaignProfile.createdAt).to.deep.equal(new Date('2020-01-02'));
    });
  });
});
