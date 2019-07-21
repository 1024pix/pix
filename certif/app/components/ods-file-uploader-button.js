import Component from '@ember/component';

export default Component.extend({

  actions: {
    uploadOdsFile(odsFile) {
      const authSession = JSON.parse(localStorage['ember_simple_auth-session']);
      const access_token = authSession['authenticated']['access_token'];
      odsFile.upload(this.session.urlToUpload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }).then((_response) => console.log('ok'))
        .catch((_error) => console.log('ko'));
    },
  }
});
