import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { Child, ScheduleEntry, JournalEntry, Caregiver, Family } from '../types/entities'

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChildren = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listChildren()
      setChildren(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children')
      console.error('Error fetching children:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  return { children, loading, error, refetch: fetchChildren }
}

export function useScheduleEntries() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listSchedules()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule entries')
      console.error('Error fetching schedule entries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return { entries, loading, error, refetch: fetchEntries }
}

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listJournalEntries()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries')
      console.error('Error fetching journal entries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return { entries, loading, error, refetch: fetchEntries }
}

export function useCaregivers() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaregivers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listCaregivers()
      setCaregivers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caregivers')
      console.error('Error fetching caregivers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaregivers()
  }, [])

  return { caregivers, loading, error, refetch: fetchCaregivers }
}

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFamilies() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.listFamilies()
        setFamilies(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load families')
        console.error('Error fetching families:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  return { families, loading, error }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, loading, error, refetch: fetchUsers }
}

