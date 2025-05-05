<script setup>
import { ref } from 'vue'
import { requiredValidator, passwordValidator } from '@/components/utils/validator'
import { useRouter } from 'vue-router'
import AlertNotication from '@/components/common/AlertNotificatio.vue'
import { formActionDefault, supabase } from '@/components/utils/supabase'

// Utilize pre-defined vue functions
const router = useRouter()

// Load Variables
const formDataDefault = {
  email: '',
  password: '',
}
const formData = ref({
  ...formDataDefault,
})
const formAction = ref({
  ...formActionDefault,
})
const isPasswordVisible = ref(false)
const refVForm = ref()

const onSubmit = async () => {
  // Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.value.email,
    password: formData.value.password,
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Logged Account.'
    // Redirect Acct to Dashboard
    router.replace('/dashboard')
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
}

const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <AlertNotication
    :formSuccessMessage="formAction.formSuccessMessage"
    :formErrorMessage="formAction.formErrorMessage"
  />
  <v-form ref="refVForm" @submit.prevent="onFormSubmit" fast-fail>
    <v-text-field
      prepend-inner-icon="mdi-email-outline"
      v-model="formData.email"
      label="Email"
      type="email"
      variant="outlined"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      :rules="[requiredValidator]"
      label="Password"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      variant="outlined"
    ></v-text-field>

    <div class="d-flex justify-center">
      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          v-bind="props"
          :color="isHovering ? 'purple-darken-1' : undefined"
          class="mt-2 submit-button"
          type="submit"
          ripple
          prepend-icon="mdi-login"
          :loading="formAction.formProcess"
          :disabled="formAction.formProcess"
          block
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
