const { expect, factory, knex, databaseBuilder } = require('../../../test-helper');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');
const organizationAccessRepository = require('../../../../lib/infrastructure/repositories/organization-access-repository');

describe('Integration | Repository | OrganizationAccess', function() {

  describe('#create', () => {

    let user;
    let organization;
    let organizationRole;

    beforeEach(async () => {
      // JBU: je ne suis pas fier du tout du code ci-dessous, que je trouve d'une complexité (et d'une magie noire) horrible(s) :-(

      user = factory.buildUser();
      databaseBuilder.factory.buildUser(user);

      organization = factory.buildOrganization();
      organization.code = 'AB1234';
      databaseBuilder.factory.buildOrganization(organization);

      organizationRole = factory.buildOrganizationRole();
      databaseBuilder.factory.buildOrganizationRole(organizationRole);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('organizations-accesses').delete();
      await databaseBuilder.clean();
    });

    context('Green case(s)', () => {

      context('when User, Organization and Organization Role exist in database', () => {

        it('should insert one row in the database', () => {
          // given
          const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });

          // when
          const promise = organizationAccessRepository.create(organizationAccess);

          // then
          return promise.then(() => {
            return knex.select().from('organizations-accesses').where({ userId: user.id, organizationId: organization.id })
              .then((matchingOrganizationAccesses) => {
                expect(matchingOrganizationAccesses).to.have.lengthOf(1);
              });
          });
        });

        it('should return an Organization Access', () => {
          // given
          const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });

          // when
          const promise = organizationAccessRepository.create(organizationAccess);

          // then
          return promise.then((organizationAccessSaved) => {
            expect(organizationAccessSaved).to.be.an.instanceof(OrganizationAccess);
          });
        });

        it('should load and return eagerly User data', () => {
          // given
          const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });

          // when
          const promise = organizationAccessRepository.create(organizationAccess);

          // then
          return promise.then((organizationAccessSaved) => {
            expect(organizationAccessSaved.user.id).to.equal(user.id);
            expect(organizationAccessSaved.user.firstName).to.equal(user.firstName);
            expect(organizationAccessSaved.user.lastName).to.equal(user.lastName);
            expect(organizationAccessSaved.user.email).to.equal(user.email);
          });
        });

        it('should load and return eagerly Organization data', () => {
          // given
          const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });

          // when
          const promise = organizationAccessRepository.create(organizationAccess);

          // then
          return promise.then((organizationAccessSaved) => {
            expect(organizationAccessSaved.organization.id).to.equal(organization.id);
            expect(organizationAccessSaved.organization.name).to.equal(organization.name);
            expect(organizationAccessSaved.organization.type).to.equal(organization.type);
            expect(organizationAccessSaved.organization.code).to.equal(organization.code);
          });
        });

        it('should load and return eagerly Organization Role data', () => {
          // given
          const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });

          // when
          const promise = organizationAccessRepository.create(organizationAccess);

          // then
          return promise.then((organizationAccessSaved) => {
            expect(organizationAccessSaved.organizationRole.id).to.equal(organizationRole.id);
            expect(organizationAccessSaved.organizationRole.name).to.equal(organizationRole.name);
          });
        });
      });
    });

    context('Red case(s)', () => {

      context('when User does not exist', () => {

        // XXX Can not be tested because SQLite does not take into account Foreign Key existence/unicity constraint :-(

      });

      context('when Organization does not exist', () => {

        // XXX Can not be tested because SQLite does not take into account Foreign Key existence/unicity constraint :-(

      });

      context('when Organization Role does not exist', () => {

        // XXX Can not be tested because SQLite does not take into account Foreign Key existence/unicity constraint :-(

      });
    });
  });
});
