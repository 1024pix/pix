import { concat } from '@ember/helper';

<template>
  <th
    class="{{if @size (concat 'table__column--' @size)}}{{if @align (concat ' table__column--' @align)}}"
    ...attributes
  >
    {{yield}}
  </th>
</template>
