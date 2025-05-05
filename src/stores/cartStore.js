import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State
  const cartItems = ref([])
  const isCartOpen = ref(false)
  
  // Getters
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })
  
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })
  
  // Actions
  const addToCart = (item, quantity = 1) => {
    const existingItem = cartItems.value.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity
    } else {
      // Add new item to cart
      cartItems.value.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: quantity,
        seller_id: item.seller_id
      })
    }
    
    // Open cart when adding items
    isCartOpen.value = true
    
    // Save cart to localStorage
    saveCart()
  }
  
  const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex(item => item.id === itemId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
      saveCart()
    }
  }
  
  const updateQuantity = (itemId, quantity) => {
    const item = cartItems.value.find(item => item.id === itemId)
    if (item) {
      item.quantity = quantity
      saveCart()
    }
  }
  
  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }
  
  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }
  
  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  }
  
  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart)
    }
  }
  
  // Initialize cart from localStorage
  loadCart()
  
  return {
    cartItems,
    isCartOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    loadCart
  }
})
