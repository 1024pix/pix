import List from 'pix-orga/components/catalogue/list';

<template>
  <List
    @courses={{@model.courses}}
    @type={{@model.type}}
    @updateFilter={{@controller.updateFilter}}
    @resetFilters={{@controller.resetFilters}}
    @search={{@controller.search}}
    @category={{@controller.category}}
    @areas={{@controller.areas}}
    @competences={{@controller.competences}}
    @currentCourse={{@model.currentCourse}}
    @hasBlueprints={{@model.hasBlueprints}}
  />
</template>
