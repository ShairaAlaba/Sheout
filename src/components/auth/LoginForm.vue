<script setup>
import { ref } from 'vue'
import { requiredValidator, passwordValidator } from '@/components/utils/validator'

const form = ref(null)
const username = ref('')
const password = ref('')

const usernameRules = [
  requiredValidator,
  (value) => value.length >= 3 || 'Username must be at least 3 characters',
]

const passwordRules = [requiredValidator, passwordValidator]

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    // TODO: Implement login logic
    console.log('Form submitted:', { username: username.value, password: password.value })
  }
}
</script>

<template>
  <v-form ref="form" @submit.prevent="handleSubmit" fast-fail>
    <v-text-field
      v-model="username"
      :rules="usernameRules"
      label="Username"
      type="text"
      variant="outlined"
      required
    ></v-text-field>

    <v-text-field
      v-model="password"
      :rules="passwordRules"
      label="Password"
      type="password"
      variant="outlined"
      required
    ></v-text-field>

    <div class="d-flex justify-center">
      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          v-bind="props"
          :color="isHovering ? 'purple-darken-1' : undefined"
          class="mt-2 submit-button"
          type="submit"
          ripple
        >
          Login
        </v-btn>
      </v-hover>
    </div>
  </v-form>
  <v-divider class="mt-5"></v-divider>
  <h5 class="mt-2">
    Don't have an account?
    <RouterLink to="/register" class="text-decoration-none purple-link"> Register Here </RouterLink>
  </h5>
</template>

<style scoped>
.submit-button {
  background-color: #e1bee7;
}

.purple-link {
  color: #7e57c2;
}
</style>
