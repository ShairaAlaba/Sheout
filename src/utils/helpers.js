// 👉 Avatar Text Initials
export const getAvatarText = (name) => {
  const nameParts = name.trim().split(' ').filter(Boolean)

  const initials = nameParts.slice(0, 2).map((part) => part[0].toUpperCase())

  return initials.join('')
}

// 👉 Format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(value)
}

// 👉 Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// 👉 Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 👉 Generate random ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
