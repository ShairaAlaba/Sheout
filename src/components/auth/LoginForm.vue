<script setup>
import { ref, onMounted } from 'vue'
import { requiredValidator, passwordValidator } from '@/utils/validator'
import { useRouter, useRoute } from 'vue-router'
import AlertNotication from '@/components/common/AlertNotificatio.vue'
import { formActionDefault, supabase } from '@/utils/supabase'

// Utilize pre-defined vue functions
const router = useRouter()
const route = useRoute()

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
const redirectPath = ref(null)

// Check for redirect parameter in URL
onMounted(() => {
  if (route.query.redirect) {
    redirectPath.value = route.query.redirect
  }
})

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

    // Redirect to intended destination or dashboard
    if (redirectPath.value) {
      router.replace(redirectPath.value)
    } else {
      router.replace('/dashboard')
    }
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

const onRegisterClick = () => {
  // Pass along the redirect if it exists
  if (redirectPath.value) {
    router.push({
      name: 'register',
      query: { redirect: redirectPath.value },
    })
  } else {
    router.push('/register')
  }
}
</script>

<template>
  <v-form ref="refVForm" @submit.prevent="onFormSubmit">
    <AlertNotication
      :error-message="formAction.formErrorMessage"
      :success-message="formAction.formSuccessMessage"
    ></AlertNotication>

    <v-text-field
      v-model="formData.email"
      class="mb-3"
      density="comfortable"
      label="Email"
      type="email"
      variant="outlined"
      prepend-inner-icon="mdi-email-outline"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      class="mb-3"
      density="comfortable"
      label="Password"
      variant="outlined"
      prepend-inner-icon="mdi-lock-outline"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      :rules="[requiredValidator, passwordValidator]"
      :type="isPasswordVisible ? 'text' : 'password'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
    ></v-text-field>

    <div class="d-flex flex-column">
      <v-btn
        :loading="formAction.formProcess"
        block
        class="mt-2 text-white"
        color="pink"
        size="large"
        type="submit"
        variant="flat"
        prepend-icon="mdi-login"
      >
        Sign In
      </v-btn>

      <div class="mt-4 text-center">
        <span>Don't have an account?</span>
        <v-btn class="ms-2 text-pink" variant="text" @click="onRegisterClick">Sign Up</v-btn>
      </div>
    </div>
  </v-form>
</template>

<style scoped>
.text-pink {
  color: #ff69b4;
}
</style>
