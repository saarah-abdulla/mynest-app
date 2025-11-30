import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { api } from '../lib/api'
import type { JournalEntry, Child } from '../types/entities'
import { useAuth } from '../contexts/AuthContext'

interface JournalFormModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: JournalEntry | null
  children: Child[]
  onSuccess: () => void
}

const moods: Array<JournalEntry['mood']> = ['happy', 'calm', 'tired', 'fussy']

export function JournalFormModal({
  isOpen,
  onClose,
  entry,
  children,
  onSuccess,
}: JournalFormModalProps) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'parent' | 'caregiver' | null>(null)

  // Fetch user role and ID
  useEffect(() => {
    async function fetchUserInfo() {
      if (!currentUser) return
      try {
        const users = await api.listUsers()
        const currentUserData = users.find((u) => u.email === currentUser.email)
        if (currentUserData) {
          setUserRole(currentUserData.role)
        } else {
          setUserRole('parent') // Default to parent if not found
        }
      } catch (err) {
        console.error('Error fetching user info:', err)
        setUserRole('parent')
      }
    }
    fetchUserInfo()
  }, [currentUser])

  const isCaregiver = userRole === 'caregiver'
  // For caregivers editing medication entries, only allow status updates
  const isCaregiverEditingMedication = Boolean(isCaregiver && entry && entry.medication)

  const [childId, setChildId] = useState('')
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<JournalEntry['mood'] | ''>('')
  
  // Step management - show category selection first
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<'categories' | 'details'>('categories')
  
  // Meal tracking with date and time
  const [meals, setMeals] = useState({
    breakfast: { eaten: false, notes: '', date: '', time: '' },
    lunch: { eaten: false, notes: '', date: '', time: '' },
    dinner: { eaten: false, notes: '', date: '', time: '' },
    snacks: { eaten: false, notes: '', date: '', time: '' },
  })
  
  // Nap tracking with date
  const [naps, setNaps] = useState<Array<{ date: string; startTime: string; endTime: string; quality?: string }>>([])
  const [newNap, setNewNap] = useState({ date: '', startTime: '', endTime: '', quality: '' })
  
  // Activities with date and time
  const [activities, setActivities] = useState({
    playTime: false,
    outdoorTime: false,
    bathTime: false,
    other: false,
    otherText: '',
    activityDate: '',
    activityTime: '',
  })
  
  // Medication tracking (comprehensive)
  const [medication, setMedication] = useState({
    name: '',
    amount: '',
    frequency: 'every-4-hours' as 'every-4-hours' | 'every-6-hours' | 'every-8-hours' | 'every-12-hours' | 'once-daily' | 'twice-daily' | 'three-times-daily',
    startDate: '',
    startTime: '',
    endDate: '',
    status: 'pending' as 'pending' | 'given' | 'missed',
    givenDate: '',
    givenTime: '',
  })

  // Frequency options for dropdown
  const frequencyOptions = [
    { value: 'every-4-hours', label: 'Every 4 hours' },
    { value: 'every-6-hours', label: 'Every 6 hours' },
    { value: 'every-8-hours', label: 'Every 8 hours' },
    { value: 'every-12-hours', label: 'Every 12 hours' },
    { value: 'once-daily', label: 'Once daily' },
    { value: 'twice-daily', label: 'Twice daily (Morning & Evening)' },
    { value: 'three-times-daily', label: 'Three times daily (Morning, Afternoon, Evening)' },
  ]

  // Function to generate medication schedule times
  const generateMedicationSchedule = (
    startDate: string,
    startTime: string,
    endDate: string,
    frequency: string
  ): Array<{ date: string; time: string }> => {
    if (!startDate || !startTime || !endDate) return []

    const schedule: Array<{ date: string; time: string }> = []
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T23:59:59`)

    if (start > end) return []

    let current = new Date(start)

    switch (frequency) {
      case 'every-4-hours':
        while (current <= end) {
          schedule.push({
            date: current.toISOString().split('T')[0],
            time: current.toTimeString().slice(0, 5),
          })
          current = new Date(current.getTime() + 4 * 60 * 60 * 1000) // Add 4 hours
        }
        break

      case 'every-6-hours':
        while (current <= end) {
          schedule.push({
            date: current.toISOString().split('T')[0],
            time: current.toTimeString().slice(0, 5),
          })
          current = new Date(current.getTime() + 6 * 60 * 60 * 1000) // Add 6 hours
        }
        break

      case 'every-8-hours':
        while (current <= end) {
          schedule.push({
            date: current.toISOString().split('T')[0],
            time: current.toTimeString().slice(0, 5),
          })
          current = new Date(current.getTime() + 8 * 60 * 60 * 1000) // Add 8 hours
        }
        break

      case 'every-12-hours':
        while (current <= end) {
          schedule.push({
            date: current.toISOString().split('T')[0],
            time: current.toTimeString().slice(0, 5),
          })
          current = new Date(current.getTime() + 12 * 60 * 60 * 1000) // Add 12 hours
        }
        break

      case 'once-daily':
        while (current <= end) {
          schedule.push({
            date: current.toISOString().split('T')[0],
            time: current.toTimeString().slice(0, 5),
          })
          current = new Date(current.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
          current.setHours(start.getHours(), start.getMinutes(), 0, 0) // Reset to start time
        }
        break

      case 'twice-daily': {
        // Morning (9 AM) and Evening (9 PM)
        const morningHour = 9
        const eveningHour = 21
        let day = new Date(start)
        while (day <= end) {
          // Morning dose
          const morning = new Date(day)
          morning.setHours(morningHour, start.getMinutes(), 0, 0)
          if (morning >= start && morning <= end) {
            schedule.push({
              date: morning.toISOString().split('T')[0],
              time: morning.toTimeString().slice(0, 5),
            })
          }
          // Evening dose
          const evening = new Date(day)
          evening.setHours(eveningHour, start.getMinutes(), 0, 0)
          if (evening >= start && evening <= end) {
            schedule.push({
              date: evening.toISOString().split('T')[0],
              time: evening.toTimeString().slice(0, 5),
            })
          }
          day = new Date(day.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
        break
      }

      case 'three-times-daily': {
        // Morning (9 AM), Afternoon (2 PM), Evening (8 PM)
        const morningHour = 9
        const afternoonHour = 14
        const eveningHour = 20
        let day = new Date(start)
        while (day <= end) {
          // Morning dose
          const morning = new Date(day)
          morning.setHours(morningHour, start.getMinutes(), 0, 0)
          if (morning >= start && morning <= end) {
            schedule.push({
              date: morning.toISOString().split('T')[0],
              time: morning.toTimeString().slice(0, 5),
            })
          }
          // Afternoon dose
          const afternoon = new Date(day)
          afternoon.setHours(afternoonHour, start.getMinutes(), 0, 0)
          if (afternoon >= start && afternoon <= end) {
            schedule.push({
              date: afternoon.toISOString().split('T')[0],
              time: afternoon.toTimeString().slice(0, 5),
            })
          }
          // Evening dose
          const evening = new Date(day)
          evening.setHours(eveningHour, start.getMinutes(), 0, 0)
          if (evening >= start && evening <= end) {
            schedule.push({
              date: evening.toISOString().split('T')[0],
              time: evening.toTimeString().slice(0, 5),
            })
          }
          day = new Date(day.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
        break
      }
    }

    return schedule
  }
  
  // Mood with required mood and optional details
  const [moodDetails, setMoodDetails] = useState('')
  
  const activityCategories = [
    { id: 'meals', label: 'Meals', icon: '🍽️', description: 'Track breakfast, lunch, dinner, and snacks' },
    { id: 'naps', label: 'Naps', icon: '😴', description: 'Log nap times and quality' },
    { id: 'activities', label: 'Activities', icon: '🎨', description: 'Play time, outdoor time, bath time, other' },
    { id: 'medication', label: 'Medication', icon: '💊', description: 'Record medications and track status' },
    { id: 'notes', label: 'Notes', icon: '📝', description: 'Additional observations' },
    { id: 'mood', label: 'Mood', icon: '😊', description: 'How the child is feeling' },
  ]
  
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentStep('details')
  }
  
  const backToCategories = () => {
    setCurrentStep('categories')
    setSelectedCategory('')
  }

  useEffect(() => {
    if (entry) {
      setChildId(entry.childId)
      setNote(entry.note)
      setMood(entry.mood || '')
      setMoodDetails(entry.moodDetails || '')
      setCurrentStep('details')
      
      // Check for structured data first (medication, meals, naps, activities)
      if (entry.medication) {
        setSelectedCategory('medication')
        // Load medication data from entry
        const medicationArray = Array.isArray(entry.medication) ? entry.medication : [entry.medication]
        if (medicationArray.length > 0) {
          const med = medicationArray[0]
          // Find the frequency option that matches
          const frequencyValue = frequencyOptions.find(opt => 
            opt.label === med.frequency || opt.value === med.frequency
          )?.value || 'every-4-hours'
          
          setMedication({
            name: med.name || '',
            amount: med.amount || '',
            frequency: frequencyValue as typeof medication.frequency,
            startDate: med.startDate || '',
            startTime: med.startTime || '',
            endDate: med.endDate || '',
            status: med.status || 'pending',
            givenDate: med.givenDate || '',
            givenTime: med.givenTime || '',
          })
        }
      } else if (entry.meals) {
        setSelectedCategory('meals')
        // Load meals data
        const mealsData = entry.meals as any
        setMeals({
          breakfast: {
            eaten: mealsData.breakfast?.eaten || false,
            notes: mealsData.breakfast?.notes || '',
            date: mealsData.breakfast?.date || '',
            time: mealsData.breakfast?.time || '',
          },
          lunch: {
            eaten: mealsData.lunch?.eaten || false,
            notes: mealsData.lunch?.notes || '',
            date: mealsData.lunch?.date || '',
            time: mealsData.lunch?.time || '',
          },
          dinner: {
            eaten: mealsData.dinner?.eaten || false,
            notes: mealsData.dinner?.notes || '',
            date: mealsData.dinner?.date || '',
            time: mealsData.dinner?.time || '',
          },
          snacks: {
            eaten: mealsData.snacks?.eaten || false,
            notes: mealsData.snacks?.notes || '',
            date: mealsData.snacks?.date || '',
            time: mealsData.snacks?.time || '',
          },
        })
      } else if (entry.naps && Array.isArray(entry.naps) && entry.naps.length > 0) {
        setSelectedCategory('naps')
        setNaps(entry.naps)
      } else if (entry.activities) {
        setSelectedCategory('activities')
        const activitiesData = entry.activities as any
        setActivities({
          playTime: activitiesData.playTime || false,
          outdoorTime: activitiesData.outdoorTime || false,
          bathTime: activitiesData.bathTime || false,
          other: activitiesData.other || false,
          otherText: activitiesData.otherText || '',
          activityDate: activitiesData.activityDate || '',
          activityTime: activitiesData.activityTime || '',
        })
      } else if (entry.mood) {
        setSelectedCategory('mood')
      } else {
        // For editing, try to detect category from note content
        // Default to 'notes' if can't determine
        if (entry.note.toLowerCase().includes('meal')) {
          setSelectedCategory('meals')
        } else if (entry.note.toLowerCase().includes('nap')) {
          setSelectedCategory('naps')
        } else {
          setSelectedCategory('notes')
        }
      }
    } else {
      setChildId(children[0]?.id || '')
      setNote('')
      setMood('')
      setMoodDetails('')
      setCurrentStep('categories')
      setSelectedCategory('')
      setMeals({
        breakfast: { eaten: false, notes: '', date: '', time: '' },
        lunch: { eaten: false, notes: '', date: '', time: '' },
        dinner: { eaten: false, notes: '', date: '', time: '' },
        snacks: { eaten: false, notes: '', date: '', time: '' },
      })
      setNaps([])
      setNewNap({ date: '', startTime: '', endTime: '', quality: '' })
      setActivities({
        playTime: false,
        outdoorTime: false,
        bathTime: false,
        other: false,
        otherText: '',
        activityDate: '',
        activityTime: '',
      })
      setMedication({
        name: '',
        amount: '',
        frequency: 'every-4-hours',
        startDate: '',
        startTime: '',
        endDate: '',
        status: 'pending',
        givenDate: '',
        givenTime: '',
      })
    }
    setError(null)
  }, [entry, isOpen, children])
  
  const addNap = () => {
    if (newNap.date && newNap.startTime && newNap.endTime) {
      setNaps([...naps, { ...newNap, quality: newNap.quality || undefined }])
      setNewNap({ date: '', startTime: '', endTime: '', quality: '' })
    }
  }
  
  const removeNap = (index: number) => {
    setNaps(naps.filter((_, i) => i !== index))
  }
  
  const buildActivityNote = () => {
    const parts: string[] = []
    
    // Meals
    if (selectedCategory === 'meals') {
      const mealParts: string[] = []
      if (meals.breakfast.eaten) {
        const dateTime = meals.breakfast.date && meals.breakfast.time 
          ? ` (${meals.breakfast.date} at ${meals.breakfast.time})`
          : meals.breakfast.date ? ` (${meals.breakfast.date})` : ''
        mealParts.push(`Breakfast${dateTime}${meals.breakfast.notes ? `: ${meals.breakfast.notes}` : ''}`)
      }
      if (meals.lunch.eaten) {
        const dateTime = meals.lunch.date && meals.lunch.time 
          ? ` (${meals.lunch.date} at ${meals.lunch.time})`
          : meals.lunch.date ? ` (${meals.lunch.date})` : ''
        mealParts.push(`Lunch${dateTime}${meals.lunch.notes ? `: ${meals.lunch.notes}` : ''}`)
      }
      if (meals.dinner.eaten) {
        const dateTime = meals.dinner.date && meals.dinner.time 
          ? ` (${meals.dinner.date} at ${meals.dinner.time})`
          : meals.dinner.date ? ` (${meals.dinner.date})` : ''
        mealParts.push(`Dinner${dateTime}${meals.dinner.notes ? `: ${meals.dinner.notes}` : ''}`)
      }
      if (meals.snacks.eaten) {
        const dateTime = meals.snacks.date && meals.snacks.time 
          ? ` (${meals.snacks.date} at ${meals.snacks.time})`
          : meals.snacks.date ? ` (${meals.snacks.date})` : ''
        mealParts.push(`Snacks${dateTime}${meals.snacks.notes ? `: ${meals.snacks.notes}` : ''}`)
      }
      if (mealParts.length > 0) {
        parts.push(`Meals: ${mealParts.join(', ')}`)
      }
    }
    
    // Naps
    if (selectedCategory === 'naps' && naps.length > 0) {
      const napDetails = naps.map((nap, idx) => {
        const start = new Date(`2000-01-01T${nap.startTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        const end = new Date(`2000-01-01T${nap.endTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        const quality = nap.quality ? ` (${nap.quality})` : ''
        return `Nap ${idx + 1}: ${nap.date} ${start} - ${end}${quality}`
      })
      parts.push(`Naps: ${napDetails.join('; ')}`)
    }
    
    // Activities
    if (selectedCategory === 'activities') {
      const activityParts: string[] = []
      if (activities.playTime) activityParts.push('Play time')
      if (activities.outdoorTime) activityParts.push('Outdoor time')
      if (activities.bathTime) activityParts.push('Bath time')
      if (activities.other && activities.otherText) {
        activityParts.push(`Other: ${activities.otherText}`)
      }
      if (activityParts.length > 0) {
        const dateTime = activities.activityDate && activities.activityTime
          ? ` (${activities.activityDate} at ${activities.activityTime})`
          : activities.activityDate ? ` (${activities.activityDate})` : ''
        parts.push(`Activities: ${activityParts.join(', ')}${dateTime}`)
      }
    }
    
    // Medication
    if (selectedCategory === 'medication') {
      const medParts: string[] = []
      if (medication.name) medParts.push(`Name: ${medication.name}`)
      if (medication.amount) medParts.push(`Amount: ${medication.amount}`)
      const frequencyLabel = frequencyOptions.find(opt => opt.value === medication.frequency)?.label || medication.frequency
      if (medication.frequency) medParts.push(`Frequency: ${frequencyLabel}`)
      if (medication.startDate && medication.startTime) {
        medParts.push(`Start: ${medication.startDate} at ${medication.startTime}`)
      }
      if (medication.endDate) medParts.push(`End Date: ${medication.endDate}`)
      medParts.push(`Status: ${medication.status}`)
      if (medication.status === 'given' && medication.givenDate) {
        const givenTime = medication.givenTime ? ` at ${medication.givenTime}` : ''
        medParts.push(`Given: ${medication.givenDate}${givenTime}`)
      }
      if (medParts.length > 0) {
        parts.push(`Medication: ${medParts.join(', ')}`)
      }
    }
    
    // Custom note
    if (selectedCategory === 'notes' && note.trim()) {
      parts.push(note.trim())
    }
    
    // Mood
    if (selectedCategory === 'mood' && mood) {
      parts.push(`Mood: ${mood.charAt(0).toUpperCase() + mood.slice(1)}`)
      if (moodDetails.trim()) {
        parts.push(`Details: ${moodDetails.trim()}`)
      }
    }
    
    return parts.join('\n\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childId) {
      setError('Please select a child')
      return
    }

    if (!currentUser?.uid) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user ID from backend
      const users = await api.listUsers()
      const user = users.find((u) => u.email === currentUser.email)
      if (!user) {
        throw new Error('User not found in database')
      }

      // Build comprehensive note from all activity data
      const activityNote = buildActivityNote()
      
      if (!selectedCategory) {
        setError('Please select a category')
        return
      }
      
      // Validate based on selected category
      if (selectedCategory === 'meals') {
        if (!Object.values(meals).some(m => m.eaten)) {
          setError('Please mark at least one meal as eaten')
          return
        }
      } else if (selectedCategory === 'naps') {
        if (naps.length === 0) {
          setError('Please add at least one nap')
          return
        }
      } else if (selectedCategory === 'activities') {
        if (!activities.playTime && !activities.outdoorTime && !activities.bathTime && !(activities.other && activities.otherText)) {
          setError('Please select at least one activity')
          return
        }
      } else if (selectedCategory === 'medication') {
        if (!medication.name) {
          setError('Please enter medication name')
          return
        }
        if (!medication.amount) {
          setError('Please enter medication amount')
          return
        }
        if (!medication.startDate || !medication.startTime) {
          setError('Please enter start date and time')
          return
        }
        if (!medication.endDate) {
          setError('Please enter end date')
          return
        }
      } else if (selectedCategory === 'notes') {
        if (!note.trim()) {
          setError('Please enter a note')
          return
        }
      } else if (selectedCategory === 'mood') {
        if (!mood) {
          setError('Please select a mood')
          return
        }
      } else {
        setError('Please select a category')
        return
      }

      // For medication category
      if (selectedCategory === 'medication') {
        if (!entry) {
          // Creating new medication entry - generate multiple entries based on schedule
          const schedule = generateMedicationSchedule(
            medication.startDate,
            medication.startTime,
            medication.endDate,
            medication.frequency
          )

          if (schedule.length === 0) {
            setError('No medication schedule generated. Please check your dates and times.')
            setLoading(false)
            return
          }

          // Create a journal entry for each scheduled medication time
          const frequencyLabel = frequencyOptions.find(opt => opt.value === medication.frequency)?.label || medication.frequency
          
          for (const scheduledTime of schedule) {
            const medicationNote = `Medication: ${medication.name} (${medication.amount}) - ${frequencyLabel}\nScheduled: ${scheduledTime.date} at ${scheduledTime.time}\nStatus: ${medication.status}`
            
            const entryData = {
              childId,
              note: medicationNote,
              authorId: user.id,
              medication: [{
                name: medication.name,
                amount: medication.amount,
                frequency: frequencyLabel,
                startDate: medication.startDate,
                startTime: medication.startTime,
                endDate: medication.endDate,
                status: medication.status,
                scheduledDate: scheduledTime.date,
                scheduledTime: scheduledTime.time,
              }],
            }

            await api.createJournalEntry(entryData)
          }

          onSuccess()
          onClose()
        } else {
          // Editing existing medication entry
          if (isCaregiverEditingMedication) {
            // Caregivers can only update status
            const medicationArray = Array.isArray(entry.medication) ? entry.medication : [entry.medication]
            const existingMed = (medicationArray[0] as {
              name?: string
              amount?: string
              frequency?: string
              startDate?: string
              startTime?: string
              endDate?: string
              status?: 'pending' | 'given' | 'missed'
              scheduledDate?: string
              scheduledTime?: string
              givenDate?: string
              givenTime?: string
            }) || {}
            
            const updatedMedication = [{
              name: existingMed.name || '',
              amount: existingMed.amount || '',
              frequency: existingMed.frequency || '',
              startDate: existingMed.startDate,
              startTime: existingMed.startTime,
              endDate: existingMed.endDate,
              status: medication.status,
              scheduledDate: existingMed.scheduledDate,
              scheduledTime: existingMed.scheduledTime,
              givenDate: medication.status === 'given' ? (medication.givenDate || existingMed.givenDate) : undefined,
              givenTime: medication.status === 'given' ? (medication.givenTime || existingMed.givenTime) : undefined,
            }]
            
            const data: any = {
              medication: updatedMedication,
            }

            await api.updateJournalEntry(entry.id, data)
          } else {
            // Parents can update all fields
            const frequencyLabel = frequencyOptions.find(opt => opt.value === medication.frequency)?.label || medication.frequency
            
            // Get the scheduled date/time from the existing entry
            const medicationArray = Array.isArray(entry.medication) ? entry.medication : [entry.medication]
            const existingMed = (medicationArray[0] as {
              name?: string
              amount?: string
              frequency?: string
              startDate?: string
              startTime?: string
              endDate?: string
              status?: 'pending' | 'given' | 'missed'
              scheduledDate?: string
              scheduledTime?: string
              givenDate?: string
              givenTime?: string
            }) || {}
            
            const updatedMedicationNote = `Medication: ${medication.name} (${medication.amount}) - ${frequencyLabel}\nScheduled: ${existingMed.scheduledDate || medication.startDate} at ${existingMed.scheduledTime || medication.startTime}\nStatus: ${medication.status}${medication.status === 'given' && medication.givenDate ? `\nGiven: ${medication.givenDate}${medication.givenTime ? ` at ${medication.givenTime}` : ''}` : ''}`
            
            const updatedMedication = [{
              name: medication.name,
              amount: medication.amount,
              frequency: frequencyLabel,
              startDate: medication.startDate || existingMed.startDate,
              startTime: medication.startTime || existingMed.startTime,
              endDate: medication.endDate || existingMed.endDate,
              status: medication.status,
              scheduledDate: existingMed.scheduledDate || medication.startDate,
              scheduledTime: existingMed.scheduledTime || medication.startTime,
              givenDate: medication.status === 'given' ? (medication.givenDate || existingMed.givenDate) : undefined,
              givenTime: medication.status === 'given' ? (medication.givenTime || existingMed.givenTime) : undefined,
            }]
            
            const data = {
              childId,
              note: updatedMedicationNote,
              authorId: user.id,
              medication: updatedMedication,
            }

            await api.updateJournalEntry(entry.id, data)
          }
          onSuccess()
          onClose()
        }
      } else {
        // For other categories or editing, create/update single entry
        const data: any = {
          childId,
          note: activityNote || note, // Use structured note if available, otherwise use custom note
          authorId: user.id,
        }

        // Include category-specific structured data
        if (selectedCategory === 'meals') {
          data.meals = meals
        } else if (selectedCategory === 'naps') {
          data.naps = naps
        } else if (selectedCategory === 'activities') {
          data.activities = activities
        } else if (selectedCategory === 'mood') {
          data.mood = mood || undefined
          data.moodDetails = moodDetails || undefined
        }

        if (entry) {
          await api.updateJournalEntry(entry.id, data)
        } else {
          await api.createJournalEntry(data)
        }

        onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Edit Journal Entry' : currentStep === 'categories' ? 'Log Activity' : 'Activity Details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
            {error}
          </div>
        )}

        {/* Child Selection - Always visible */}
        <div>
          <label htmlFor="childId" className="block text-sm font-semibold text-brown mb-2">
            Child <span className="text-red-DEFAULT">*</span>
          </label>
          <select
            id="childId"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection Step */}
        {currentStep === 'categories' && (
          <>
            <div>
              <p className="text-sm text-brown/70 mb-4">Select the activity you want to log:</p>
              <div className="grid grid-cols-2 gap-3">
                {activityCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className="p-4 rounded-lg border-2 border-brown/20 bg-card hover:border-sage hover:bg-sage/5 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-brown mb-1">{category.label}</h4>
                        <p className="text-xs text-brown/60">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Details Step */}
        {currentStep === 'details' && (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={backToCategories}
                className="flex items-center gap-2 text-sm text-brown/70 hover:text-brown transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Categories
              </button>
            </div>

        {/* Meals Section */}
        {selectedCategory === 'meals' && (
          <div className="border-t border-brown/10 pt-4">
            <h3 className="text-lg font-semibold text-brown mb-4">Meals</h3>
            <div className="space-y-4">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
                <div key={mealType} className="p-3 bg-background rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      id={`meal-${mealType}`}
                      checked={meals[mealType].eaten}
                      onChange={(e) =>
                        setMeals({
                          ...meals,
                          [mealType]: { ...meals[mealType], eaten: e.target.checked },
                        })
                      }
                      className="mt-1 w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
                    />
                    <label
                      htmlFor={`meal-${mealType}`}
                      className="flex-1 text-sm font-medium text-brown capitalize"
                    >
                      {mealType}
                    </label>
                  </div>
                  {meals[mealType].eaten && (
                    <div className="ml-7 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-brown/70 mb-1">Date</label>
                          <input
                            type="date"
                            value={meals[mealType].date}
                            onChange={(e) =>
                              setMeals({
                                ...meals,
                                [mealType]: { ...meals[mealType], date: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown/70 mb-1">Time</label>
                          <input
                            type="time"
                            value={meals[mealType].time}
                            onChange={(e) =>
                              setMeals({
                                ...meals,
                                [mealType]: { ...meals[mealType], time: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brown/70 mb-1">What did they eat? (optional)</label>
                        <input
                          type="text"
                          value={meals[mealType].notes}
                          onChange={(e) =>
                            setMeals({
                              ...meals,
                              [mealType]: { ...meals[mealType], notes: e.target.value },
                            })
                          }
                          placeholder="e.g. Oatmeal with fruits"
                          className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Naps Section */}
        {selectedCategory === 'naps' && (
          <div className="border-t border-brown/10 pt-4">
            <h3 className="text-lg font-semibold text-brown mb-4">Naps</h3>
            {naps.length > 0 && (
              <div className="mb-3 space-y-2">
                {naps.map((nap, index) => {
                  const start = new Date(`2000-01-01T${nap.startTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                  const end = new Date(`2000-01-01T${nap.endTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded-lg"
                    >
                      <span className="text-sm text-brown">
                        {nap.date} {start} - {end}{nap.quality ? ` (${nap.quality})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNap(index)}
                        className="text-red-DEFAULT hover:text-red-DEFAULT/80 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-brown mb-1">Date <span className="text-red-DEFAULT">*</span></label>
                <input
                  type="date"
                  value={newNap.date}
                  onChange={(e) => setNewNap({ ...newNap, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brown mb-1">Start Time <span className="text-red-DEFAULT">*</span></label>
                  <input
                    type="time"
                    value={newNap.startTime}
                    onChange={(e) => setNewNap({ ...newNap, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brown mb-1">End Time <span className="text-red-DEFAULT">*</span></label>
                  <input
                    type="time"
                    value={newNap.endTime}
                    onChange={(e) => setNewNap({ ...newNap, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brown mb-1">Quality <span className="text-brown/70">(optional)</span></label>
                <select
                  value={newNap.quality}
                  onChange={(e) => setNewNap({ ...newNap, quality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                >
                  <option value="">Select quality</option>
                  <option value="good">Good</option>
                  <option value="restless">Restless</option>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={addNap}
              disabled={!newNap.date || !newNap.startTime || !newNap.endTime}
              className="mt-2 px-3 py-2 rounded-lg bg-sage/10 text-sage font-medium hover:bg-sage/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              + Add Nap
            </button>
          </div>
        )}

        {/* Activities Section */}
        {selectedCategory === 'activities' && (
          <div className="border-t border-brown/10 pt-4">
            <h3 className="text-lg font-semibold text-brown mb-4">Activities</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activities.playTime}
                onChange={(e) => setActivities({ ...activities, playTime: e.target.checked })}
                className="w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
              />
              <span className="text-sm text-brown">Play Time</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activities.outdoorTime}
                onChange={(e) => setActivities({ ...activities, outdoorTime: e.target.checked })}
                className="w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
              />
              <span className="text-sm text-brown">Outdoor Time</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activities.bathTime}
                onChange={(e) => setActivities({ ...activities, bathTime: e.target.checked })}
                className="w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
              />
              <span className="text-sm text-brown">Bath Time</span>
            </label>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="other-activity"
                checked={activities.other}
                onChange={(e) => setActivities({ ...activities, other: e.target.checked })}
                className="mt-1 w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
              />
              <div className="flex-1">
                <label htmlFor="other-activity" className="block text-sm text-brown mb-1">
                  Other
                </label>
                {activities.other && (
                  <input
                    type="text"
                    value={activities.otherText}
                    onChange={(e) => setActivities({ ...activities, otherText: e.target.value })}
                    placeholder="Describe the activity"
                    className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                  />
                )}
              </div>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-brown mb-1">Date</label>
                <input
                  type="date"
                  value={activities.activityDate}
                  onChange={(e) => setActivities({ ...activities, activityDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brown mb-1">Time</label>
                <input
                  type="time"
                  value={activities.activityTime}
                  onChange={(e) => setActivities({ ...activities, activityTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Medication Section */}
        {selectedCategory === 'medication' && (
          <div className="border-t border-brown/10 pt-4">
            <h3 className="text-lg font-semibold text-brown mb-4">Medication</h3>
            {isCaregiverEditingMedication && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  You can only update the status of this medication entry.
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Medicine Name <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => setMedication({ ...medication, name: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  required={isCaregiverEditingMedication ? false : true}
                  disabled={isCaregiverEditingMedication}
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent disabled:bg-brown/5 disabled:cursor-not-allowed"
                />
              </div>
              {!isCaregiverEditingMedication && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Amount <span className="text-red-DEFAULT">*</span>
                      </label>
                      <input
                        type="text"
                        value={medication.amount}
                        onChange={(e) => setMedication({ ...medication, amount: e.target.value })}
                        placeholder="e.g. 5ml"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Frequency <span className="text-red-DEFAULT">*</span>
                    </label>
                    <select
                      value={medication.frequency}
                      onChange={(e) => setMedication({ ...medication, frequency: e.target.value as typeof medication.frequency })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Start Date <span className="text-red-DEFAULT">*</span>
                      </label>
                      <input
                        type="date"
                        value={medication.startDate}
                        onChange={(e) => setMedication({ ...medication, startDate: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Start Time <span className="text-red-DEFAULT">*</span>
                      </label>
                      <input
                        type="time"
                        value={medication.startTime}
                        onChange={(e) => setMedication({ ...medication, startTime: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      End Date <span className="text-red-DEFAULT">*</span>
                    </label>
                    <input
                      type="date"
                      value={medication.endDate}
                      onChange={(e) => setMedication({ ...medication, endDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                </>
              )}
              {isCaregiverEditingMedication && (
                <div className="space-y-3 p-4 bg-background rounded-lg border border-brown/10">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">Medicine</label>
                    <p className="text-sm text-brown/70">{medication.name} ({medication.amount})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">Frequency</label>
                    <p className="text-sm text-brown/70">
                      {frequencyOptions.find(opt => opt.value === medication.frequency)?.label || medication.frequency}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">Start</label>
                      <p className="text-sm text-brown/70">{medication.startDate} at {medication.startTime}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1">End Date</label>
                      <p className="text-sm text-brown/70">{medication.endDate}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Status
                </label>
                <select
                  value={medication.status}
                  onChange={(e) => setMedication({ ...medication, status: e.target.value as 'pending' | 'given' | 'missed' })}
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="given">Given</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
              {medication.status === 'given' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Given Date
                    </label>
                    <input
                      type="date"
                      value={medication.givenDate}
                      onChange={(e) => setMedication({ ...medication, givenDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Given Time
                    </label>
                    <input
                      type="time"
                      value={medication.givenTime}
                      onChange={(e) => setMedication({ ...medication, givenTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {selectedCategory === 'notes' && (
          <div className="border-t border-brown/10 pt-4">
            <label htmlFor="note" className="block text-sm font-semibold text-brown mb-2">
              Notes <span className="text-red-DEFAULT">*</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              placeholder="Enter your notes..."
            />
          </div>
        )}

        {/* Mood Section */}
        {selectedCategory === 'mood' && (
          <div className="border-t border-brown/10 pt-4">
            <div className="mb-4">
              <label htmlFor="mood" className="block text-sm font-semibold text-brown mb-2">
                Mood <span className="text-red-DEFAULT">*</span>
              </label>
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalEntry['mood'] | '')}
                required
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">Select mood</option>
                {moods.filter((m): m is NonNullable<typeof m> => m != null).map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="moodDetails" className="block text-sm font-semibold text-brown mb-2">
                Details <span className="text-brown/70">(optional)</span>
              </label>
              <textarea
                id="moodDetails"
                value={moodDetails}
                onChange={(e) => setMoodDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                placeholder="Any additional details about the mood..."
              />
            </div>
          </div>
        )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : entry ? 'Update' : 'Log Activity'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}

