<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { type Board } from './board';

const { model } = defineProps<{ model: Board }>();

const root = ref();
onMounted(() => model.mount(root.value));
onBeforeUnmount(() => model.unmount());
</script>

<template>
  <div ref="root" class="absolute inset">
    <ui-item class="absolute inset" :model="model.root" />
  </div>
</template>

<style lang="scss">
.dark {
  fill: rgb(var(--dark));
  transition: fill var(--fast);
  &.hover { fill: rgb(27 40 232); }
}

.light {
  fill: rgb(var(--light));
  transition: fill var(--fast);
  &.hover { fill: rgb(160 160 160); }
}

.board-text {
  font-size: 0.20px;
  fill: rgb(var(--text));
}

.board-bg {
  fill: rgb(var(--bg));
}

.thin-border {
  stroke-width: 2px;
  stroke: rgb(var(--border));
  vector-effect: non-scaling-stroke;
}

.board-border {
  stroke: rgb(var(--border));
  fill: none;
}

.black { fill: black; }
.white { fill: white; }

#pick-white .white:hover,
#pick-black .black:hover {
  fill: darkred;
}

.highlighted-cell {
  stroke: rgb(255 255 255 / 0.5);
  stroke-width: 0.35;
  stroke-linecap: square;
  fill: none;
}
</style>
