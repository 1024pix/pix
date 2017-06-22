import Ember from 'ember';

export default Ember.Component.extend({

  classNames: [ 'signin-form-container' ],

  displayErrorMessage: false,
  signin: null,
  email: '',
  password: '',

  actions: {
    submit() {
      this.set('displayErrorMessage', false);
      this.get('onSubmit')(this.get('email'), this.get('password'))
        .catch(() => {
          this.set('displayErrorMessage', true);
        });
    }
  }

});
