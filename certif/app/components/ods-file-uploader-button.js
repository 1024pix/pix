import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  certificationCandidatesImporter: service(),

  actions: {
    uploadOdsFile(odsFile) {
      const authSession = JSON.parse(localStorage['ember_simple_auth-session']);
      const access_token = authSession['authenticated']['access_token'];
      odsFile.upload(this.session.urlToUpload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }).then((response) => this.certificationCandidatesImporter.handleCertificationCandidatesImport(this.session, response.body.data))
        .catch((_error) => {
          this.certificationCandidatesImporter.displayFileParsingError();
        });
    },
  }
});
