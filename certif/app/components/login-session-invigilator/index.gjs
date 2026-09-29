import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import LoginSessionInvigilatorForm from './form';

export default class LoginSessionInvigilator extends Component {
  @service intl;

  <template>
    <div class='login-session-invigilator'>
      <main class='login-session-invigilator__main'>
        <header class='login-session-invigilator__header'>
          <img src='/illu-espace-surveillant.svg' alt='' />
          <h1>{{t 'pages.session-supervising.login.form.title'}}</h1>
          <h2>{{t 'pages.session-supervising.login.form.sub-title'}}</h2>
          <p>{{t 'common.form-errors.mandatory-all-fields'}}</p>
        </header>

        <LoginSessionInvigilatorForm @authenticateInvigilator={{@authenticateInvigilator}} />

        <footer class='login-session-invigilator__footer'>
          <span class='user'>
            <PixIcon @name='userCircle' @plainIcon={{true}} class='footer-item__icon' @ariaHidden={{true}} />
            {{@currentUserEmail}}
          </span>
          <PixButtonLink class='logout-link' @route='logout' @variant='tertiary'>
            {{t 'pages.session-supervising.login.form.actions.switch-account'}}
          </PixButtonLink>
        </footer>
      </main>
    </div>
  </template>
}
