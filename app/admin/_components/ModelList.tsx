'use client'

import { useState, useTransition } from 'react'
import { deleteModel } from '../actions'
import { ApiKeyManager } from './ApiKeyManager'

interface ApiModel {
  id: string
  name: string
  schema: string
  generatedByAI: boolean
  aiPrompt: string | null
  requiresAuth: boolean
  createdAt: Date
  updatedAt: Date
}

interface ModelListProps {
  models: ApiModel[]
}

export function ModelList({ models: initialModels }: ModelListProps) {
  const [models, setModels] = useState(initialModels)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this API?')) {
      return
    }

    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteModel(id)
      if (result.success) {
        setModels(models.filter((m) => m.id !== id))
      }
      setDeletingId(null)
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleCopySchema = async (schema: string) => {
    await navigator.clipboard.writeText(schema)
    alert('Schema copied to clipboard!')
  }

  if (models.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No APIs yet</h3>
        <p className="text-gray-600">Create your first API to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Your APIs</h2>
        <p className="text-sm text-gray-600 mt-1">{models.length} API{models.length !== 1 ? 's' : ''} created</p>
      </div>

      <div className="divide-y divide-gray-200">
        {models.map((model) => {
          const isExpanded = expandedId === model.id
          const isDeleting = deletingId === model.id

          return (
            <div key={model.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                    {model.generatedByAI && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Generated
                      </span>
                    )}
                    {model.requiresAuth && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Protected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(model.id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isExpanded ? 'Hide' : 'View'} Schema
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Schema</span>
                      <button
                        onClick={() => handleCopySchema(model.schema)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-800">
                        <code>{JSON.stringify(JSON.parse(model.schema), null, 2)}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Endpoint:</span>{' '}
                      <code className="bg-blue-100 px-2 py-0.5 rounded">/api/{model.name}</code>
                    </div>
                  </div>

                  {/* API Key Management */}
                  {model.requiresAuth && (
                    <ApiKeyManager modelId={model.id} modelName={model.name} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
