import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <footer>
    <span class='footer__item'>
      <PixIcon @name='userCircle' @plainIcon={{true}} class='footer-item__icon' @ariaHidden={{true}} />
      {{@currentUserEmail}}
    </span>
    <LinkTo class='footer__logout' @route='logout'>
      {{t 'pages.session-supervising.login.form.actions.switch-account'}}
    </LinkTo>
  </footer>
</template>
