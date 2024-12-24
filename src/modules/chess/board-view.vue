<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { type Board } from './board';

const { model } = defineProps<{ model: Board }>();

const root = ref<HTMLElement>();
onMounted(() => model.mount(root.value!));
onBeforeUnmount(() => model.unmount());
</script>

<template>
  <div ref="root" class="absolute inset">
    <ui-item class="absolute inset" :model="model.root" />
  </div>
</template>

<style lang="scss">
.board-side {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.dark {
  fill: rgb(72 16 16);
  transition: fill var(--fast);
  &.hover { fill: rgb(99 22 22); }
}

.light {
  fill: rgb(128 128 128);
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
</style>
