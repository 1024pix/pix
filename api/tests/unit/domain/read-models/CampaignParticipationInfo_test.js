import { expect } from '../../../test-helper';
import CampaignParticipationInfo from '../../../../lib/domain/read-models/CampaignParticipationInfo';
import { ObjectValidationError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Read-models | CampaignParticipationInfo', function () {
  describe('#constructor', function () {
    let validArguments;
    beforeEach(function () {
      validArguments = {
        participantFirstName: 'Mariah',
        participantLastName: 'Carey',
        participantExternalId: 'Christmas1990',
        studentNumber: 'SuperEtudiant',
        userId: 123,
        campaignParticipationId: 999,
        isCompleted: true,
        createdAt: new Date('2019-04-01'),
        sharedAt: new Date('2019-05-01'),
        masteryPercentage: 1,
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new CampaignParticipationInfo(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when participantFirstName is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantFirstName: 123456 })).to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantFirstName: undefined })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when participantFirstname is empty', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantFirstName: '' })).not.to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when participantLastName is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantLastName: 123456 })).to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantLastName: undefined })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when participantLastName is empty', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantLastName: '' })).not.to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when participantExternalId is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantExternalId: 123456 })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when participantExternalId is null or undefined', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantExternalId: null })).not.to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, participantExternalId: undefined })).not.to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when studentNumber is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, studentNumber: 123456 })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when studentNumber is null or undefined', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, studentNumber: null })).not.to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, studentNumber: undefined })).not.to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when userId is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, userId: 'les zouzous' })).to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, userId: undefined })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when isCompleted is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, isCompleted: 'les zouzous' })).to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, isCompleted: undefined })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when createdAt is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, createdAt: 'coucou' })).to.throw(
        ObjectValidationError
      );
      expect(() => new CampaignParticipationInfo({ ...validArguments, createdAt: undefined })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when sharedAt is not valid', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, sharedAt: 'coucou' })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when sharedAt is null', function () {
      // when
      expect(() => new CampaignParticipationInfo({ ...validArguments, sharedAt: null })).not.to.throw(
        ObjectValidationError
      );
    });

    describe('masteryRate', function () {
      context('when the masteryRate is null', function () {
        it('should return null for the masteryRate', function () {
          // when
          const campaignParticipationInfo = new CampaignParticipationInfo({ ...validArguments, masteryRate: null });

          // then
          expect(campaignParticipationInfo.masteryRate).to.equal(null);
        });
      });

      context('when the masteryRate is undefined', function () {
        it('should return null for the masteryRate', function () {
          // when
          const campaignParticipationInfo = new CampaignParticipationInfo({
            ...validArguments,
            masteryRate: undefined,
          });

          // then
          expect(campaignParticipationInfo.masteryRate).to.equal(null);
        });
      });

      context('when the masteryRate equals to 0', function () {
        it('should return 0 for the masteryRate', function () {
          // when
          const campaignParticipationInfo = new CampaignParticipationInfo({
            ...validArguments,
            masteryRate: 0,
          });

          // then
          expect(campaignParticipationInfo.masteryRate).to.equal(0);
        });
      });

      context('when the masteryRate is a string', function () {
        it('should return the number for the masteryRate', function () {
          // when
          const campaignParticipationInfo = new CampaignParticipationInfo({
            ...validArguments,
            masteryRate: '0.75',
          });

          // then
          expect(campaignParticipationInfo.masteryRate).to.equal(0.75);
        });
      });
    });
  });

  describe('#get isShared()', function () {
    let validArguments;

    beforeEach(function () {
      validArguments = {
        participantFirstName: 'Mariah',
        participantLastName: 'Carey',
        participantExternalId: 'Christmas1990',
        userId: 123,
        campaignParticipationId: 999,
        isCompleted: true,
        createdAt: new Date('2019-04-01'),
        masteryPercentage: 1,
      };
    });

    it('should return true', function () {
      // given
      const campaignParticipationInfo = new CampaignParticipationInfo({
        ...validArguments,
        sharedAt: new Date('2020-01-01'),
      });

      // when / then
      expect(campaignParticipationInfo.isShared).to.be.true;
    });

    it('should return false', function () {
      // given
      const campaignParticipationInfo = new CampaignParticipationInfo({
        ...validArguments,
        sharedAt: null,
      });

      // when / then
      expect(campaignParticipationInfo.isShared).to.be.false;
    });
  });
});
