import { useJournalEntries, useChildren } from '../hooks/useApiData'
import { api } from '../lib/api'
import { useEffect, useState, useRef } from 'react'
import type { User } from '../types/entities'
import { LoadingSpinner } from './LoadingSpinner'

export function RecentActivitiesCard() {
  const { entries, loading, refetch } = useJournalEntries()
  const { children } = useChildren()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  // Store refetch in a ref so the event handler always uses the latest version
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  // Fetch users to get author names
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData = await api.listUsers()
        setUsers(usersData)
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  // Refetch entries when window gains focus (e.g., after logging an activity)
  // Note: Don't refetch on mount - the hook already fetches on mount
  useEffect(() => {
    const handleFocus = () => {
      refetchRef.current()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // Empty deps - we only want to set up the listener once

  // Get the most recent 3 entries, sorted by updatedAt (or createdAt if updatedAt not available)
  const recentEntries = [...entries]
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime()
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime // Most recent first
    })
    .slice(0, 3)

  // Helper to get activity summary from note
  const getActivitySummary = (note: string) => {
    // Extract first line or first 60 characters
    const firstLine = note.split('\n')[0]
    if (firstLine.length > 60) {
      return firstLine.substring(0, 60) + '...'
    }
    return firstLine
  }

  // Helper to format time - use updatedAt if available, otherwise createdAt
  const formatTime = (entry: { createdAt: string; updatedAt?: string }) => {
    const dateString = entry.updatedAt || entry.createdAt
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`
    }
  }

  if (loading || loadingUsers) {
    return (
      <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-brown">Recent Activities</h3>
          <p className="text-sm text-brown/70">Latest updates from your caregivers</p>
        </div>
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-brown">Recent Activities</h3>
        <p className="text-sm text-brown/70">Latest updates from your caregivers</p>
      </div>
      
      {recentEntries.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <svg
              className="h-14 w-14 text-brown/70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="7" />
              <path d="M12 8v4l2.5 2.5" />
            </svg>
          </div>
          <p className="mb-1 font-semibold text-brown">No recent activities</p>
          <p className="text-sm text-brown/70">Start logging activities to see them here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentEntries.map((entry) => {
            const child = children.find((c) => c.id === entry.childId)
            const author = users.find((u) => u.id === entry.authorId)
            
            return (
              <div
                key={entry.id}
                className="rounded-lg border border-brown/10 bg-background p-3 hover:bg-brown/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-brown text-sm">
                        {child?.fullName || 'Unknown'}
                      </p>
                      {entry.mood && (
                        <span className="text-base" title={entry.mood}>
                          {entry.mood === 'happy' && '😊'}
                          {entry.mood === 'calm' && '😌'}
                          {entry.mood === 'tired' && '😴'}
                          {entry.mood === 'fussy' && '😤'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-brown/80 line-clamp-2">
                      {getActivitySummary(entry.note)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-brown/60">
                        {formatTime(entry)}
                      </span>
                      {author && (
                        <>
                          <span className="text-xs text-brown/40">•</span>
                          <span className="text-xs text-brown/60">{author.displayName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

