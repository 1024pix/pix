const { PassThrough } = require('stream');

const { expect, sinon, streamToPromise } = require('../../../test-helper');

const { NotFoundError } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | write-organization-shared-profiles-as-csv-to-stream', () => {

  let dependencies;

  beforeEach(() => {
    // given
    dependencies = {
      organizationRepository: { async get(id) { return { id, type: 'PRO' }; } },
      competenceRepository: { async list() { return [ { index: '1.1' }, { index: '1.2' }]; } },
      snapshotRepository: {
        async find({ filter, page }) {
          expect(page.size).to.equal(200);
          return page.number <= 2
            ? { models: [
              `orga${filter.organizationId}-page${page.number}-user1`,
              `orga${filter.organizationId}-page${page.number}-user2`,
            ] }
            : { models: [] };
        }
      },
      snapshotsCsvConverter: {
        generateHeader(organization, competences) {
          return `csv-header-orga${organization.id}-${competences.map((c)=>c.index)}\n`;
        },

        convertJsonToCsv(jsonSnapshots) {
          return 'csv-' + JSON.stringify(jsonSnapshots) + '\n';
        }
      }
    };
  });

  context('[interactions]', () => {

    it('should convert the profiles into CSV format as a stream', async () => {
      // when
      const stream = new PassThrough();
      const csvPromise = streamToPromise(stream);

      await usecases.writeOrganizationSharedProfilesAsCsvToStream({
        ...dependencies,
        organizationId: 123,
        writableStream: stream
      });

      // then
      const csv = await csvPromise;
      expect(csv.split('\n')).to.deep.equal([
        'csv-header-orga123-1.1,1.2',
        'csv-["orga123-page1-user1","orga123-page1-user2"]',
        'csv-["orga123-page2-user1","orga123-page2-user2"]',
        ''
      ]);
    });
  });

  context('[errors]', () => {

    it('should reject with a "NotFoundError" instance, when organization ID is unknown', () => {
      // given
      dependencies.organizationRepository.get = sinon.stub().rejects(new NotFoundError('Not found organization for ID 1234'));

      //when
      const promise = usecases.writeOrganizationSharedProfilesAsCsvToStream({
        ...dependencies,
        organizationId: 123,
        writableStream: null
      });

      // then
      return promise.then(() => {
        expect.fail('Treatment did not throw an error as expected', 'Expected a "NotFoundError" to have been throwed');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(NotFoundError);
      });
    });

    it('should abort stream on error', async () => {
      // given
      dependencies.snapshotRepository.find = () => Promise.reject(new Error('failure'));

      // when
      const stream = new PassThrough();
      const csvPromise = streamToPromise(stream);

      await usecases.writeOrganizationSharedProfilesAsCsvToStream({
        ...dependencies,
        organizationId: 123,
        writableStream: stream
      });

      // then
      return expect(csvPromise).to.be.rejected
        .and.eventually.to.have.property('message', 'failure');
    });
  });
});
