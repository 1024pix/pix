import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(certificationCenter) {
    return {
      'sessions': {
        related: `/api/certification-centers/${certificationCenter.id}/sessions`
      }
    };
  }
});
