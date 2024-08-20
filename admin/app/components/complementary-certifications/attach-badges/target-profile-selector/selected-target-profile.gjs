import PixButton from '@1024pix/pix-ui/components/pix-button';
import { LinkTo } from '@ember/routing';

<template>
  <div class="selected-target-profile-form-change">
    <span>Nouveau profil cible à rattacher :
      <LinkTo
        @route="authenticated.target-profiles.target-profile"
        @model={{@attachableTargetProfile.id}}
        class="selected-target-profile-form-change__link"
      >
        {{@attachableTargetProfile.name}}
      </LinkTo>
    </span>

    <div>
      <PixButton @size="small" @variant="secondary" @triggerAction={{@onChange}}>Changer
      </PixButton>
    </div>

    <input type="hidden" id="target-profile" name="target-profile" value="{{@attachableTargetProfile.id}}" />
  </div>
</template>
