'use client'

import { useState, useTransition, useEffect } from 'react'
import { createApiKey, getApiKeys, deleteApiKey, toggleApiKey } from '../actions'

interface ApiKey {
  id: string
  key: string
  name: string
  isActive: boolean
  lastUsedAt: Date | null
  createdAt: Date
}

interface ApiKeyManagerProps {
  modelId: string
  modelName: string
}

export function ApiKeyManager({ modelId, modelName }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [modelId])

  const loadApiKeys = () => {
    startTransition(async () => {
      const result = await getApiKeys(modelId)
      if (result.success) {
        setApiKeys(result.data.apiKeys)
      }
    })
  }

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a key name' })
      return
    }

    startTransition(async () => {
      const result = await createApiKey(modelId, keyName)
      if (result.success) {
        setNewKey(result.data.apiKey.key)
        setKeyName('')
        loadApiKeys()
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error || result.message })
      }
    })
  }

  const handleDeleteKey = (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteApiKey(id)
      if (result.success) {
        loadApiKeys()
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error || result.message })
      }
    })
  }

  const handleToggleKey = (id: string) => {
    startTransition(async () => {
      const result = await toggleApiKey(id)
      if (result.success) {
        loadApiKeys()
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error || result.message })
      }
    })
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'API key copied to clipboard!' })
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Manage API Keys
      </button>

      {isOpen && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">API Keys</h4>

          {/* Create New Key */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Key name (e.g., Production, Development)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isPending}
            />
            <button
              onClick={handleCreateKey}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Create Key
            </button>
          </div>

          {/* New Key Display */}
          {newKey && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                ⚠️ Save this key now! It won't be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Keys List */}
          {apiKeys.length === 0 ? (
            <p className="text-sm text-gray-600">No API keys yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{key.name}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          key.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {key.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <code className="text-xs text-gray-600 font-mono">{key.key}</code>
                    <p className="text-xs text-gray-500 mt-1">
                      {key.lastUsedAt
                        ? `Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`
                        : 'Never used'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleKey(key.id)}
                      disabled={isPending}
                      className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                    >
                      {key.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={isPending}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Usage Instructions */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Using Your API Key</p>
            <p className="text-xs text-blue-800">
              Include the API key in the <code className="bg-blue-100 px-1 rounded">X-API-Key</code> header when making requests:
            </p>
            <pre className="mt-2 p-2 bg-blue-100 rounded text-xs font-mono overflow-x-auto">
{`curl -H "X-API-Key: your-key-here" \\
  https://yoursite.com/api/${modelName}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
