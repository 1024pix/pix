import Ember from 'ember';

export default Ember.Component.extend({

  classNames: [ 'signin-form-container' ],

  signin: null,
  email: '',
  password: '',

  actions: {
    submit() {
      this.get('onSubmit')(this.get('email'), this.get('password'));
    }
  }

});
