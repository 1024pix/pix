import PixFilterableAndSearchableSelect from '@1024pix/pix-ui/components/pix-filterable-and-searchable-select';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

<template>
  <Card class="admin-form__card" @title={{t "components.autonomous-course.new.technical-informations.title"}}>
    <PixInput
      class="form-field"
      @id="autonomousCourseName"
      required="true"
      @requiredLabel={{t "common.forms.mandatory"}}
      {{on "change" (fn @updateAutonomousCourseValue "internalTitle")}}
    >
      <:label>{{t "components.autonomous-course.new.technical-informations.label"}} :</:label>
    </PixInput>
    <PixFilterableAndSearchableSelect
      @placeholder={{t "components.autonomous-course.new.target-profile.placeholder"}}
      @options={{@targetProfileListOptions}}
      @hideDefaultOption={{true}}
      @onChange={{@selectTargetProfile}}
      @categoriesPlaceholder="Filtres"
      @value={{@autonomousCourse.targetProfileId}}
      @requiredLabel={{t "common.forms.mandatory"}}
      @errorMessage={{if @errors.autonomousCourse (t "api-error-messages.campaign-creation.target-profile-required")}}
      @isSearchable={{true}}
      @searchLabel={{t "components.autonomous-course.new.target-profile.search-label"}}
      @subLabel={{t "components.autonomous-course.new.target-profile.sub-label"}}
      required={{true}}
    >
      <:label>{{t "components.autonomous-course.new.target-profile.label"}}</:label>
      <:categoriesLabel>{{t "components.autonomous-course.new.target-profile.category-label"}}</:categoriesLabel>
    </PixFilterableAndSearchableSelect>
  </Card>
</template>
