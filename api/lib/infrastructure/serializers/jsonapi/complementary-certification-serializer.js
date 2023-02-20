import { Serializer } from 'jsonapi-serializer';
import ComplementaryCertification from '../../../domain/models/ComplementaryCertification';

export default {
  serialize(habilitation) {
    return new Serializer('habilitation', {
      attributes: ['label', 'key'],
    }).serialize(habilitation);
  },

  deserialize(jsonAPI) {
    return new ComplementaryCertification({
      id: jsonAPI.data.id,
      label: jsonAPI.data.attributes.label,
      key: jsonAPI.data.attributes.key,
    });
  },
};
