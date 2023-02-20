import { Serializer } from 'jsonapi-serializer';
import _ from 'lodash';

export default {
  serialize(challenges) {
    return new Serializer('challenge', {
      attributes: [
        'type',
        'instruction',
        'competence',
        'proposals',
        'timer',
        'illustrationUrl',
        'attachments',
        'competence',
        'embedUrl',
        'embedTitle',
        'embedHeight',
        'illustrationAlt',
        'format',
        'autoReply',
        'alternativeInstruction',
        'focused',
      ],
      transform: (record) => {
        const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

        challenge.competence = challenge.competenceId || 'N/A';

        return challenge;
      },
    }).serialize(challenges);
  },
};
