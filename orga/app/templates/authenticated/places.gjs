import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PlaceInfo from 'pix-orga/components/places/place-info';
import PlacesLotTable from 'pix-orga/components/places/places-lot-table';
import Statistics from 'pix-orga/components/places/statistics';
import Title from 'pix-orga/components/places/title';
<template>
  {{pageTitle (t "pages.places.title")}}

  <Title
    @placesLots={{@model.placesLots}}
    @occupied={{@model.statistics.occupied}}
    @total={{@model.statistics.total}}
  />
  <Statistics @model={{@model.statistics}} />
  <PlaceInfo @hasAnonymousSeat={{@model.statistics.hasAnonymousSeat}} />
  <PlacesLotTable @placesLots={{@model.placesLots}} />
</template>
