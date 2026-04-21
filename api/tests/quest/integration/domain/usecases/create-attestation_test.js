import { usecases } from '../../../../../src/quest/domain/usecases/index.js';

import { knex } from '../../../../tooling/databases.js';
import { AttestationTemplateFixture } from '../../../../tooling/fixtures/index.js';
import { mockAttestationStorageUpload } from '../../../../tooling/mocks/attestation-storage.mock.js';

describe('Integration | Attestation | Domain | UseCases | create-attestation', function () {
  it('should create an attestation', async function () {
    // given
    const templateKey = 'key';
    const templateName = 'name';
    const templateFile = await AttestationTemplateFixture.getFile();
    const label = 'label';
    mockAttestationStorageUpload({ attestation: { templateName } });

    // when
    await usecases.createAttestation({ templateKey, templateName, templateFile, label });

    // then
    const result = await knex('attestations').where('key', templateKey);

    expect(result.length).to.equal(1);
    expect(result[0].key).to.equal(templateKey);
    expect(result[0].templateName).to.equal(templateName);
    expect(result[0].label).to.equal(label);
  });
});
