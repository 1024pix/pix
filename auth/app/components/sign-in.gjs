import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

export default class SignIn extends Component {
  @service session;

  @tracked email = '';
  @tracked password = '';

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    await this.session.authenticate(
      'authenticator:oauth2',
      this.email,
      this.password,
    );
  };

  onChangeEmail = (event) => {
    this.email = event.target.value;
  };

  onChangePassword = (event) => {
    this.password = event.target.value;
  };

  <template>
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
