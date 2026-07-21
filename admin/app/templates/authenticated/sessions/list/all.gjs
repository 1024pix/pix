import ListItems from 'pix-admin/components/sessions/list-items';
<template>
  <ListItems
    @sessions={{@controller.model}}
    @filters={{@controller.filters}}
    @triggerFiltering={{@controller.triggerFiltering}}
    @onChangeFilter={{@controller.updateSelectFilter}}
  />
</template>
