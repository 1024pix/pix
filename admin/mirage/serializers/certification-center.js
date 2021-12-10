import { JSONAPISerializer } from 'ember-cli-mirage';

const include = ['habilitations'];

export default JSONAPISerializer.extend({
  include,
  links(certificationCenter) {
    return {
      certificationCenterMemberships: {
        related: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships`,
      },
    };
  },
});
