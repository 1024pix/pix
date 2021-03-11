const { domainBuilder, expect, sinon } = require('../../../../test-helper');

const CampaignProfileCollectionResultLine = require('../../../../../lib/infrastructure/exports/campaigns/campaign-profile-collection-result-line');
const PlacementProfile = require('../../../../../lib/domain/models/PlacementProfile');
const { getI18n } = require('../../../../tooling/i18n/i18n');

describe('Unit | Serializer | CSV | campaign-profile-collection-result-line', () => {
  describe('#toCsvLine', () => {
    let organization, campaign, competences;

    const translate = getI18n().__;

    const placementProfile = new PlacementProfile({
      userId: 123,
      userCompetences: [{
        id: 'recCompetence1',
        pixScore: 9,
        estimatedLevel: 1,
      }, {
        id: 'recCompetence2',
        pixScore: 4,
        estimatedLevel: 0,
      }],
    });

    beforeEach(() => {
      const listSkills1 = domainBuilder.buildSkillCollection({ name: '@web', minLevel: 1, maxLevel: 5 });
      const listSkills2 = domainBuilder.buildSkillCollection({ name: '@url', minLevel: 1, maxLevel: 2 });

      organization = {};
      campaign = {};

      competences = [
        {
          id: 'recCompetence1',
          name: 'Competence1',
          skillIds: listSkills1.map((skill) => skill.id),
        },
        {
          id: 'recCompetence2',
          name: 'Competence2',
          skillIds: listSkills2.map((skill) => skill.id),
        },
      ];
    });

    context('when user share his result', () => {
      it('should return the complete line with 0 certifiable competence and non certifiable', async () => {
        //given
        sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
        sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

        campaign.id = 123;
        campaign.name = 'test';
        organization.name = 'Umbrella';

        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          userId: 123,
          participantFirstName: 'Juan',
          participantLastName: 'Carlitos',
        };

        const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

        //when
        const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

        //then
        expect(line.toCsvLine()).to.equal(csvExcpectedLine);
      });

      it('should return the complete line with 5 certifiable competence', async () => {
        //given
        sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
        sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

        campaign.id = 123;
        campaign.name = 'test';
        organization.name = 'Umbrella';

        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          userId: 123,
          participantFirstName: 'Juan',
          participantLastName: 'Carlitos',
        };

        const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Oui";' +
        '5;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

        //when
        const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

        //then
        expect(line.toCsvLine()).to.equal(csvExcpectedLine);
      });
    });

    context('when user has not share his result yet', () => {
      it('should return the complete line with 5 certifiable competences', async () => {
        //given
        sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
        sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

        campaign.id = 123;
        campaign.name = 'test';
        organization.name = 'Umbrella';

        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '-Mon mail pro',
          userId: 123,
          participantFirstName: 'Juan',
          participantLastName: 'Carlitos',
        };

        const csvExcpectedLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.name}";` +
          `"${campaignParticipationResultData.participantLastName}";` +
          `"${campaignParticipationResultData.participantFirstName}";` +
          '"Non";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA"' +
          '\n';

        //when
        const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

        //then
        expect(line.toCsvLine()).to.equal(csvExcpectedLine);
      });
    });

    context('When campaign has an idPixLabel', () => {
      beforeEach(() => {
        campaign.idPixLabel = 'Mail Pro';
      });

      it('should return the line with a participant external id', () => {
        //given
        sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
        sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

        campaign.id = 123;
        campaign.name = 'test';
        organization.name = 'Umbrella';

        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: 'mailpro@pro.net',
          userId: 123,
          participantFirstName: 'Juan',
          participantLastName: 'Carlitos',
        };

        const csvExcpectedLine = `"${organization.name}";` +
       `${campaign.id};` +
       `"${campaign.name}";` +
       `"${campaignParticipationResultData.participantLastName}";` +
       `"${campaignParticipationResultData.participantFirstName}";` +
       `"${campaignParticipationResultData.participantExternalId}";` +
       '"Non";' +
       '"NA";' +
       '"NA";' +
       '"NA";' +
       '"NA";' +
       '"NA";' +
       '"NA";' +
       '"NA";' +
       '"NA"' +
       '\n';

        //when
        const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

        //then
        expect(line.toCsvLine()).to.equal(csvExcpectedLine);
      });
    });

    context('When organization is PRO', () => {
      beforeEach(() => {
        organization.isPro = true;
        organization.isManagingStudents = false;
      });

      it('should return the csv without student number or division information', () => {
        //given
        sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
        sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

        campaign.id = 123;
        campaign.name = 'test';
        organization.name = 'Umbrella';

        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          userId: 123,
          participantFirstName: 'Juan',
          participantLastName: 'Carlitos',
          division: '5me',
          studentNumber: 'studentNumber',
        };

        const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

        //when
        const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

        //then
        expect(line.toCsvLine()).to.equal(csvExcpectedLine);
      });
    });

    context('When organization is SCO and managing students', () => {
      beforeEach(() => {
        organization.isSco = true;
        organization.isManagingStudents = true;
      });

      context('when the participant does not have a division', () => {
        it('should return the csv with empty division', () => {
          //given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

          campaign.id = 123;
          campaign.name = 'test';
          organization.name = 'Umbrella';

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: 'Juan',
            participantLastName: 'Carlitos',
            division: null,
          };

          const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        '"";' +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

          //when
          const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

          //then
          expect(line.toCsvLine()).to.equal(csvExcpectedLine);
        });
      });

      context('when the participant has a division', () => {
        it('should return the csv with division information', () => {
          //given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

          campaign.id = 123;
          campaign.name = 'test';
          organization.name = 'Umbrella';

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: 'Juan',
            participantLastName: 'Carlitos',
            division: '3eme',
          };

          const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        `"${campaignParticipationResultData.division}";` +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

          //when
          const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

          //then
          expect(line.toCsvLine()).to.equal(csvExcpectedLine);
        });
      });
    });

    context('When organization is SCO and not managing students', () => {
      beforeEach(() => {
        organization.isSco = true;
        organization.isManagingStudents = false;

        context('when the participant has a division', () => {
          it('should return the line without division information', async () => {
            //given
            sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
            sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

            campaign.id = 123;
            campaign.name = 'test';
            organization.name = 'Umbrella';

            const campaignParticipationResultData = {
              id: 1,
              isShared: false,
              isCompleted: true,
              createdAt: new Date('2019-02-25T10:00:00Z'),
              sharedAt: new Date('2019-03-01T23:04:05Z'),
              participantExternalId: '-Mon mail pro',
              userId: 123,
              participantFirstName: 'Juan',
              participantLastName: 'Carlitos',
              division: '3eme',
            };

            const csvExcpectedLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.name}";` +
          `"${campaignParticipationResultData.participantLastName}";` +
          `"${campaignParticipationResultData.participantFirstName}";` +
          '"Non";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA"' +
          '\n';

            //when
            const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

            //then
            expect(line.toCsvLine()).to.equal(csvExcpectedLine);
          });
        });
      });
    });

    context('When organization is SUP and managing students', () => {
      beforeEach(() => {
        organization.isSup = true;
        organization.isManagingStudents = true;
      });

      context('when the participant does not have a student number', () => {
        it('should return the csv with empty student number', () => {
          //given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

          campaign.id = 123;
          campaign.name = 'test';
          organization.name = 'Umbrella';

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: 'Juan',
            participantLastName: 'Carlitos',
            studentNumber: null,
          };

          const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        '"";' +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

          //when
          const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

          //then
          expect(line.toCsvLine()).to.equal(csvExcpectedLine);
        });
      });

      context('when the participant has a student number', () => {
        it('should return the csv with student number information', () => {
          //given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(0);

          campaign.id = 123;
          campaign.name = 'test';
          organization.name = 'Umbrella';

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: 'Juan',
            participantLastName: 'Carlitos',
            studentNumber: 'HELLO123',
          };

          const csvExcpectedLine = `"${organization.name}";` +
        `${campaign.id};` +
        `"${campaign.name}";` +
        `"${campaignParticipationResultData.participantLastName}";` +
        `"${campaignParticipationResultData.participantFirstName}";` +
        `"${campaignParticipationResultData.studentNumber}";` +
        '"Oui";' +
        '2019-03-01;' +
        '13;' +
        '"Non";' +
        '0;' +
        '1;' +
        '9;' +
        '0;' +
        '4' +
        '\n';

          //when
          const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

          //then
          expect(line.toCsvLine()).to.equal(csvExcpectedLine);
        });
      });
    });

    context('When organization is SUP and not managing students', () => {
      beforeEach(() => {
        organization.isSup = true;
        organization.isManagingStudents = false;

        context('when the participant has a student number', () => {
          it('should return the line without student number information', async () => {
            //given
            sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
            sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

            campaign.id = 123;
            campaign.name = 'test';
            organization.name = 'Umbrella';

            const campaignParticipationResultData = {
              id: 1,
              isShared: false,
              isCompleted: true,
              createdAt: new Date('2019-02-25T10:00:00Z'),
              sharedAt: new Date('2019-03-01T23:04:05Z'),
              participantExternalId: '-Mon mail pro',
              userId: 123,
              participantFirstName: 'Juan',
              participantLastName: 'Carlitos',
              studentNumber: 'goodBoï',
            };

            const csvExcpectedLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.name}";` +
          `"${campaignParticipationResultData.participantLastName}";` +
          `"${campaignParticipationResultData.participantFirstName}";` +
          '"Non";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA"' +
          '\n';

            //when
            const line = new CampaignProfileCollectionResultLine(campaign, organization, campaignParticipationResultData, competences, placementProfile, translate);

            //then
            expect(line.toCsvLine()).to.equal(csvExcpectedLine);
          });
        });
      });
    });
  });
});

