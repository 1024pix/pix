import { PixBlock } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

<template>
  <PixBlock class="empty-state" @variant="orga">
    <img src="{{this.rootURL}}/images/empty-state-activity.svg" alt="" role="none" />

    <div class="empty-state__text">
      <p>{{t
          "pages.organization-learner.activity.empty-state"
          organizationLearnerFirstName=(capitalize @firstName)
          organizationLearnerLastName=(capitalize @lastName)
        }}</p>
    </div>
  </PixBlock>
</template>
