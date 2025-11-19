import Badge from 'pix-admin/components/badges/badge';
<template>
  <Badge @targetProfile={{@model.targetProfile}} @badge={{@model.badge}} @onUpdateBadge={{@controller.updateBadge}} />
</template>
