import { CreateAttestation } from '../../../../scripts/prod/create-attestations.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Script | Prod | Create attestations', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // when
      const script = new CreateAttestation();
      const { options, description, permanent } = script.metaInfo;
      expect(permanent).to.be.true;
      expect(description).to.equal('This script will insert an attestation with the given templateName and key');
      // then
      expect(options.templateName).to.deep.include({
        type: 'string',
        required: true,
      });
      expect(options.key).to.deep.include({
        type: 'string',
        required: true,
      });
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    let dependencies;

    beforeEach(async function () {
      script = new CreateAttestation();
      logger = { info: sinon.spy(), error: sinon.spy(), debug: sinon.spy() };

      await databaseBuilder.commit();
    });

    it('should create attestation with given templateName and key', async function () {
      // given
      const templateName = 'Mon attestation';
      const key = 'ATTESTATION';
      const options = { templateName, key };

      // when
      await script.handle({ options, logger, dependencies });

      // then
      const attestation = await knex('attestations').where('key', key);

      expect(attestation[0].templateName).to.equal(templateName);
      expect(attestation[0].key).to.equal(key);
      expect(logger.info).to.have.been.calledWith(
        { event: 'CreateAttestation' },
        `Successfully inserted attestation with templateName ${templateName}, key ${key}, id ${attestation[0].id}`,
      );
    });
  });
});
