const axios = require('axios');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { UnexpectedUserAccount } = require('../../../../lib/domain/errors');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const PoleEmploiSending = require('../../../../lib/domain/models/PoleEmploiSending');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-result-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const poleEmploiSendingRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { handlePoleEmploiParticipationShared } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pole-emploi-participation-shared', () => {
  let event;
  let authenticationMethodRepositoryStub;
  let campaignRepositoryStub;
  let campaignParticipationRepositoryStub;
  let campaignParticipationResultRepositoryStub;
  let organizationRepositoryStub;
  let targetProfileRepositoryStub;
  let userRepositoryStub;

  const dependencies = {
    authenticationMethodRepository,
    campaignRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    organizationRepository,
    poleEmploiSendingRepository,
    targetProfileRepository,
    userRepository,
  };

  const expectedResults = JSON.stringify({
    campagne: {
      nom: 'Campagne Pôle Emploi',
      dateDebut: '2020-01-01T00:00:00.000Z',
      dateFin: '2020-02-01T00:00:00.000Z',
      type: 'EVALUATION',
      codeCampagne: 'CODEPE123',
      urlCampagne: 'https://app.pix.fr/campagnes/CODEPE123',
      nomOrganisme: 'Pix',
      typeOrganisme: 'externe',
    },
    individu: {
      nom: 'Bonneau',
      prenom: 'Jean',
    },
    test: {
      etat: 4,
      progression: 100,
      typeTest: 'DI',
      referenceExterne: 55667788,
      dateDebut: '2020-01-02T00:00:00.000Z',
      dateProgression: '2020-01-03T00:00:00.000Z',
      dateValidation: '2020-01-03T00:00:00.000Z',
      evaluation: 70,
      uniteEvaluation: 'A',
      elementsEvalues: [
        {
          libelle: 'Gérer des données',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 4,
          evaluation: {
            scoreObtenu: 50,
            uniteScore: 'A',
            nbSousElementValide: 2,
          },
        },
        {
          libelle: 'Gérer des données 2',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 3,
          evaluation: {
            scoreObtenu: 100,
            uniteScore: 'A',
            nbSousElementValide: 3,
          },
        },
      ],
    },
  });

  beforeEach(() => {
    authenticationMethodRepositoryStub = sinon.stub(authenticationMethodRepository, 'findOneByUserIdAndIdentityProvider');
    campaignRepositoryStub = sinon.stub(campaignRepository, 'get');
    campaignParticipationRepositoryStub = sinon.stub(campaignParticipationRepository, 'get');
    campaignParticipationResultRepositoryStub = sinon.stub(
      campaignParticipationResultRepository,
      'getByParticipationId',
    );
    organizationRepositoryStub = sinon.stub(organizationRepository, 'get');
    targetProfileRepositoryStub = sinon.stub(targetProfileRepository, 'get');
    userRepositoryStub = sinon.stub(userRepository, 'get');
    sinon.stub(poleEmploiSendingRepository, 'create');
  });

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePoleEmploiParticipationShared)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePoleEmploiParticipationShared', () => {
    const campaignParticipationId = 55667788;
    const campaignId = 11223344;
    const userId = 987654321;
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });

        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true });
        userRepositoryStub.withArgs(userId).resolves(domainBuilder.buildUser({ id: userId, firstName: 'Jean', lastName: 'Bonneau' }));
        campaignRepositoryStub.withArgs(campaignId).resolves(
          domainBuilder.buildCampaign({
            id: 11223344,
            name: 'Campagne Pôle Emploi',
            code: 'CODEPE123',
            createdAt: new Date('2020-01-01'),
            archivedAt: new Date('2020-02-01'),
            type: 'ASSESSMENT',
            targetProfileId: 'targetProfileId1',
            organizationId,
          }),
        );
        targetProfileRepositoryStub.withArgs('targetProfileId1').resolves({ name: 'Diagnostic initial' });
        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: 55667788,
            campaignId,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          }),
        );
        campaignParticipationResultRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipationResult({
            totalSkillsCount: 10,
            validatedSkillsCount: 7,
            competenceResults: [
              domainBuilder.buildCompetenceResult({
                name: 'Gérer des données',
                areaName: 'Information et données',
                totalSkillsCount: 4,
                testedSkillsCount: 2,
                validatedSkillsCount: 2,
              }),
              domainBuilder.buildCompetenceResult({
                name: 'Gérer des données 2',
                areaName: 'Information et données',
                totalSkillsCount: 3,
                testedSkillsCount: 3,
                validatedSkillsCount: 3,
              }),
            ],
          }),
        );
      });

      context('when the user is not authenticated as a pole emploi user', () => {
        beforeEach(() => {
          authenticationMethodRepositoryStub.withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(domainBuilder.buildAuthenticationMethod.buildPasswordAuthenticationMethod({ userId }));
        });

        it('it should throw an error', async () => {
          // when
          const error = await catchErr(handlePoleEmploiParticipationShared)({
            event,
            ...dependencies,
          });

          // then
          expect(error).to.be.instanceOf(UnexpectedUserAccount);
        });
      });

      context('when the user is authenticated as a pole emploi user', () => {
        beforeEach(() => {
          authenticationMethodRepositoryStub.withArgs({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI })
            .resolves(domainBuilder.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({ userId }));
        });

        it('it should record the sending', async () => {
          // given
          sinon.stub(axios, 'post').resolves();

          // when
          await handlePoleEmploiParticipationShared({
            event,
            ...dependencies,
          });

          // then
          expect(poleEmploiSendingRepository.create).to.have.been.called;
        });

        context('when sending succeeds', () => {
          beforeEach(() => {
            sinon.stub(axios, 'post').resolves();
          });

          it('it should send results', async () => {
            // when
            await handlePoleEmploiParticipationShared({
              event,
              ...dependencies,
            });

            // then
            expect(axios.post).to.have.been.calledOnce;
            const results = axios.post.firstCall.args[1];
            expect(results).to.deep.equal(expectedResults);
          });

          it('it should record that the sending has succeeded', async () => {
            // given
            sinon.spy(PoleEmploiSending.prototype, 'succeed');

            // when
            await handlePoleEmploiParticipationShared({
              event,
              ...dependencies,
            });

            // then
            expect(PoleEmploiSending.prototype.succeed).to.have.been.called;
          });
        });

        context('when sending fails', () => {
          beforeEach(() => {
            sinon.stub(axios, 'post').rejects();
          });

          it('it should record that the sending has failed', async () => {
            // given
            sinon.spy(PoleEmploiSending.prototype, 'fail');

            // when
            await handlePoleEmploiParticipationShared({
              event,
              ...dependencies,
            });

            // then
            expect(PoleEmploiSending.prototype.fail).to.have.been.called;
          });
        });
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });
        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: 55667788,
            campaignId,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          }),
        );
        campaignRepositoryStub.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ type: 'ASSESSMENT', organizationId }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: false });
        sinon.stub(axios, 'post');
      });

      it('it should not send results', async () => {
        // when
        await handlePoleEmploiParticipationShared({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(axios.post);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({ campaignParticipationId });

        campaignParticipationRepositoryStub.withArgs(campaignParticipationId).resolves(
          domainBuilder.buildCampaignParticipation({
            id: 55667788,
            campaignId,
            userId,
            sharedAt: new Date('2020-01-03'),
            createdAt: new Date('2020-01-02'),
          }),
        );
        campaignRepositoryStub
          .withArgs(campaignId)
          .resolves(domainBuilder.buildCampaign({ type: 'PROFILES_COLLECTION' }));
        organizationRepositoryStub.withArgs(organizationId).resolves({ isPoleEmploi: true, organizationId });
        sinon.stub(axios, 'post');
      });

      it('it should not send results', async () => {
        // when
        await handlePoleEmploiParticipationShared({
          event,
          ...dependencies,
        });

        // then
        sinon.assert.notCalled(axios.post);
      });
    });
  });
});
