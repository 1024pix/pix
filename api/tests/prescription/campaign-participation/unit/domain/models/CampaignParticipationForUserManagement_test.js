import crypto from 'node:crypto';

import sinon from 'sinon';

import { CampaignParticipationForUserManagement } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationForUserManagement.js';

describe('Unit | Domain | Models | CampaignParticipationForUserManagement', function () {
  beforeEach(function () {
    sinon.stub(crypto, 'randomUUID').returns(1234);
  });

  describe('#constructor', function () {
    it('should not return campaign participation informations when campaignParticipationId is missing', function () {
      // given
      const campaignParticipation = new CampaignParticipationForUserManagement({
        campaignParticipationId: null,
        participantExternalId: 'externalId',
        status: 'TOTO',
        campaignId: 3,
        campaignCode: 'AZERTY',
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        deletedAt: new Date('2023-01-01'),
        organizationLearnerFirstName: 'Jean',
        organizationLearnerLastName: 'Meuh',
      });

      // then
      expect(campaignParticipation.id).to.be.deep.equals(1234);
      expect(campaignParticipation.createdAt).to.be.deep.equals(new Date('2020-01-01'));
      expect(campaignParticipation.deletedAt).to.be.deep.equals(new Date('2022-01-01'));
      expect(campaignParticipation.organizationLearnerFullName).to.be.equals('-');

      expect(campaignParticipation.campaignParticipationId).to.be.null;
      expect(campaignParticipation.participantExternalId).to.be.null;
      expect(campaignParticipation.status).to.be.null;
      expect(campaignParticipation.campaignId).to.be.null;
      expect(campaignParticipation.campaignCode).to.be.null;
      expect(campaignParticipation.sharedAt).to.be.null;
      expect(campaignParticipation.status).to.be.null;
    });

    it('should campaign participation informations when campaignParticipationId existing', function () {
      // given
      const campaignParticipation = new CampaignParticipationForUserManagement({
        id: 1,
        campaignParticipationId: 18,
        participantExternalId: 'externalId',
        status: 'TOTO',
        campaignId: 3,
        campaignCode: 'AZERTY',
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        deletedAt: new Date('2023-01-01'),
        organizationLearnerFirstName: 'Jean',
        organizationLearnerLastName: 'Meuh',
      });

      // thenid: 1,
      expect(campaignParticipation.campaignParticipationId).to.be.equals(18);
      expect(campaignParticipation.participantExternalId).to.be.equals('externalId');
      expect(campaignParticipation.status).to.be.equals('TOTO');
      expect(campaignParticipation.campaignId).to.be.equals(3);
      expect(campaignParticipation.campaignCode).to.be.equals('AZERTY');
      expect(campaignParticipation.createdAt).to.be.deep.equals(new Date('2020-01-01'));
      expect(campaignParticipation.sharedAt).to.be.deep.equals(new Date('2022-01-01'));
      expect(campaignParticipation.deletedAt).to.be.deep.equals(new Date('2023-01-01'));
      expect(campaignParticipation.organizationLearnerFullName).to.be.equals('Jean Meuh');
    });
  });

  describe('#setIsFromCombinedCourse', function () {
    it('should set the value to true', function () {
      // given
      const campaignParticipation = new CampaignParticipationForUserManagement({
        campaignParticipationId: null,
        participantExternalId: 'externalId',
        status: 'TOTO',
        campaignId: 3,
        campaignCode: 'AZERTY',
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        deletedAt: new Date('2023-01-01'),
        organizationLearnerFirstName: 'Jean',
        organizationLearnerLastName: 'Meuh',
      });

      // when
      campaignParticipation.setIsFromCombinedCourse(true);

      // then
      expect(campaignParticipation.isFromCombinedCourse).true;
    });
    it('should set the value to false', function () {
      // given
      const campaignParticipation = new CampaignParticipationForUserManagement({
        campaignParticipationId: null,
        participantExternalId: 'externalId',
        status: 'TOTO',
        campaignId: 3,
        campaignCode: 'AZERTY',
        createdAt: new Date('2020-01-01'),
        sharedAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        deletedAt: new Date('2023-01-01'),
        organizationLearnerFirstName: 'Jean',
        organizationLearnerLastName: 'Meuh',
      });

      // when
      campaignParticipation.setIsFromCombinedCourse(false);

      // then
      expect(campaignParticipation.isFromCombinedCourse).false;
    });
  });
});
