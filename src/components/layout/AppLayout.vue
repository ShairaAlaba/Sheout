<script setup>
import { ref } from 'vue'

const themes = ['purple-lighten-4', 'blue-lighten-4', 'pink-lighten-4', 'green-lighten-4', 'dark']
const themeIndex = ref(0)
const theme = ref(themes[themeIndex.value])

function onClick() {
  themeIndex.value = (themeIndex.value + 1) % themes.length
  theme.value = themes[themeIndex.value]
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme" :class="`bg-${theme}`">
      <!-- Top Row for Theme Toggle Button -->
      <v-row class="pe-5 pt-4" justify="end">
        <v-btn
          :prepend-icon="theme === 'dark' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          elevation="9"
          @click="onClick"
          width="40px"
          :color="theme"
          class="border rounded-shaped"
        ></v-btn>
      </v-row>

      <!-- Main Content -->
      <v-main class="bg-bg">
        <v-container>
          <v-row>
            <slot name="content"></slot>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
