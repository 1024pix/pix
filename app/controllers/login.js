import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),

  actions: {
    authenticate() {
      let { identification, password } = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:oauth2', identification, password).catch((response) => {
        if (response && response.errors && response.errors.length > 0) {
          const firstError = response.errors[0];
          switch (firstError.code) {
            case '403':
              this.set('errorMessage', 'Identifiants de connexion invalides');
              break;
            case '400':
              this.set('errorMessage', 'Syntaxe (de requête) invalide');
              break;
            default:
              this.set('errorMessage', 'Un problème est survenu');
              break;
          }
        }
      });
    }
  }
});
