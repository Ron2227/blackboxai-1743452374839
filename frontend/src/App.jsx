import { useState, useRef } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [showOriginal, setShowOriginal] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG/PNG)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target.result)
      setResult(null) // Clear previous result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!image) {
      toast.error('Please select an image first!')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', fileInputRef.current.files[0])

      const response = await axios.post(
        'http://localhost:8000/saliency',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob'
        }
      )

      const imageUrl = URL.createObjectURL(response.data)
      setResult(imageUrl)
      toast.success('Processing complete!')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.detail || 'Error processing image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-semibold text-gray-900">Attention Checker</h1>
          <p className="text-gray-600 mt-2">
            Upload an image to analyze visual attention areas
          </p>
        </div>
      </header>

      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-apple-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Choose Image
                  </label>
                  {image && (
                    <span className="ml-3 text-sm text-gray-600">
                      {fileInputRef.current?.files[0]?.name}
                    </span>
                  )}
                </div>

                {image && (
                  <div className="mb-4">
                    <img
                      src={image}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg shadow"
                    />
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!image || isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-apple-blue hover:bg-blue-600'
                  } ${!image ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Check Attention'
                  )}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    showOriginal
                      ? 'bg-apple-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    !showOriginal
                      ? 'bg-apple-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Saliency Map
                </button>
              </div>
              <div className="relative aspect-square">
                <img
                  src={showOriginal ? image : result}
                  alt="Result"
                  className="w-full h-full object-contain rounded-lg shadow"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Attention Checker
        </div>
      </footer>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App