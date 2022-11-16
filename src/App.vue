<template>
  <TestScene />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TestScene from './components/TestScene.vue'

export default defineComponent({
  name: 'App',
  components: {
    TestScene,
  },
})
</script>
