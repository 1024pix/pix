import { expect, databaseBuilder, catchErr } from '../../../../test-helper';
import organizationLearnerFollowUpRepository from '../../../../../lib/infrastructure/repositories/organization-learner-follow-up/organization-learner-repository';
import { NotFoundError } from '../../../../../lib/domain/errors';
import AuthenticationMethod from '../../../../../lib/domain/models/AuthenticationMethod';

describe('Integration | Infrastructure | Repository | Organization Learner Follow Up | Organization Learner', function () {
  describe('#get', function () {
    context('When there is no organization learner', function () {
      it('Should throw an exception', async function () {
        //given
        const randomOrganizationLearnerId = 123;
        //when
        const err = await catchErr(organizationLearnerFollowUpRepository.get)(randomOrganizationLearnerId);
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

        const organizationLearner = await organizationLearnerFollowUpRepository.get(1233);

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

        const organizationLearner = await organizationLearnerFollowUpRepository.get(id);

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

            const organizationLearner = await organizationLearnerFollowUpRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerFollowUpRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerFollowUpRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerFollowUpRepository.get(organizationLearnerId);

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

            const organizationLearner = await organizationLearnerFollowUpRepository.get(organizationLearnerId);

            expect(organizationLearner.authenticationMethods).to.deep.equal([
              AuthenticationMethod.identityProviders.PIX,
              AuthenticationMethod.identityProviders.GAR,
            ]);
          });
        });
      });
    });
  });
});
