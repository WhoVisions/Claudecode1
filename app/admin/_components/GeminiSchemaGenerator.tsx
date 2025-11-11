'use client'

import { useState, useTransition } from 'react'
import { generateSchemaWithGemini } from '../actions'

const EXAMPLE_PROMPTS = [
  'Store products with name, price, description, and stock status',
  'Create a user profile API with name, email, age, and preferences',
  'Build a todo list API with tasks, due dates, and completion status',
  'Manage blog posts with title, content, author, and publish date'
]

interface GeminiSchemaGeneratorProps {
  apiName: string
  onSchemaGenerated: (schema: string) => void
}

export function GeminiSchemaGenerator({ apiName, onSchemaGenerated }: GeminiSchemaGeneratorProps) {
  const [description, setDescription] = useState('')
  const [generatedSchema, setGeneratedSchema] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }

    setError(null)
    setGeneratedSchema(null)

    startTransition(async () => {
      const result = await generateSchemaWithGemini(description, apiName)

      if (result.success && result.data?.schema) {
        setGeneratedSchema(result.data.schema)
      } else {
        setError(result.error || result.message)
      }
    })
  }

  const handleUseSchema = () => {
    if (generatedSchema) {
      const schemaString = JSON.stringify(generatedSchema, null, 2)
      onSchemaGenerated(schemaString)
    }
  }

  const handleCopySchema = async () => {
    if (generatedSchema) {
      const schemaString = JSON.stringify(generatedSchema, null, 2)
      await navigator.clipboard.writeText(schemaString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExampleClick = (example: string) => {
    setDescription(example)
    setGeneratedSchema(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you want to store
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., I want to store products with name, price, description, and stock status"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isPending}
        />
      </div>

      {/* Example Prompts */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              disabled={isPending}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isPending || !description.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating with AI...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Schema with AI
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Generated Schema Preview */}
      {generatedSchema && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Generated Schema</h3>
            <button
              onClick={handleCopySchema}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>{JSON.stringify(generatedSchema, null, 2)}</code>
            </pre>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUseSchema}
              className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Use This Schema
            </button>
            <button
              onClick={() => setGeneratedSchema(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
