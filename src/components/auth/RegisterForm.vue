<script setup>
import { ref } from 'vue'
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
} from '@/components/utils/validator'
import { formActionDefault, supabase } from '@/components/utils/supabase'
import { useRouter } from 'vue-router'
import AlertNotication from '@/components/common/AlertNotificatio.vue'
const router = useRouter()
// Load Variables
const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
}
const formData = ref({
  ...formDataDefault,
})
const formAction = ref({
  ...formActionDefault,
})
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

// Register Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.signUp({
    email: formData.value.email,
    password: formData.value.password,
    options: {
      data: {
        firstname: formData.value.firstname,
        lastname: formData.value.lastname,
        is_admin: false, // Just turn to true if super admin account
        // role: 'Administrator' // If role based; just change the string based on role
      },
    },
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Registered Account.'
    // Redirect Acct to Dashboard
    router.replace('/dashboard')
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
}

// Trigger Validators
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
      v-model="formData.firstname"
      label="Firstname"
      :rules="[requiredValidator]"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      v-model="formData.lastname"
      label="Lastname"
      :rules="[requiredValidator]"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      v-model="formData.email"
      label="Email"
      prepend-inner-icon="mdi-email-outline"
      :rules="[requiredValidator, emailValidator]"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      prepend-inner-icon="mdi-lock-outline"
      label="Password"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator, passwordValidator]"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      v-model="formData.password_confirmation"
      label="Password Confirmation"
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
      :rules="[
        requiredValidator,
        confirmedValidator(formData.password_confirmation, formData.password),
      ]"
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
          prepend-icon="mdi-account-plus"
          :disabled="formAction.formProcess"
          :loading="formAction.formProcess"
          block
        >
          Register
        </v-btn>
      </v-hover>
    </div>
  </v-form>
  <v-divider class="mt-5"></v-divider>
  <h5 class="mt-2">
    Already have an account?
    <RouterLink to="/" class="text-decoration-none purple-link"> Login Here </RouterLink>
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
