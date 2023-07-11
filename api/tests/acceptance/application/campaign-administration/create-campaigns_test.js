import { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { PIX_ADMIN } from '../../../../lib/domain/constants.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';

const { ROLES } = PIX_ADMIN;

let server;

describe('Acceptance | Application | campaign-controller-create-campaigns', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('campaigns').delete();
  });

  describe('POST /api/admin/campaigns', function () {
    context('when user is SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });

      it('creates two campaigns', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: Membership.roles.ADMIN });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
        await databaseBuilder.commit();

        const buffer = `Identifiant de l'organisation*;Nom de la campagne*;Identifiant du profil cible*;Libellé de l'identifiant externe*;Identifiant du créateur*;Titre du parcours;Descriptif du parcours
          ${organizationId};Parcours importé par CSV;${targetProfileId};numéro d'étudiant;${userId};
          ${organizationId};Autre parcours importé par CSV;${targetProfileId};numéro d'étudiant;${userId};Titre;Superbe descriptif de parcours`;
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when user is not SuperAdmin', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.METIER }).id;
        await databaseBuilder.commit();
      });

      it('does not create campaigns', async function () {
        const options = {
          method: 'POST',
          url: '/api/admin/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
