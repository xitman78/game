<script setup lang="ts">
import type { RemovedFigures } from './removed-figures';

const { model } = defineProps<{ model: RemovedFigures }>();
</script>

<template>
  <ui-item :model="model.root" />
</template>
