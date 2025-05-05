<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout>
    <template #content>
      <h1>Dashboard</h1>
    </template>
  </DashboardLayout>
</template>
