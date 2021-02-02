import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(certificationCenter) {
    return {
      certificationCenterMemberships: {
        related: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships`,
      },
    };
  },
});
