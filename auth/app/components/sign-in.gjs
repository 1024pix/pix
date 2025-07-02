import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SignIn extends Component {
  @service authentication;

  @tracked email = 'superadmin@example.net';
  @tracked password = 'pix123';

  @action
  async handleSubmit(event) {
    event.preventDefault();
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    try {
      await this.authentication.authenticate(this.email, this.password);
    } catch (error) {
      console.error('Authentication failed:', error);
    }

    if (this.authentication.isAuthenticated) {
      console.log('Authentication successful');
      window.location = this.args.redirect_uri;
    } else {
      console.log('Authentication failed');
    }
  }

  @action
  onChangeEmail(event) {
    this.email = event.target.value;
  }

  @action
  onChangePassword(event) {
    this.password = event.target.value;
  }

  <template>
    <h1>Connexion à: {{@redirect_uri}}</h1>
    <form {{on "submit" this.handleSubmit}}>
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        name="email"
        placeholder="Email"
        value={{this.email}}
        {{on "input" this.onChangeEmail}}
      />

      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        name="password"
        placeholder="Password"
        value={{this.password}}
        {{on "input" this.onChangePassword}}
      />

      <button type="submit">Sign in</button>
    </form>
  </template>
}
