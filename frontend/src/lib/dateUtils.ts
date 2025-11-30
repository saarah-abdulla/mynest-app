/**
 * Format a date string to dd/mm/yyyy format
 */
export function formatDateDDMMYYYY(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Format a date string to dd/mm/yyyy format with optional time
 */
export function formatDateTimeDDMMYYYY(dateString: string | Date, includeTime: boolean = false): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  let formatted = `${day}/${month}/${year}`
  
  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    formatted += ` ${hours}:${minutes}`
  }

  return formatted
}



