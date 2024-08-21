import { LinkTo } from '@ember/routing';
<template>
  <span class="link-to-current-target-profile">
    Profil cible actuel:
    <LinkTo
      @route="authenticated.target-profiles.target-profile"
      @model={{@model.id}}
      class="link-to-current-target-profile__link"
    >
      {{@model.name}}
    </LinkTo>
  </span>
</template>
