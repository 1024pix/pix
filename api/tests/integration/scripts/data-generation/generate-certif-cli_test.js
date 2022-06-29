const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const { main } = require('../../../../scripts/data-generation/generate-certif-cli');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Integration | Scripts | generate-certif-cli.js', function () {
  const certificationCenterSup = { id: 3, type: 'SUP' };
  const certificationCenterPro = { id: 2, type: 'PRO' };
  const certificationCenterSco = {
    id: 1,
    type: 'SCO',
    externalId: 'SCOID',
  };

  beforeEach(function () {
    sinon.stub(skillRepository, 'findActiveByCompetenceId').resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([]);
    sinon.stub(challengeRepository, 'list').resolves([]);
    databaseBuilder.factory.buildCertificationCenter(certificationCenterSco);
    databaseBuilder.factory.buildCertificationCenter(certificationCenterPro);
    databaseBuilder.factory.buildCertificationCenter(certificationCenterSup);

    databaseBuilder.factory.buildComplementaryCertification({ id: 52 });
    databaseBuilder.factory.buildComplementaryCertification({ id: 53 });
    databaseBuilder.factory.buildComplementaryCertification({ id: 54 });
    databaseBuilder.factory.buildComplementaryCertification({ id: 55 });

    return databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('complementary-certification-subscriptions').delete();
    await knex('complementary-certifications').delete();
    await knex('certification-candidates').delete();
    await knex('organization-learners').delete();
    await knex('organizations').delete();
    await knex('authentication-methods').delete();
    await knex('users').delete();
    await knex('sessions').delete();
    await knex('certification-centers').delete();
  });

  describe('#main', function () {
    context('when asking for 2 candidates', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [certificationCenterSup, certificationCenterPro].forEach(({ id: certificationCenterId, type }) => {
        context(`when asking for ${type}`, function () {
          it(`should create 2 ${type} candidates`, async function () {
            // when
            await main({
              centerType: type,
              candidateNumber: 2,
              complementaryCertifications: false,
              isSupervisorAccessEnabled: false,
            });

            // then
            const session = await knex('sessions').select('id', 'certificationCenterId', 'accessCode').first();
            const user = await knex('users').select('id').where({ firstName: 'c0', lastName: 'c0' }).first();
            const hasAuthenticationMethod = !!(await knex('authentication-methods')
              .select(1)
              .where({ userId: user.id })
              .first());
            const certificationCandidates = await knex('certification-candidates').select(
              'birthdate',
              'firstName',
              'lastName',
              'sessionId'
            );
            expect(session.accessCode).to.exist;
            expect(session.certificationCenterId).to.equal(certificationCenterId);
            expect(hasAuthenticationMethod).to.exist;
            expect(certificationCandidates).to.have.length(2);
            expect(certificationCandidates[0]).to.deep.equals({
              birthdate: '2000-01-01',
              firstName: 'c0',
              lastName: 'c0',
              sessionId: session.id,
            });
          });
        });
      });

      context(`when asking for SCO`, function () {
        it('should create 2 SCO candidates', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1, externalId: certificationCenterSco.externalId });
          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'b',
            lastName: 'b',
            birthdate: '2000-01-01',
            organizationId: 1,
            userId: null,
          });
          databaseBuilder.factory.buildOrganizationLearner({ organizationId: 1, userId: null });
          databaseBuilder.commit();

          // when
          await main({
            centerType: 'SCO',
            candidateNumber: 2,
            complementaryCertifications: false,
            isSupervisorAccessEnabled: false,
          });

          // then
          const session = await knex('sessions').select('id', 'certificationCenterId', 'accessCode').first();
          const user = await knex('users').select('id').where({ firstName: 'c0', lastName: 'c0' }).first();
          const hasAuthenticationMethod = !!(await knex('authentication-methods')
            .select(1)
            .where({ userId: user.id })
            .first());
          const certificationCandidates = await knex('certification-candidates').select(
            'birthdate',
            'firstName',
            'lastName',
            'sessionId'
          );

          expect(session.accessCode).to.exist;
          expect(session.certificationCenterId).to.equal(1);
          expect(hasAuthenticationMethod).to.exist;
          expect(certificationCandidates).to.have.length(2);
          expect(certificationCandidates[0]).to.deep.equals({
            birthdate: '2000-01-01',
            firstName: 'c0',
            lastName: 'c0',
            sessionId: session.id,
          });
        });
      });
    });
  });
});
