import { createOrganization } from '../../../../src/mcp-admin-server/domain/usecases/create-organization.js';
import { expect } from '../../../test-helper.js';

describe('McpAdminServer | Integration | Domain | Usecases | createOrganization', function () {
  describe('#createOrganization', function () {
    context('scenario 1: nominal case', function () {
      it('resolves labels and returns { id, name } on success', async function () {
        // given
        const administrationTeamRepository = {
          findAll: async () => [
            { id: 10, name: 'Équipe Alpha' },
            { id: 11, name: 'Équipe Beta' },
          ],
        };
        const organizationLearnerTypeRepository = {
          findAll: async () => [
            { id: 20, name: 'Lycéens' },
            { id: 21, name: 'Adultes' },
          ],
        };
        const countryRepository = {
          findAll: async () => [{ code: 99100, name: 'France' }],
        };
        const organizationRepository = {
          create: async (payload) => ({
            status: 201,
            body: {
              data: {
                id: '42',
                type: 'organizations',
                attributes: { name: payload.data.attributes.name },
              },
            },
          }),
        };

        // when
        const result = await createOrganization({
          args: {
            name: 'Collège Jean-Moulin',
            type: 'SCO',
            administrationTeamName: 'Équipe Alpha',
            organizationLearnerTypeName: 'Lycéens',
            countryName: 'France',
          },
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
          organizationRepository,
        });

        // then
        expect(result).to.deep.equal({ id: '42', name: 'Collège Jean-Moulin' });
      });

      it('builds the correct JSON:API payload with resolved ids', async function () {
        // given
        let capturedPayload;
        const administrationTeamRepository = {
          findAll: async () => [{ id: 10, name: 'Équipe Alpha' }],
        };
        const organizationLearnerTypeRepository = {
          findAll: async () => [{ id: 20, name: 'Lycéens' }],
        };
        const countryRepository = {
          findAll: async () => [{ code: 99100, name: 'France' }],
        };
        const organizationRepository = {
          create: async (payload) => {
            capturedPayload = payload;
            return {
              status: 201,
              body: {
                data: {
                  id: '42',
                  type: 'organizations',
                  attributes: { name: 'Collège Jean-Moulin' },
                },
              },
            };
          },
        };

        // when
        await createOrganization({
          args: {
            name: 'Collège Jean-Moulin',
            type: 'SCO',
            administrationTeamName: 'Équipe Alpha',
            organizationLearnerTypeName: 'Lycéens',
            countryName: 'France',
            externalId: 'EXT-001',
          },
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
          organizationRepository,
        });

        // then
        expect(capturedPayload.data.type).to.equal('organizations');
        expect(capturedPayload.data.attributes['name']).to.equal('Collège Jean-Moulin');
        expect(capturedPayload.data.attributes['type']).to.equal('SCO');
        expect(capturedPayload.data.attributes['administration-team-id']).to.equal(10);
        expect(capturedPayload.data.attributes['organization-learner-type-id']).to.equal(20);
        expect(capturedPayload.data.attributes['country-code']).to.equal(99100);
        expect(capturedPayload.data.attributes['external-id']).to.equal('EXT-001');
      });
    });

    context('scenario 2: administrationTeamName not found', function () {
      it('returns { error: { notFound, availableValues } } with the actual list', async function () {
        // given
        const administrationTeamRepository = {
          findAll: async () => [
            { id: 10, name: 'Équipe Alpha' },
            { id: 11, name: 'Équipe Beta' },
          ],
        };
        const organizationLearnerTypeRepository = {
          findAll: async () => [],
        };
        const countryRepository = {
          findAll: async () => [],
        };
        const organizationRepository = {
          // eslint-disable-next-line no-empty-function
          create: async () => {},
        };

        // when
        const result = await createOrganization({
          args: {
            name: 'Collège Jean-Moulin',
            type: 'SCO',
            administrationTeamName: 'Équipe Inconnue',
            organizationLearnerTypeName: 'Lycéens',
            countryName: 'France',
          },
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
          organizationRepository,
        });

        // then
        expect(result).to.deep.equal({
          error: {
            notFound: 'administrationTeamName',
            availableValues: ['Équipe Alpha', 'Équipe Beta'],
          },
        });
      });
    });

    context('scenario 3: 422 forwarded', function () {
      it('forwards field errors as-is to the model', async function () {
        // given
        const fieldErrors = [
          { source: { pointer: '/data/attributes/name' }, title: 'Invalid Attribute', detail: 'Le nom est invalide.' },
          {
            source: { pointer: '/data/attributes/type' },
            title: 'Invalid Attribute',
            detail: "Le type n'est pas valide.",
          },
        ];

        const administrationTeamRepository = {
          findAll: async () => [{ id: 10, name: 'Équipe Alpha' }],
        };
        const organizationLearnerTypeRepository = {
          findAll: async () => [{ id: 20, name: 'Lycéens' }],
        };
        const countryRepository = {
          findAll: async () => [{ code: 99100, name: 'France' }],
        };
        const organizationRepository = {
          create: async () => ({
            status: 422,
            body: { errors: fieldErrors },
          }),
        };

        // when
        const result = await createOrganization({
          args: {
            name: 'Collège Jean-Moulin',
            type: 'SCO',
            administrationTeamName: 'Équipe Alpha',
            organizationLearnerTypeName: 'Lycéens',
            countryName: 'France',
          },
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
          organizationRepository,
        });

        // then
        expect(result).to.deep.equal({
          error: {
            status: 422,
            fieldErrors,
          },
        });
      });
    });

    context('scenario 4: simulate mode', function () {
      it('returns { id: null, name, simulated: true } without calling organizationRepository.create', async function () {
        // given
        let createCalled = false;
        const administrationTeamRepository = {
          findAll: async () => [{ id: 10, name: 'Équipe Alpha' }],
        };
        const organizationLearnerTypeRepository = {
          findAll: async () => [{ id: 20, name: 'Lycéens' }],
        };
        const countryRepository = {
          findAll: async () => [{ code: 99100, name: 'France' }],
        };
        const organizationRepository = {
          create: async () => {
            createCalled = true;
          },
        };

        // when
        const result = await createOrganization({
          args: {
            name: 'Collège Jean-Moulin',
            type: 'SCO',
            administrationTeamName: 'Équipe Alpha',
            organizationLearnerTypeName: 'Lycéens',
            countryName: 'France',
            simulate: true,
          },
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
          organizationRepository,
        });

        // then
        expect(result).to.deep.equal({ id: null, name: 'Collège Jean-Moulin', simulated: true });
        expect(createCalled).to.be.false;
      });
    });
  });
});
