import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

<template>
  <Card class="admin-form__card" @title={{t "components.autonomous-courses.new.user-information.title"}}>
    <PixInput
      @id="nom-public"
      class="form-field"
      placeholder={{t "components.autonomous-courses.new.user-information.public-name.placeholder"}}
      required={{true}}
      @requiredLabel={{t "common.forms.mandatory"}}
      maxlength="50"
      @subLabel={{t "components.autonomous-courses.new.user-information.public-name.sub-label"}}
      {{on "change" (fn @updateAutonomousCourseValue "publicTitle")}}
    >
      <:label>{{t "components.autonomous-courses.new.user-information.public-name.label" htmlSafe=true}}
        :</:label>
    </PixInput>
    <PixTextarea
      @id="text-page-accueil"
      class="form-field"
      @maxlength="5000"
      placeholder={{t "components.autonomous-courses.new.user-information.homepage.placeholder"}}
      {{on "change" (fn @updateAutonomousCourseValue "customLandingPageText")}}
    >
      <:label>{{t "components.autonomous-courses.new.user-information.homepage.label"}} :</:label>
    </PixTextarea>
  </Card>
</template>
