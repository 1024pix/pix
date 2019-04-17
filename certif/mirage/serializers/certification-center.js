import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(certificationCenter) {
    return {
      'sessions': {
        related: `/certification-centers/${certificationCenter.id}/sessions`
      }
    };
  }
});
