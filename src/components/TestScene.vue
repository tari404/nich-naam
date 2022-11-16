<template>
  <div class="menu">
    <button @click="record">record</button>
    <button @click="test">test</button>
    <p class="log">{{ log }}</p>
  </div>
  <section ref="canvas" class="canvas-body"></section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MainStage from '@/lib/Main'

const stage = new MainStage()

export default defineComponent({
  name: 'TestScene',
  data() {
    return {
      log: '',
    }
  },
  mounted() {
    const body = this.$refs.canvas as Element
    body.appendChild(stage.domElement)

    stage.resize(window.innerWidth, window.innerHeight)
    stage.initTestScene()
    stage.start()
  },
  beforeUnmount() {
    stage.dispose()
  },
  methods: {
    record() {
      const suffix = stage.record()
      if (suffix) {
        this.log = 'record next 5 second'
      } else {
        this.log = 'unable to record'
      }
    },
    test() {
      const types = [
        ['video/webm', '.webm'],
        ['video/quicktime', '.mov'],
        ['video/ogg', '.ogg'],
        ['video/mp4', '.mp4'],
      ]

      const checked = types.map((item) => [
        ...item,
        MediaRecorder.isTypeSupported(item[0]),
      ])

      const selected = checked.find((item) => item[2])

      let log = checked
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([type, _, supported]) => (supported ? '✔ ' : '✖ ') + type)
        .join('\n')

      if (selected) {
        log += `\nSelected: ${selected[1]}`
      }

      this.log = log

      return selected
    },
  },
})
</script>

<style lang="stylus" scoped>
.menu
  position absolute
  top 10px
  left 10px
  display flex
  flex-direction column
  gap 6px
  button
    width fit-content
  .log
    font-size 14px
    line-height 20px
    color #fff
    white-space pre-wrap
</style>
