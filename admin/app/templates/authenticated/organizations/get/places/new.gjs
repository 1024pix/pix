import pageTitle from 'ember-page-title/helpers/page-title';
import PlacesLotCreationForm from 'pix-admin/components/organizations/places-lot-creation-form';
<template>
  {{pageTitle "Orga " @model.organization.id " | Ajout des places"}}
  <PlacesLotCreationForm @create={{@controller.create}} @errors={{@controller.errors}} />
</template>
