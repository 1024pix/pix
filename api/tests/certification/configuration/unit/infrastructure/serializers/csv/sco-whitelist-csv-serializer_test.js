import { CenterTypes } from '../../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { serialize } from '../../../../../../../src/certification/configuration/infrastructure/serializers/csv/sco-whitelist-csv-serializer.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Serializer | CSV | Certification | Configuration | sco-whitelist-csv-serializer', function () {
  it('returns all external ids as a string', async function () {
    // given
    const center = domainBuilder.certification.configuration.buildCenter({
      type: CenterTypes.SCO,
      externalId: 'SERIALIZED_EXTERNAL_ID',
    });

    // when
    const results = await serialize({ centers: [center] });

    // then
    const expectedResult = '\uFEFF' + '"externalId"\n' + '"SERIALIZED_EXTERNAL_ID"';
    expect(results).to.equal(expectedResult);
  });
});
