import { listReferenceValues } from '../../../../src/mcp-admin-server/domain/usecases/list-reference-values.js';
import { expect } from '../../../test-helper.js';

describe('McpAdminServer | Integration | Domain | Usecases | listReferenceValues', function () {
  describe('#listReferenceValues', function () {
    let administrationTeamRepository;
    let organizationLearnerTypeRepository;
    let countryRepository;

    beforeEach(function () {
      administrationTeamRepository = {
        findAll: async () => [
          { id: 10, name: 'Équipe Alpha' },
          { id: 11, name: 'Équipe Beta' },
        ],
      };
      organizationLearnerTypeRepository = {
        findAll: async () => [
          { id: 20, name: 'Lycéens' },
          { id: 21, name: 'Adultes' },
        ],
      };
      countryRepository = {
        findAll: async () => [
          { code: 99100, name: 'France' },
          { code: 99401, name: 'Espagne' },
        ],
      };
    });

    context('target: organization:type', function () {
      it('returns static type values without calling any repository', async function () {
        // when
        const result = await listReferenceValues({
          target: 'organization:type',
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
        });

        // then
        expect(result).to.deep.equal({
          target: 'organization:type',
          values: [{ value: 'SCO' }, { value: 'SUP' }, { value: 'PRO' }, { value: 'SCO-1D' }],
        });
      });
    });

    context('target: organization:administrationTeamName', function () {
      it('returns administration team names from repository', async function () {
        // when
        const result = await listReferenceValues({
          target: 'organization:administrationTeamName',
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
        });

        // then
        expect(result).to.deep.equal({
          target: 'organization:administrationTeamName',
          values: [{ value: 'Équipe Alpha' }, { value: 'Équipe Beta' }],
        });
      });
    });

    context('target: organization:organizationLearnerTypeName', function () {
      it('returns organization learner type names from repository', async function () {
        // when
        const result = await listReferenceValues({
          target: 'organization:organizationLearnerTypeName',
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
        });

        // then
        expect(result).to.deep.equal({
          target: 'organization:organizationLearnerTypeName',
          values: [{ value: 'Lycéens' }, { value: 'Adultes' }],
        });
      });
    });

    context('target: organization:countryName', function () {
      it('returns country names from repository', async function () {
        // when
        const result = await listReferenceValues({
          target: 'organization:countryName',
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
        });

        // then
        expect(result).to.deep.equal({
          target: 'organization:countryName',
          values: [{ value: 'France' }, { value: 'Espagne' }],
        });
      });
    });

    context('target: unknown', function () {
      it('returns an error with known targets', async function () {
        // when
        const result = await listReferenceValues({
          target: 'organization:unknownField',
          administrationTeamRepository,
          organizationLearnerTypeRepository,
          countryRepository,
        });

        // then
        expect(result).to.deep.include({
          target: 'organization:unknownField',
          error: 'unknown target',
        });
        expect(result.knownTargets).to.include('organization:type');
        expect(result.knownTargets).to.include('organization:administrationTeamName');
      });
    });
  });
});
