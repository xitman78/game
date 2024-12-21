<script setup lang="ts">
import type { FigureSelector } from './figure-selector';
import type { Type } from './types';

const { model } = defineProps<{ model: FigureSelector }>();

const types: Type[] = ['rook', 'knight', 'bishop', 'queen'];
</script>

<template>
  <div class="flex absolute inset ai-center jc-center gap-4">
    <ui-button v-for="(item, index) in model.images" :key="index" class="figure-button" @click="model.select(types[index])">
      <div>
        <ui-item class="figure" :model="item" />
      </div>
    </ui-button>
  </div>
</template>

<style lang="scss">
.figure-button {
  display: flex;
  border: 1px solid rgb(var(--border));
}
.figure {
  width: 5em;
  height: 5em;
}
</style>
