import { getGeminiApiKey, getModels } from './actions'
import { GeminiApiKeyForm } from './_components/GeminiApiKeyForm'
import { ModelCreator } from './_components/ModelCreator'
import { ModelList } from './_components/ModelList'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const apiKey = await getGeminiApiKey()
  const modelsResult = await getModels()
  const models = modelsResult.success ? modelsResult.data.models : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Builder Dashboard</h1>
              <p className="mt-1 text-gray-600">Create and manage your custom APIs with AI assistance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">AI-Powered</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Gemini API Key Settings */}
          <section>
            <GeminiApiKeyForm initialApiKey={apiKey} />
          </section>

          {/* Info Banner */}
          {apiKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Gemini API is configured! You can now use AI-powered features.</span>
              </div>
            </div>
          )}

          {!apiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Add your Gemini API key above to enable AI-powered schema generation.</span>
              </div>
            </div>
          )}

          {/* Model Creator */}
          <section>
            <ModelCreator />
          </section>

          {/* Model List */}
          {models.length > 0 && (
            <section>
              <ModelList models={models} />
            </section>
          )}

          {/* Getting Started Guide */}
          {models.length === 0 && (
            <section className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Configure Gemini API (Optional)</h3>
                    <p>Add your Google Gemini API key to enable AI-powered schema generation. Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your First API</h3>
                    <p>Choose between manual JSON entry or AI-powered generation. Simply describe what you want to store, and let AI create the schema for you!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Start Using Your API</h3>
                    <p>Once created, your API will be available at <code className="bg-gray-100 px-2 py-1 rounded">/api/[your-api-name]</code> with full CRUD operations.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Features Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600 text-sm">Describe your data in plain English and let Gemini AI generate the perfect JSON schema for you.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full CRUD Operations</h3>
              <p className="text-gray-600 text-sm">Every API comes with Create, Read, Update, and Delete operations out of the box.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Type-Safe & Validated</h3>
              <p className="text-gray-600 text-sm">All APIs are validated and type-safe, ensuring data integrity and reliability.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>Powered by Next.js 16, React 19, and Google Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}
