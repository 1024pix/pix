import bluebird from 'bluebird';
import jsonapiSerializer from 'jsonapi-serializer';

import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../shared/infrastructure/constants.js';

const { Deserializer } = jsonapiSerializer;

const deserialize = async function (json) {
  const deserialize = new Deserializer({ keyForAttribute: 'camelCase' });

  const deserializedComplementaryCertification = await deserialize.deserialize(json);

  const { complementaryCertificationBadges: complementaryCertificationBadgesToDeserialize } =
    deserializedComplementaryCertification;

  deserializedComplementaryCertification.complementaryCertificationBadges = await bluebird.map(
    complementaryCertificationBadgesToDeserialize,
    async (complementaryCertificationBadgesToDeserialize) =>
      await deserialize.deserialize(complementaryCertificationBadgesToDeserialize),
    { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
  );

  return deserializedComplementaryCertification;
};

export { deserialize };
