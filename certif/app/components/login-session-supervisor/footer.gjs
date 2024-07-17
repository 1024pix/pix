import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';

<template>
  <div class='login-session-supervisor-page-content__current-user-email'>
    <span><FaIcon @icon='user-circle' />
      {{@currentUserEmail}}
    </span>
    <LinkTo class='login-session-supervisor-page-content__logout' @route='logout'>
      {{t 'pages.session-supervising.login.form.actions.switch-account'}}
    </LinkTo>
  </div>
</template>
