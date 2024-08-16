import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';

<template>
  <footer>
    <span><FaIcon @icon='user-circle' />
      {{@currentUserEmail}}
    </span>
    <LinkTo class='logout' @route='logout'>
      {{t 'pages.session-supervising.login.form.actions.switch-account'}}
    </LinkTo>
  </footer>
</template>
