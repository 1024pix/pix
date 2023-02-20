import _ from 'lodash';
import { expect, databaseBuilder } from '../../../test-helper';
import scoOrganizationParticipantRepository from '../../../../lib/infrastructure/repositories/sco-organization-participant-repository';
import ScoOrganizationParticipant from '../../../../lib/domain/read-models/ScoOrganizationParticipant';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

describe('Integration | Infrastructure | Repository | sco-organization-participant-repository', function () {
  describe('#findPaginatedFilteredScoParticipants', function () {
    it('should return instances of ScoOrganizationParticipant', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
      });
      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId: organization.id,
      });

      // then
      expect(data[0]).to.be.an.instanceOf(ScoOrganizationParticipant);
    });

    it('should return all the ScoOrganizationParticipants for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId: organization_1.id,
      });

      // then
      expect(_.map(data, 'id')).to.have.members([firstOrganizationLearner.id, secondOrganizationLearner.id]);
    });

    it('should return only once the same sco participant', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'some campaign' }).id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'other campaign' }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId,
      });

      // then
      expect(data).to.have.lengthOf(1);
    });

    it('should return the sco participants not disabled', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: false,
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true, organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId: organization.id,
      });

      // then
      expect(data).to.have.lengthOf(1);
      expect(data[0].id).to.equal(organizationLearner.id);
    });

    it('should order organizationLearners by lastName and then by firstName with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Grenier',
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier',
      });
      const thirdOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur',
      });
      const fourthOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN',
      });

      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId: organization.id,
      });

      // then
      expect(_.map(data, 'id')).to.deep.include.ordered.members([
        thirdOrganizationLearner.id,
        fourthOrganizationLearner.id,
        secondOrganizationLearner.id,
        firstOrganizationLearner.id,
      ]);
    });

    it('should return sco participants with deleted participations', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaignId = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: false,
        organizationId: organization.id,
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, deletedAt: new Date() });

      await databaseBuilder.commit();

      // when
      const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
        organizationId: organization.id,
      });

      // then
      expect(data).to.have.lengthOf(1);
      expect(data[0].id).to.equal(organizationLearnerId);
    });

    describe('When organizationLearner is filtered', function () {
      it('should return sco participants filtered by search', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: 'Dupont',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Baz',
          lastName: 'Dupond',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
          filter: { search: 'b dupon' },
        });

        // then
        expect(_.map(data, 'firstName')).to.include.members(['Bar', 'Baz']);
      });

      it('should return sco participants filtered by division', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '1',
          division: '4A',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '2',
          division: '3B',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '3',
          division: '3A',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
          filter: { divisions: ['3A', '3B'] },
        });

        // then
        expect(_.map(data, 'division')).to.deep.equal(['3B', '3A']);
      });

      describe('When organizationLearner is filtered by user connexion type', function () {
        let organizationId;

        beforeEach(async function () {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;

          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Rambo',
            user: { email: 'john@rambo.com', username: null },
          });
          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Willis',
            user: { email: null, username: 'willy' },
          });
          const organizationLearnerOfUserWithSamlId = databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Norris',
            user: { email: null, username: null },
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: 'chucky',
            userId: organizationLearnerOfUserWithSamlId.userId,
          });
          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Lee',
            user: { email: null, username: null },
          });
          await databaseBuilder.commit();
        });

        it('should return sco participants filtered by "none" user connexion', async function () {
          // when
          const {
            data: [{ lastName }],
          } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
            organizationId,
            filter: { connectionTypes: ['none'] },
          });

          // then
          expect(lastName).to.equal('Lee');
        });

        it('should return sco participants filtered by "identifiant" user connexion', async function () {
          // when
          const {
            data: [{ lastName }],
          } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
            organizationId,
            filter: { connectionTypes: ['identifiant'] },
          });

          // then
          expect(lastName).to.deep.equal('Willis');
        });

        it('should return sco participants filtered by "email" user connexion', async function () {
          // when
          const {
            data: [{ lastName }],
          } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
            organizationId,
            filter: { connectionTypes: ['email'] },
          });

          // then
          expect(lastName).to.deep.equal('Rambo');
        });

        it('should return sco participants filtered by "mediacentre" user connexion', async function () {
          // when
          const {
            data: [{ lastName }],
          } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
            organizationId,
            filter: { connectionTypes: ['mediacentre'] },
          });

          // then
          expect(lastName).to.equal('Norris');
        });
        it('should return sco participants filtered by "none" & "mediacentre" user connexion', async function () {
          // when
          const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
            organizationId,
            filter: { connectionTypes: ['mediacentre', 'none'] },
          });

          // then
          expect(data[0].lastName).to.equal('Lee');
          expect(data[1].lastName).to.equal('Norris');
        });
      });

      it('should return sco participants paginated', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ firstName }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
          page: { number: 2, size: 1 },
        });

        // then
        expect(firstName).to.deep.equal('Bar');
      });

      context('when participants are filterd by certificability', function () {
        context('when one value is given for certificability', function () {
          it('should return sco participants filtered by the given value', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const campaignId = databaseBuilder.factory.buildCampaign({
              organizationId,
              type: CampaignTypes.PROFILES_COLLECTION,
            }).id;
            const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
            const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: organizationLearnerId1,
              status: CampaignParticipationStatuses.SHARED,
              sharedAt: new Date('2022-01-01'),
              isCertifiable: true,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: organizationLearnerId2,
              status: CampaignParticipationStatuses.SHARED,
              sharedAt: new Date('2022-01-01'),
              isCertifiable: false,
            });
            await databaseBuilder.commit();
            const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
              organizationId,
              filter: { certificability: [true] },
            });

            // then
            expect(data.length).to.deep.equal(1);
            expect(data[0].id).to.deep.equal(organizationLearnerId1);
          });
        });

        context('when two values are given', function () {
          it('should return sco participants which match with given values', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const campaignId = databaseBuilder.factory.buildCampaign({
              organizationId,
              type: CampaignTypes.PROFILES_COLLECTION,
            }).id;
            const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
            const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
            const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: organizationLearnerId1,
              status: CampaignParticipationStatuses.SHARED,
              sharedAt: new Date('2022-01-01'),
              isCertifiable: true,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: organizationLearnerId2,
              status: CampaignParticipationStatuses.SHARED,
              sharedAt: new Date('2022-01-01'),
              isCertifiable: false,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              campaignId,
              organizationLearnerId: organizationLearnerId3,
              status: CampaignParticipationStatuses.STARTED,
              sharedAt: null,
              isCertifiable: null,
            });
            await databaseBuilder.commit();
            const { data } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
              organizationId,
              filter: { certificability: [false, null] },
            });

            // then
            const ids = data.map((participants) => participants.id);
            expect(ids.length).to.deep.equal(2);
            expect(ids).to.exactlyContain([organizationLearnerId2, organizationLearnerId3]);
          });
        });
      });
    });

    describe('When sco participant is reconciled and authenticated by email (and/or) username', function () {
      it('should return all sco participant properties including the reconciled user:email,username', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedScoOrganizationParticipant = new ScoOrganizationParticipant({
          id: organizationLearner.id,
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
          username: user.username,
          userId: organizationLearner.userId,
          email: user.email,
          isAuthenticatedFromGAR: false,
          division: organizationLearner.division,
          participationCount: 0,
          lastParticipationDate: null,
          campaignName: null,
          campaignType: null,
          participationStatus: null,
          isCertifiable: null,
          certifiableAt: null,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [firstParticipant],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(firstParticipant).to.deep.equal(expectedScoOrganizationParticipant);
      });
    });

    describe('When sco participant is reconciled and authenticated from GAR', function () {
      it('should return isAuthenticatedFromGAR property equal to true', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser({
          username: null,
          email: null,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'samlId',
          userId: user.id,
        });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedScoOrganizationParticipant = new ScoOrganizationParticipant({
          id: organizationLearner.id,
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
          username: null,
          email: null,
          userId: organizationLearner.userId,
          isAuthenticatedFromGAR: true,
          division: organizationLearner.division,
          participationCount: 0,
          lastParticipationDate: null,
          campaignName: null,
          campaignType: null,
          participationStatus: null,
          isCertifiable: null,
          certifiableAt: null,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [firstParticipant],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(firstParticipant).to.deep.equal(expectedScoOrganizationParticipant);
      });
    });

    describe('When sco participant is not reconciled', function () {
      it('should return empty email, username, userId', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: null,
        });

        const expectedScoOrganizationParticipant = new ScoOrganizationParticipant({
          id: organizationLearner.id,
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          birthdate: organizationLearner.birthdate,
          username: null,
          email: null,
          userId: organizationLearner.userId,
          isAuthenticatedFromGAR: false,
          division: organizationLearner.division,
          participationCount: 0,
          lastParticipationDate: null,
          campaignName: null,
          campaignType: null,
          participationStatus: null,
          isCertifiable: null,
          certifiableAt: null,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [firstParticipant],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(firstParticipant).to.deep.equal(expectedScoOrganizationParticipant);
      });
    });

    context('campaign information', function () {
      it('should return campaign name and type when there is at least a participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'some campaign name',
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
        await databaseBuilder.commit();

        const expectedAttributes = {
          campaignName: 'some campaign name',
          campaignType: CampaignTypes.PROFILES_COLLECTION,
        };

        // when
        const {
          data: [{ campaignName, campaignType }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.equal(expectedAttributes.campaignName);
        expect(campaignType).to.equal(expectedAttributes.campaignType);
      });

      it('should return null when there is no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ campaignName, campaignType }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.equal(null);
        expect(campaignType).to.equal(null);
      });

      it('should return campaign name and type only for a campaign in the given organization', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          name: 'some campaign name',
        }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ campaignName }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.equal(null);
      });
    });

    context('#participationStatus', function () {
      it('should return participation status when there is at least a participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'some campaign name',
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.TO_SHARE,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationStatus }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationStatus).to.deep.equal(CampaignParticipationStatuses.TO_SHARE);
      });

      it('should return null when there is no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationStatus }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationStatus).to.deep.equal(null);
      });
    });

    context('#participationCount', function () {
      it('should count participations in several campaigns', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, organizationLearnerId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(2);
      });

      it('should count only participations not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          deletedAt: null,
          deletedBy: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          deletedAt: new Date(),
          deletedBy,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(1);
      });

      it('should count only participations not improved', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, isImproved: true });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, isImproved: false });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(1);
      });

      it('should count 0 participation when sco participant has no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(0);
      });
    });

    context('#participantCount', function () {
      it('should only count sco participants in currentOrganization', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ isDisabled: false, organizationId: otherOrganization.id });
        await databaseBuilder.commit();

        // when
        const { meta } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(meta.participantCount).to.equal(1);
      });

      it('should not count disabled sco participants', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        databaseBuilder.factory.buildOrganizationLearner({
          isDisabled: false,
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true, organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const { meta } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(meta.participantCount).to.equal(1);
      });

      it('should count all participants when several exist', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const { meta } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId: organization.id,
        });

        // then
        expect(meta.participantCount).to.equal(2);
      });
    });

    describe('When sco participants are sorted', function () {
      it('should return sco participants sorted by ascendant participation count', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId1,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId: organizationLearnerId1,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId3,
        });
        await databaseBuilder.commit();
        // when
        const { data: participants } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
          sort: {
            participationCount: 'asc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(organizationLearnerId2);
        expect(participants[1].id).to.equal(organizationLearnerId3);
        expect(participants[2].id).to.equal(organizationLearnerId1);
      });

      it('should return sco participants sorted by descendant participation count', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId1,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId: organizationLearnerId1,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId3,
        });
        await databaseBuilder.commit();
        // when
        const { data: participants } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
          sort: {
            participationCount: 'desc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(organizationLearnerId1);
        expect(participants[1].id).to.equal(organizationLearnerId3);
        expect(participants[2].id).to.equal(organizationLearnerId2);
      });

      it('should return sco participants sorted by name if participation count are identical', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Aaaah',
        }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Dupont',
        }).id;
        const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Dupond',
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId1,
        });
        await databaseBuilder.commit();
        // when
        const { data: participants } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
          sort: {
            participationCount: 'asc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(organizationLearnerId3);
        expect(participants[1].id).to.equal(organizationLearnerId2);
        expect(participants[2].id).to.equal(organizationLearnerId1);
      });
    });

    context('#lastParticipationDate', function () {
      it('should take the last participation date', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          createdAt: new Date('2022-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          createdAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should take the last participation date not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          deletedAt: null,
          deletedBy: null,
          createdAt: new Date('2021-02-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          deletedAt: new Date(),
          deletedBy,
          createdAt: new Date('2022-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should take the last participation date not improved', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          isImproved: true,
          createdAt: new Date('2022-01-01'),
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          isImproved: false,
          createdAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should be null when sco participant has no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.equal(null);
      });
    });

    context('#isCertifiable', function () {
      it('should take the shared participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.STARTED,
          sharedAt: null,
          isCertifiable: true,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.deep.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: true,
        });

        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation of profile collection campaign', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const profileCollectionCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const assessmentCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.ASSESSMENT,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: profileCollectionCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: assessmentCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
          deletedAt: new Date(),
          deletedBy,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.deep.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation even if isImproved is true', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: true,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.deep.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation for campaign of given organization', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId: otherOrganizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.deep.equal(campaignParticipation.isCertifiable);
      });

      it('should return the date of the participation as certifiableAt property', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ certifiableAt }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(certifiableAt).to.deep.equal(campaignParticipation.sharedAt);
      });

      it('should return null for certifiableAt property if the organization learner is not certifiable', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ certifiableAt }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(certifiableAt).to.equal(null);
      });

      it('should be null when sco participant has no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.deep.equal(null);
      });
    });
  });
});
