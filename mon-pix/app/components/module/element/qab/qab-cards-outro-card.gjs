import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { t } from 'ember-intl';

<template>
  <div class="element-qab-cards-outro-card">

    <div class="element-qab-cards-outro-card__header">
      <PixNotificationAlert class="element-qab-cards-outro-card__alert" @type="success" @withIcon="true">
        {{t "pages.modulix.flashcards.completed"}}
      </PixNotificationAlert>
    </div>

    <div class="element-qab-cards-outro-card__footer">
      Continuer le module 👇
    </div>
  </div>
</template>
