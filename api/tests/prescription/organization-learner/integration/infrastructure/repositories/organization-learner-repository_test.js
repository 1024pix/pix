import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../lib/domain/constants/identity-providers.js';
import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearner.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | Organization Learner Follow Up | Organization Learner', function () {
  describe('#get', function () {
    context('When there is no organization learner', function () {
      it('Should throw an exception', async function () {
        //given
        const randomOrganizationLearnerId = 123;
        //when
        const err = await catchErr(organizationLearnerRepository.get)(randomOrganizationLearnerId);
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

        databaseBuilder.factory.buildOrganizationLearner({
          id: 1233,
          firstName: 'Dark',
          lastName: 'Sasuke',
          division: 'Alone',
          userId,
        });
        await databaseBuilder.commit();

        const organizationLearner = await organizationLearnerRepository.get(1233);

        expect(organizationLearner.id).to.equal(1233);
        expect(organizationLearner.firstName).to.equal('Dark');
        expect(organizationLearner.lastName).to.equal('Sasuke');
        expect(organizationLearner.division).to.equal('Alone');
        expect(organizationLearner.email).to.equal('k.s@example.net');
        expect(organizationLearner.username).to.equal('sassouk');
      });

      it('Should return the organization learner with a given ID', async function () {
        databaseBuilder.factory.buildOrganizationLearner();

        const { id } = databaseBuilder.factory.buildOrganizationLearner();

        await databaseBuilder.commit();

        const organizationLearner = await organizationLearnerRepository.get(id);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

            expect(organizationLearner.group).to.equal(null);
            expect(organizationLearner.division).to.equal(null);
          });
        });
      });

      context('Connection methods', function () {
        context('When there are no connection methods', function () {
          it('should return an empty array', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ userId });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

            expect(organizationLearner.authenticationMethods).to.be.empty;
          });
        });

        context('When there are connection methods', function () {
          it('should return all connections method', async function () {
            const { id: userId } = databaseBuilder.factory.buildUser();
            databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({ userId });
            databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId });
            const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ userId });
            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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
            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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
            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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
            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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
              status: 'TO_SHARE',
              isCertifiable: true,
              sharedAt: null,
            });

            await databaseBuilder.commit();

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

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

              const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

              expect(organizationLearner.isCertifiable).to.equal(notDeletedParticipation.isCertifiable);
              expect(organizationLearner.certifiableAt).to.deep.equal(notDeletedParticipation.sharedAt);
            });
          });
        });
      });
    });
  });
});
