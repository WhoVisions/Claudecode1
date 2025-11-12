'use client'

import { useState, useTransition } from 'react'
import { createModel } from '../actions'
import { GeminiSchemaGenerator } from './GeminiSchemaGenerator'

type Mode = 'manual' | 'ai'

export function ModelCreator() {
  const [mode, setMode] = useState<Mode>('manual')
  const [name, setName] = useState('')
  const [schema, setSchema] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [aiPrompt, setAiPrompt] = useState('')
  const [requiresAuth, setRequiresAuth] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API name' })
      return
    }

    if (!schema.trim()) {
      setMessage({ type: 'error', text: 'Please provide a schema' })
      return
    }

    startTransition(async () => {
      const result = await createModel(
        name,
        schema,
        mode === 'ai',
        mode === 'ai' ? aiPrompt : undefined,
        requiresAuth
      )

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Reset form
        setName('')
        setSchema('')
        setAiPrompt('')
        setMode('manual')
      } else {
        setMessage({ type: 'error', text: result.error || result.message })
      }
    })
  }

  const handleSchemaGenerated = (generatedSchema: string) => {
    setSchema(generatedSchema)
    setMessage({ type: 'success', text: 'Schema generated! Review and submit when ready.' })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your API</h2>
        <p className="text-gray-600">Build a custom API endpoint with your own data schema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            API Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., my-products, user-profiles"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          />
          <p className="mt-1 text-sm text-gray-500">
            Use lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Mode Switcher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you want to create your schema?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'manual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              disabled={isPending}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-medium text-gray-900">Write JSON</span>
                <span className="text-xs text-gray-500">Manual entry</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'ai'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              disabled={isPending}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium text-gray-900">AI-Powered</span>
                <span className="text-xs text-gray-500">Describe in words</span>
              </div>
            </button>
          </div>
        </div>

        {/* Schema Input - Manual Mode */}
        {mode === 'manual' && (
          <div>
            <label htmlFor="schema" className="block text-sm font-medium text-gray-700 mb-2">
              JSON Schema
            </label>
            <textarea
              id="schema"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder={`{\n  "name": "string",\n  "price": "number",\n  "in-stock": "boolean"\n}`}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={isPending}
            />
            <p className="mt-1 text-sm text-gray-500">
              Define your data structure in JSON format
            </p>
          </div>
        )}

        {/* Schema Input - AI Mode */}
        {mode === 'ai' && name && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">AI Schema Generator</h3>
            </div>
            <GeminiSchemaGenerator
              apiName={name}
              onSchemaGenerated={(generatedSchema) => {
                handleSchemaGenerated(generatedSchema)
                setAiPrompt(generatedSchema)
              }}
            />
          </div>
        )}

        {/* Schema Preview (AI Mode) */}
        {mode === 'ai' && schema && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Schema (You can edit this)
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              disabled={isPending}
            />
          </div>
        )}

        {/* Authentication Option */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requiresAuth"
              checked={requiresAuth}
              onChange={(e) => setRequiresAuth(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isPending}
            />
            <div className="flex-1">
              <label htmlFor="requiresAuth" className="block text-sm font-medium text-gray-900 cursor-pointer">
                Require API Key Authentication
              </label>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, all requests to this API will require a valid API key in the <code className="bg-blue-100 px-1 py-0.5 rounded">X-API-Key</code> header. You can generate API keys after creating the API.
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !name.trim() || !schema.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating API...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create My API!
            </>
          )}
        </button>
      </form>
    </div>
  )
}
