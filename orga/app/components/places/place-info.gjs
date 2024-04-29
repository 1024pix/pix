import PixBlock from '@1024pix/pix-ui/components/pix-block';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

function getParticipantsRoute(currentUser) {
  if (currentUser.isSCOManagingStudents) {
    return 'authenticated.sco-organization-participants';
  } else if (currentUser.isSUPManagingStudents) {
    return 'authenticated.sup-organization-participants';
  } else {
    return 'authenticated.organization-participants';
  }
}

<template>
  <PixBlock class="place-info">
    <img class="place-info__illustration" src="/icons/place-info.svg" alt="" role="none" />
    <div>
      <p class="place-info__description">
        <strong>{{t "cards.place-info.message"}}</strong>
        <span> {{t "cards.place-info.details"}}</span>
      </p>
      <LinkTo class="place-info__link" @route={{getParticipantsRoute @currentUser}}>
        {{t "cards.place-info.link"}}
      </LinkTo>
    </div>
  </PixBlock>
</template>
