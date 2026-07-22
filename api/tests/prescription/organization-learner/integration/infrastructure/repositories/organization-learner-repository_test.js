import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AttestationParticipantStatus } from '../../../../../../src/prescription/organization-learner/domain/read-models/AttestationParticipantStatus.js';
import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearner.js';
import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { repositories } from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/index.js';
import { User } from '../../../../../../src/profile/domain/models/User.js';
import { NotFoundError, OrganizationLearnerNotFound } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../../../tooling/mocks/attestation-storage.mock.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const { organizationLearnerRepository } = repositories;

describe('Integration | Infrastructure | Repository | Organization Learner', function () {
  describe('#get', function () {
    context('When there is no organization learner', function () {
      it('Should throw an exception', async function () {
        //given
        const randomOrganizationLearnerId = 123;
        //when
        const err = await catchErr(organizationLearnerRepository.get)({
          organizationLearnerId: randomOrganizationLearnerId,
        });
        //then
        expect(err.message).to.equal(`Student not found for ID ${randomOrganizationLearnerId}`);
        expect(err).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('When there are organization learners', function () {
      it('Should return informations about the learner', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser({
          email: 'k.s@example.net',
          username: 'sassouk',
        });

        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildOrganizationLearner({
          id: 1233,
          firstName: 'Dark',
          lastName: 'Sasuke',
          division: 'Alone',
          userId,
          organizationId,
        });
        await databaseBuilder.commit();

        const organizationLearner = await organizationLearnerRepository.get({
          organizationLearnerId: 1233,
        });
        expect(organizationLearner.id).to.equal(1233);
        expect(organizationLearner.userId).to.equal(userId);
        expect(organizationLearner.firstName).to.equal('Dark');
        expect(organizationLearner.lastName).to.equal('Sasuke');
        expect(organizationLearner.division).to.equal('Alone');
        expect(organizationLearner.email).to.equal('k.s@example.net');
        expect(organizationLearner.username).to.equal('sassouk');
        expect(organizationLearner.organizationId).to.equal(organizationId);
        expect(organizationLearner.features).to.be.empty;
      });

      it("Should return organization learner's features", async function () {
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFeatureWithFeatureKey({
          organizationLearnerId,
          featureKey: 'ORALIZATION',
        });
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFeatureWithFeatureKey({
          organizationLearnerId,
          featureKey: 'BLA',
        });
        await databaseBuilder.commit();

        const organizationLearner = await organizationLearnerRepository.get({
          organizationLearnerId,
        });
        expect(organizationLearner.features).to.deep.equal(['ORALIZATION', 'BLA']);
      });

      it('Should return the organization learner with a given ID', async function () {
        databaseBuilder.factory.buildOrganizationLearner();

        const { id } = databaseBuilder.factory.buildOrganizationLearner();

        await databaseBuilder.commit();

        const organizationLearner = await organizationLearnerRepository.get({
          organizationLearnerId: id,
        });

        expect(organizationLearner.id).to.equal(id);
      });

      context('Attributes division/group', function () {
        context('When the learner belongs to a SUP organization', function () {
          it('should return group value', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
              group: 'L3',
              division: null,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.group).to.equal('L3');
            expect(organizationLearner.division).to.equal(null);
          });
        });

        context('When the learner belongs to a SCO organization', function () {
          it('should return division value', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
              division: '3B',
              group: null,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.division).to.equal('3B');
            expect(organizationLearner.group).to.equal(null);
          });
        });

        context('When the learner belongs to a PRO organization', function () {
          it('should return null for division and group', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
              group: null,
              division: null,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.group).to.equal(null);
            expect(organizationLearner.division).to.equal(null);
          });
        });
      });

      context('Connection methods', function () {
        context('When there are no connection methods', function () {
          it('should return an empty array', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.authenticationMethods).to.be.empty;
          });
        });

        context('When there are connection methods', function () {
          it('should return all connections method', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({
              userId,
            });
            databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId });
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              userId,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.authenticationMethods).to.have.members([
              NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
              NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            ]);
          });
        });
      });

      context('isCertifiable', function () {
        context('When the profile collection participation of the learner is certifiable', function () {
          it('should take the participation certifiable value', async function () {
            // given
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            }).id;

            const campaignId = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            }).id;

            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId,
              isCertifiable: true,
              sharedAt: new Date('2023-02-01'),
            });

            await databaseBuilder.commit();

            // when
            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            //then
            expect(organizationLearner.isCertifiable).to.be.true;
            expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
          });

          it('should return isCertifiable of the given id learner', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            });
            const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            });
            const profileCollectionCampaign = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            });
            const certifiableParticipation = databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: profileCollectionCampaign.id,
              isCertifiable: true,
              sharedAt: new Date('2023-02-01'),
            });
            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId: organizationLearnerId2,
              campaignId: profileCollectionCampaign.id,
              isCertifiable: false,
              sharedAt: new Date('2023-03-02'),
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.isCertifiable).to.be.true;
            expect(organizationLearner.certifiableAt).to.deep.equal(certifiableParticipation.sharedAt);
          });
        });

        context('When the learner have several profile collection participations', function () {
          it('should take the last participation certifiable value', async function () {
            // given
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            }).id;

            const firstCampaignId = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            }).id;

            const secondCampaignId = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            }).id;

            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: firstCampaignId,
              isCertifiable: true,
              sharedAt: new Date('2023-02-01'),
            });

            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: secondCampaignId,
              isCertifiable: false,
              sharedAt: new Date('2024-02-01'),
            });

            await databaseBuilder.commit();

            // when
            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            //then
            expect(organizationLearner.isCertifiable).to.be.false;
            expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
          });
        });

        context('When the learner is certifiable', function () {
          it('should take the learner certifiable value', async function () {
            // given
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
              isCertifiable: true,
              certifiableAt: new Date('2023-12-12'),
            }).id;

            await databaseBuilder.commit();

            // when
            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            //then
            expect(organizationLearner.isCertifiable).to.be.true;
            expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
          });
        });

        context('When learner is not certifiable', function () {
          it('should return isCertifiable false', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
              isCertifiable: false,
              certifiableAt: null,
            }).id;
            const campaignId = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            }).id;
            const campaignParticipationSharedAt = new Date('2023-03-01');
            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId,
              isCertifiable: false,
              certifiableAt: null,
              sharedAt: campaignParticipationSharedAt,
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.isCertifiable).to.be.false;
            expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
          });
        });

        context('When learner has started but not shared his participation', function () {
          it('should return isCertifiable null', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            });
            const profileCollectionCampaign = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            });

            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: profileCollectionCampaign.id,
              status: 'STARTED',
              isCertifiable: true,
              sharedAt: null,
            });

            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.isCertifiable).to.be.null;
            expect(organizationLearner.certifiableAt).to.be.null;
          });
        });

        context('When the campaign is assessment type', function () {
          it('should return isCertifiable null', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            });
            const profileCollectionCampaign = databaseBuilder.factory.buildCampaign({
              type: 'ASSESSMENT',
              organizationId,
            });
            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: profileCollectionCampaign.id,
              isCertifiable: true,
              sharedAt: new Date('2023-03-01'),
            });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.isCertifiable).to.be.null;
            expect(organizationLearner.certifiableAt).to.equal(null);
          });
        });

        context('When learner has several participations', function () {
          it('should return the certifiable information of the most recent participation', async function () {
            const organizationId = databaseBuilder.factory.buildOrganization().id;
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
              organizationId,
            });
            const profileCollectionCampaign1 = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            });

            const profileCollectionCampaign2 = databaseBuilder.factory.buildCampaign({
              type: 'PROFILES_COLLECTION',
              organizationId,
            });

            databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: profileCollectionCampaign2.id,
              isCertifiable: false,
              sharedAt: new Date('2023-03-01'),
            });

            const certifiableParticipation = databaseBuilder.factory.buildCampaignParticipation({
              organizationLearnerId,
              campaignId: profileCollectionCampaign1.id,
              isCertifiable: true,
              sharedAt: new Date('2023-03-03'),
            });

            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get({
              organizationLearnerId,
            });

            expect(organizationLearner.isCertifiable).to.equal(certifiableParticipation.isCertifiable);
            expect(organizationLearner.certifiableAt).to.deep.equal(certifiableParticipation.sharedAt);
          });

          context('But the last participation is deleted', function () {
            it('should return the certifiable information of the most recent and not deleted participation ', async function () {
              const organizationId = databaseBuilder.factory.buildOrganization().id;
              const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
                organizationId,
              });
              const profileCollectionCampaign = databaseBuilder.factory.buildCampaign({
                type: 'PROFILES_COLLECTION',
                organizationId,
              });
              databaseBuilder.factory.buildCampaignParticipation({
                organizationLearnerId,
                campaignId: profileCollectionCampaign.id,
                isCertifiable: true,
                sharedAt: new Date('2023-02-01'),
                deletedAt: new Date('2023-03-01'),
              });

              const notDeletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
                organizationLearnerId,
                campaignId: profileCollectionCampaign.id,
                isCertifiable: true,
                sharedAt: new Date('2023-01-01'),
              });
              await databaseBuilder.commit();

              const organizationLearner = await organizationLearnerRepository.get({
                organizationLearnerId,
              });

              expect(organizationLearner.isCertifiable).to.equal(notDeletedParticipation.isCertifiable);
              expect(organizationLearner.certifiableAt).to.deep.equal(notDeletedParticipation.sharedAt);
            });
          });
        });
      });
    });
  });

  describe('#findPaginatedLearnersByOrganizationId', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();
    });

    it('should not return disabled learner', async function () {
      const learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        firstName: 'Gilgamesh',
        lastName: 'Toto',
        attributes: { classe: 'Warlock' },
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        isDisabled: true,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({ organizationId });

      expect(result.learners).lengthOf(1);
      expect(result.learners[0]).instanceOf(OrganizationLearner);
      expect(result.learners[0].id).to.be.equal(learner.id);
    });

    it('should not return deleted learner', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        deletedAt: new Date(),
        deletedBy: userId,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: otherOrganizationId,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({ organizationId });

      expect(result.learners).lengthOf(0);
    });

    it('should not return the learner from another organization', async function () {
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: otherOrganizationId,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({ organizationId });

      expect(result.learners).lengthOf(0);
    });

    it('retrieve all active learners from specific organizationId', async function () {
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        attributes: { classe: 'Warlock' },
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        attributes: { classe: 'Druid' },
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({ organizationId });

      expect(result.learners).lengthOf(2);
    });

    context('ordered learners without case sensitive', function () {
      let firstLearner;

      beforeEach(async function () {
        firstLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'toto',
          lastName: 'Gilgamesh',
          attributes: { classe: 'Warlock' },
        });
        await databaseBuilder.commit();
      });

      it('orders by firstName', async function () {
        const secondLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Tata',
          lastName: 'Gilgamesh',
        });
        const thirdLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Toto',
          lastName: 'Gulgamesh',
        });

        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({
          organizationId,
        });

        expect(result.learners).lengthOf(3);
        expect(result.learners[0].id).to.equal(secondLearner.id);
        expect(result.learners[1].id).to.equal(firstLearner.id);
        expect(result.learners[2].id).to.equal(thirdLearner.id);
      });

      it('orders by lastName when firstName are identical', async function () {
        const secondLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Toto',
          lastName: 'Auberto',
        });

        const thirdLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Toto',
          lastName: 'auberti',
        });

        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({
          organizationId,
        });

        expect(result.learners).lengthOf(3);
        expect(result.learners[0].id).to.equal(thirdLearner.id);
        expect(result.learners[1].id).to.equal(secondLearner.id);
        expect(result.learners[2].id).to.equal(firstLearner.id);
      });
    });

    context('Pagination', function () {
      it('retrieve paginated all active learners', async function () {
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          attributes: { classe: 'Druid' },
        });
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          attributes: { classe: 'Witch' },
        });

        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({
          organizationId,
          page: {
            size: 1,
            number: 1,
          },
        });

        expect(result.pagination).to.deep.equal({
          page: 1,
          pageSize: 1,
          rowCount: 2,
          pageCount: 2,
        });
      });

      context('Filtering', function () {
        it('retrieve filtered and paginated learners', async function () {
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            organizationId,
            attributes: { 'Libellé classe': 'Druid' },
          });
          databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            organizationId,
            firstName: 'Alban',
            attributes: { 'Libellé classe': 'Witch' },
          });

          const rogueLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
            organizationId,
            firstName: 'Zoé',
            attributes: { 'Libellé classe': 'Rogue' },
            division: '6ème',
          });

          await databaseBuilder.commit();

          const result = await organizationLearnerRepository.findPaginatedLearnersByOrganizationId({
            organizationId,
            page: {
              size: 1,
              number: 1,
            },
            filter: { 'Libellé classe': ['Witch', 'Rogue'], name: 'Zoé', divisions: ['6ème'] },
          });

          expect(result.pagination).to.deep.equal({
            page: 1,
            pageSize: 1,
            rowCount: 1,
            pageCount: 1,
          });
          expect(result.learners).to.have.lengthOf(1);
          expect(result.learners[0].id).to.equal(rogueLearner.id);
        });
      });
    });
  });

  describe('#findPaginatedLearnersForAdmin', function () {
    let organization;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({
        externalId: 'ABC123',
      });

      await databaseBuilder.commit();
    });

    it('should return disabled learner by default', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const learner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'afirstname',
        lastName: 'lastname',
        birthdate: '2000-01-01',
        division: '3eB',
        group: 'AB2',
        nationalStudentId: '12345678910',
        userId,
        organizationId: organization.id,
        updatedAt: '2026-01-01',
        isDisabled: true,
      });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        isDisabled: false,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({ page: {} });

      expect(result.learners).lengthOf(2);
      expect(result.learners[0]).instanceOf(OrganizationLearnerOverviewForAdmin);
      expect(result.learners[0]).to.be.deep.equal({
        id: learner.id,
        firstName: 'afirstname',
        lastName: 'lastname',
        birthdate: '2000-01-01',
        division: '3eB',
        group: 'AB2',
        nationalStudentId: '12345678910',
        userId,
        organizationId: organization.id,
        organizationName: organization.name,
        updatedAt: new Date('2026-01-01'),
        isDisabled: true,
      });
      expect(result.learners[1]).instanceOf(OrganizationLearnerOverviewForAdmin);
      expect(result.learners[1].id).to.be.equal(learner2.id);
    });

    it('should not return disabled learner if filter is on', async function () {
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        isDisabled: true,
      });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        isDisabled: false,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
        page: {},
        filter: { hideDisabled: true },
      });

      expect(result.learners).lengthOf(1);
      expect(result.learners[0]).instanceOf(OrganizationLearnerOverviewForAdmin);
      expect(result.learners[0].id).to.be.equal(learner2.id);
    });

    it('should not return deleted learner', async function () {
      const userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        deletedAt: new Date(),
        deletedBy: userId,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({ page: {} });

      expect(result.learners).lengthOf(0);
    });

    it('retrieve all active learners from specific organizationExternalId with case insensitivity', async function () {
      const otherOrganization = databaseBuilder.factory.buildOrganization({
        externalId: 'ZYX987',
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: otherOrganization.id,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
        filter: { organizationExternalId: 'abc123' },
        page: {},
      });

      expect(result.learners).lengthOf(2);
    });

    it('retrieve paginated active learners', async function () {
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
        page: {
          size: 1,
          number: 1,
        },
      });

      expect(result.pagination).to.deep.equal({
        page: 1,
        pageSize: 1,
        rowCount: 2,
        pageCount: 2,
      });
    });

    it('retrieve filtered and paginated learners', async function () {
      const otherOrganization = databaseBuilder.factory.buildOrganization({
        externalId: 'ZYX987',
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: otherOrganization.id,
        firstName: 'Zoé',
        lastName: 'De Ségazan',
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'Zoé',
      });

      const learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'Zoé',
        lastName: 'De Ségazan',
      });

      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
        page: {
          size: 1,
          number: 1,
        },
        filter: { organizationExternalId: 'AbC123', fullName: 'Zoé De Ségazan' },
      });

      expect(result.pagination).to.deep.equal({
        page: 1,
        pageSize: 1,
        rowCount: 1,
        pageCount: 1,
      });
      expect(result.learners).to.have.lengthOf(1);
      expect(result.learners[0].id).to.equal(learner.id);
    });

    context('ordered learners without case sensitive', function () {
      let firstLearner;

      beforeEach(async function () {
        firstLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'toto',
          lastName: 'Gilgamesh',
        });
        await databaseBuilder.commit();
      });

      it('orders by firstName', async function () {
        const secondLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Tata',
          lastName: 'Gilgamesh',
        });
        const thirdLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Toto',
          lastName: 'Gulgamesh',
        });

        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({ page: {} });

        expect(result.learners).lengthOf(3);
        expect(result.learners[0].id).to.equal(secondLearner.id);
        expect(result.learners[1].id).to.equal(firstLearner.id);
        expect(result.learners[2].id).to.equal(thirdLearner.id);
      });

      it('orders by lastName when firstName are identical', async function () {
        const secondLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Toto',
          lastName: 'Auberto',
        });

        const thirdLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Toto',
          lastName: 'auberti',
        });

        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({ page: {} });

        expect(result.learners).lengthOf(3);
        expect(result.learners[0].id).to.equal(thirdLearner.id);
        expect(result.learners[1].id).to.equal(secondLearner.id);
        expect(result.learners[2].id).to.equal(firstLearner.id);
      });
    });

    context('Sort', function () {
      let otherOrganization;
      let learner1, learner2, learner3;
      beforeEach(async function () {
        otherOrganization = databaseBuilder.factory.buildOrganization({
          name: 'PIX',
        });

        learner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Annie',
          birthdate: '2000-01-01',
          updatedAt: new Date('2022-01-01'),
        });
        learner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Zoé',
          lastName: 'De Ségazan',
          birthdate: '2001-01-01',
          updatedAt: new Date('2021-01-01'),
        });
        learner3 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganization.id,
          firstName: 'Jean',
          lastName: 'De Ségazan',
          birthdate: '2002-01-01',
          updatedAt: new Date('2020-01-01'),
        });

        await databaseBuilder.commit();
      });
      it('retrieve learners sorted by organization name asc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            organizationSort: 'asc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner1.id);
        expect(result.learners[1].id).to.be.equal(learner2.id);
        expect(result.learners[2].id).to.be.equal(learner3.id);
      });
      it('retrieve learners sorted by organization name desc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            organizationSort: 'desc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner3.id);
        expect(result.learners[1].id).to.be.equal(learner1.id);
        expect(result.learners[2].id).to.be.equal(learner2.id);
      });
      it('retrieve learners sorted by birthdate asc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            birthdateSort: 'asc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner1.id);
        expect(result.learners[1].id).to.be.equal(learner2.id);
        expect(result.learners[2].id).to.be.equal(learner3.id);
      });
      it('retrieve learners sorted by birthdate desc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            birthdateSort: 'desc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner3.id);
        expect(result.learners[1].id).to.be.equal(learner2.id);
        expect(result.learners[2].id).to.be.equal(learner1.id);
      });
      it('retrieve learners sorted by updatedAt asc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            updatedAtSort: 'asc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner3.id);
        expect(result.learners[1].id).to.be.equal(learner2.id);
        expect(result.learners[2].id).to.be.equal(learner1.id);
      });
      it('retrieve learners sorted by updatedAt desc', async function () {
        //when
        const result = await organizationLearnerRepository.findPaginatedLearnersForAdmin({
          sort: {
            updatedAtSort: 'desc',
          },
        });
        //then
        expect(result.learners[0].id).to.be.equal(learner1.id);
        expect(result.learners[1].id).to.be.equal(learner2.id);
        expect(result.learners[2].id).to.be.equal(learner3.id);
      });
    });
  });

  describe('#findUserIdsFromFilters', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();
    });

    it('should return organization learners', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6eme A',
      });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6eme B',
      });

      await databaseBuilder.commit();

      // when
      const learners = await organizationLearnerRepository.findUserIdsFromFilters({
        organizationId,
        filters: { divisions: ['6eme A', '6eme B'] },
      });

      // then
      expect(learners).to.deep.equal([learner1.userId, learner2.userId]);
    });

    it('should not return disabled organization learners', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6eme A',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        division: '6eme A',
        isDisabled: true,
      });

      await databaseBuilder.commit();

      // when
      const learners = await organizationLearnerRepository.findUserIdsFromFilters({
        organizationId,
        filters: { divisions: ['6eme A'] },
      });

      // then
      expect(learners).to.have.lengthOf(1);
      expect(learners).to.deep.equal([learner1.userId]);
    });

    it('should not return unreconcilied organization learners', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId: null,
        division: '6eme A',
      });

      await databaseBuilder.commit();

      // when
      const learners = await organizationLearnerRepository.findUserIdsFromFilters({
        organizationId,
        filters: { divisions: ['6eme A'] },
      });

      // then
      expect(learners).to.have.lengthOf(0);
    });

    context('when there is no organization with organizationId', function () {
      const notExistingOrganizationId = '999999';

      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme A' });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme B' });

        await databaseBuilder.commit();

        // when
        const result = await organizationLearnerRepository.findUserIdsFromFilters({
          organizationId: notExistingOrganizationId,
          filters: { divisions: ['6eme A', '6eme B'] },
        });

        // then
        expect(result).to.be.empty;
      });
    });

    context('when there is no organizationLearners with these divisions', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme A' });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme B' });
        const notExistingDivisions = ['6eme C', '6eme D'];

        await databaseBuilder.commit();

        // when
        const result = await organizationLearnerRepository.findUserIdsFromFilters({
          organizationId,
          filters: { divisions: notExistingDivisions },
        });

        // then
        expect(result).to.be.empty;
      });
    });

    context('when divisions is an empty array', function () {
      it('should return all learners', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme A' });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme B' });

        await databaseBuilder.commit();

        // when
        const result = await organizationLearnerRepository.findUserIdsFromFilters({
          organizationId,
          filters: { divisions: [] },
        });

        // then
        expect(result).to.have.lengthOf(2);
      });
    });
  });

  describe('#findPaginatedAttestationStatusForOrganizationLearnersAndKey', function () {
    let attestation, organizationId, firstUser, secondUser, organizationLearner1, organizationLearner2;

    beforeEach(async function () {
      attestation = databaseBuilder.factory.buildAttestation();
      mockAttestationStorage(attestation);
      organizationId = databaseBuilder.factory.buildOrganization().id;
      firstUser = new User(databaseBuilder.factory.buildUser({ firstName: 'alex', lastName: 'Terieur' }));
      secondUser = new User(databaseBuilder.factory.buildUser({ firstName: 'theo', lastName: 'Courant' }));
      organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        firstName: 'xandri',
        lastName: 'Alek',
        division: '6eme A',
        userId: firstUser.id,
      });
      organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        firstName: 'xandra',
        lastName: 'Balek',
        division: '6eme B',
        userId: secondUser.id,
      });
      await databaseBuilder.commit();
    });

    it('should not return learner from another organization', async function () {
      // given
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner();

      await databaseBuilder.commit();

      // when
      const { attestationParticipantsStatus: result } =
        await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
        });

      // then
      expect(result).lengthOf(2);
    });

    it('should not return disabled learner', async function () {
      // given
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        isDisabled: true,
      });

      await databaseBuilder.commit();

      // when
      const { attestationParticipantsStatus: result } =
        await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
        });

      // then
      expect(result).lengthOf(2);
    });

    it('should not return deleted learner', async function () {
      // given
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const { attestationParticipantsStatus: result } =
        await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
        });

      // then
      expect(result).lengthOf(2);
    });

    it('should not return learner linked to anonymous user', async function () {
      // given
      const anonymousUser = databaseBuilder.factory.buildUser({ isAnonymous: true });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: anonymousUser.id,
        organizationId,
      });

      await databaseBuilder.commit();

      // when
      const { attestationParticipantsStatus: result } =
        await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
        });

      // then
      expect(result).to.have.lengthOf(2);
    });

    it('should not return learner linked to anonymised user', async function () {
      // given
      const anonymisedUser = databaseBuilder.factory.buildUser({ hasBeenAnonymised: true });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: anonymisedUser.id,
        organizationId,
      });

      await databaseBuilder.commit();

      // when
      const { attestationParticipantsStatus: result } =
        await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
        });

      // then
      expect(result).to.have.lengthOf(2);
    });

    context('when no organization learner has obtained his attestation', function () {
      it('should return attestation participants status with obtainedAt at null', async function () {
        // given
        const attestation = databaseBuilder.factory.buildAttestation({ key: 'ANOTHER_GRADE' });
        await databaseBuilder.commit();

        // when
        const { attestationParticipantsStatus: result } =
          await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
            organizationId,
            attestationKey: attestation.key,
          });

        // then
        expect(result).to.have.lengthOf(2);
        expect(result[0]).to.be.instanceOf(AttestationParticipantStatus);
        expect(result).to.have.deep.members([
          {
            id: `ANOTHER_GRADE_${organizationLearner1.id}`,
            attestationKey: 'ANOTHER_GRADE',
            division: organizationLearner1.division,
            firstName: organizationLearner1.firstName,
            lastName: organizationLearner1.lastName,
            obtainedAt: null,
            organizationLearnerId: organizationLearner1.id,
          },
          {
            id: `ANOTHER_GRADE_${organizationLearner2.id}`,
            attestationKey: 'ANOTHER_GRADE',
            division: organizationLearner2.division,
            firstName: organizationLearner2.firstName,
            lastName: organizationLearner2.lastName,
            obtainedAt: null,
            organizationLearnerId: organizationLearner2.id,
          },
        ]);
      });
    });

    context('when organization learner has obtained his attestation', function () {
      it('should return attestation participants status with obtainedAt filled', async function () {
        // given
        const firstProfileReward = databaseBuilder.factory.buildProfileReward({
          rewardId: attestation.id,
          userId: firstUser.id,
        });
        databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: firstProfileReward.id,
        });
        const secondProfileReward = databaseBuilder.factory.buildProfileReward({
          rewardId: attestation.id,
          userId: secondUser.id,
        });
        databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: secondProfileReward.id,
        });

        await databaseBuilder.commit();

        // when
        const { attestationParticipantsStatus: result } =
          await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
            organizationId,
            attestationKey: attestation.key,
          });

        // then
        expect(result).to.have.lengthOf(2);
        expect(result[0]).to.be.instanceOf(AttestationParticipantStatus);
        expect(result).to.have.deep.members([
          {
            id: `SIXTH_GRADE_${organizationLearner1.id}`,
            attestationKey: 'SIXTH_GRADE',
            division: organizationLearner1.division,
            firstName: organizationLearner1.firstName,
            lastName: organizationLearner1.lastName,
            obtainedAt: firstProfileReward.createdAt,
            organizationLearnerId: organizationLearner1.id,
          },
          {
            id: `SIXTH_GRADE_${organizationLearner2.id}`,
            attestationKey: 'SIXTH_GRADE',
            division: organizationLearner2.division,
            firstName: organizationLearner2.firstName,
            lastName: organizationLearner2.lastName,
            obtainedAt: secondProfileReward.createdAt,
            organizationLearnerId: organizationLearner2.id,
          },
        ]);
      });
    });

    context('ordered learners without case sensitive', function () {
      it('orders by lastName', async function () {
        const { attestationParticipantsStatus: result } =
          await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
            organizationId,
            attestationKey: attestation.key,
          });

        expect(result).lengthOf(2);
        expect(result[0].organizationLearnerId).to.equal(organizationLearner1.id);
        expect(result[1].organizationLearnerId).to.equal(organizationLearner2.id);
      });

      it('orders by firstName when lastName are identical', async function () {
        const secondLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Toto',
          lastName: 'Quberto',
        });

        const thirdLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Tota',
          lastName: 'Quberto',
        });

        await databaseBuilder.commit();

        const { attestationParticipantsStatus: result } =
          await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
            organizationId,
            attestationKey: attestation.key,
          });

        expect(result).lengthOf(4);
        expect(result[2].organizationLearnerId).to.equal(thirdLearner.id);
        expect(result[3].organizationLearnerId).to.equal(secondLearner.id);
      });
    });

    context('Pagination', function () {
      it('retrieve paginated all active learners', async function () {
        Array.from({ length: 10 }).forEach(() => {
          databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        });
        await databaseBuilder.commit();

        const result = await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
          organizationId,
          attestationKey: attestation.key,
          page: {
            size: 10,
            number: 2,
          },
        });

        expect(result.pagination).to.deep.equal({
          page: 2,
          pageSize: 10,
          rowCount: 12,
          pageCount: 2,
        });
        expect(result.attestationParticipantsStatus.length).to.equal(2);
      });

      context('Filtering', function () {
        it('retrieve filtered and paginated learners', async function () {
          const result =
            await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
              attestationKey: attestation.key,
              organizationId,
              page: {
                size: 1,
                number: 1,
              },
              filter: { name: 'xandri', divisions: ['6eme A'] },
            });

          expect(result.pagination).to.deep.equal({
            page: 1,
            pageSize: 1,
            rowCount: 1,
            pageCount: 1,
          });
          expect(result.attestationParticipantsStatus).to.have.lengthOf(1);
          expect(result.attestationParticipantsStatus[0].organizationLearnerId).to.equal(organizationLearner1.id);
        });

        it('should be able to filter by statuses', async function () {
          // given
          const firstProfileReward = databaseBuilder.factory.buildProfileReward({
            rewardId: attestation.id,
            userId: firstUser.id,
            createdAt: new Date('2025-01-01'),
          });
          databaseBuilder.factory.buildOrganizationsProfileRewards({
            organizationId,
            profileRewardId: firstProfileReward.id,
          });

          await databaseBuilder.commit();

          // when
          const result =
            await organizationLearnerRepository.findPaginatedAttestationStatusForOrganizationLearnersAndKey({
              attestationKey: attestation.key,
              filter: { statuses: ['OBTAINED'] },
              organizationId,
            });

          // then
          expect(result.pagination.rowCount).to.equal(1);
          expect(result.attestationParticipantsStatus[0].organizationLearnerId).to.equal(organizationLearner1.id);
        });
      });
    });
  });

  describe('#findIdByUserIdAndOrganizationId', function () {
    it('should return null if not found', async function () {
      const result = await organizationLearnerRepository.findIdByUserIdAndOrganizationId({
        organizationId: 1,
        userId: 123,
      });

      expect(result).null;
    });
    it('should return existing organization learner for given id', async function () {
      const organizationId = await databaseBuilder.factory.buildOrganization().id;
      const userId = await databaseBuilder.factory.buildUser().id;
      const organizationLearnerId = await databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;
      await databaseBuilder.commit();

      const result = await organizationLearnerRepository.findIdByUserIdAndOrganizationId({
        organizationId,
        userId,
      });
      expect(result).to.equal(organizationLearnerId);
    });
  });

  describe('#updateUserIdWhereNull', function () {
    it('updates userId of a learner', async function () {
      //given
      const user = databaseBuilder.factory.buildUser();
      const learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        userId: null,
      });
      await databaseBuilder.commit();

      // when
      const updatedLeaner = await organizationLearnerRepository.updateUserIdWhereNull({
        organizationLearnerId: learner.id,
        userId: user.id,
      });

      // then
      expect(updatedLeaner.userId).to.equal(user.id);
    });

    context('when learner is already linked to a user', function () {
      it('throws OrganizationLearnerNotFound', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          userId: user.id,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(organizationLearnerRepository.updateUserIdWhereNull)({
          organizationLearnerId: learner.id,
          userId: user.id,
        });

        // then
        expect(error).to.be.instanceof(OrganizationLearnerNotFound);
      });
    });
  });
});
