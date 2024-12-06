<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { type Item } from '@/lib/reactive';

const { model } = defineProps<{ model: Item }>();
const root = ref();

onMounted(() => {
  model.mount(root.value);
});

onBeforeUnmount(() => {
  model.unmount();
});
</script>

<template>
  <template v-if="model.tag !== '#text'">
    <component
      :is="model.tag"
      ref="root"
      v-bind="model.attributes"
    >
      <ui-item
        v-for="item in model.items"
        :key="item.key"
        :model="item"
      />
    </component>
  </template>
  <template v-else>
    {{ model.text }}
  </template>
</template>
