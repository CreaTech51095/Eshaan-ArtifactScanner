import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, Search, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ScannerPage: React.FC = () => {
  const navigate = useNavigate()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false) // Prevent multiple scan processing
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [manualId, setManualId] = useState('')
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup: stop scanner when component unmounts
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [isScanning])

  const startScanner = async () => {
    try {
      // First, stop any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch (e) {
          console.log('No scanner to stop')
        }
      }

      // Reset processing flag when starting a new scan
      isProcessingRef.current = false
      setIsScanning(true) // Set this first to show the container

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10, // Scans per second
          qrbox: { width: 250, height: 250 } // Scanning box size
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText)
        },
        (errorMessage) => {
          // Error callback (can be ignored for normal operation)
          // console.log('Scan error:', errorMessage)
        }
      )

      setHasPermission(true)
      toast.success('Scanner ready! Point camera at QR code')
    } catch (error: any) {
      console.error('Error starting scanner:', error)
      setIsScanning(false)
      setHasPermission(false)
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please enable camera access.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.')
      } else {
        toast.error('Failed to start scanner. Try manual entry.')
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
        toast.success('Scanner stopped')
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  const handleScanSuccess = (decodedText: string) => {
    // Prevent multiple processing of the same scan
    if (isProcessingRef.current) {
      console.log('Already processing, ignoring duplicate scan')
      return // Ignore if already processing
    }
    
    // Set flag immediately to prevent other callbacks
    isProcessingRef.current = true
    console.log('Processing QR code:', decodedText)
    
    // Immediately pause the scanner to prevent more callbacks
    if (scannerRef.current) {
      scannerRef.current.pause(true)
    }
    
    setLastScanned(decodedText)
    
    // Extract artifact ID from URL
    // Expected format: http://localhost:3000/artifacts/{artifactId}
    const artifactIdMatch = decodedText.match(/\/artifacts\/([a-zA-Z0-9-_]+)/)
    
    if (artifactIdMatch && artifactIdMatch[1]) {
      const artifactId = artifactIdMatch[1]
      
      // Stop scanner completely
      stopScanner()
      
      toast.success('QR Code scanned successfully!', {
        duration: 2000,
        icon: '✅'
      })
      
      // Navigate to artifact detail page
      setTimeout(() => {
        navigate(`/artifacts/${artifactId}`)
      }, 500)
    } else {
      // Stop scanner completely for invalid codes
      stopScanner()
      
      toast.error('Invalid QR code. Expected artifact URL.')
      // Restart scanner after a delay
      setTimeout(() => {
        isProcessingRef.current = false // Reset flag before restarting
        startScanner()
      }, 2000)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualId.trim()) {
      toast.error('Please enter an artifact ID')
      return
    }

    toast.success('Opening artifact...')
    navigate(`/artifacts/${manualId.trim()}`)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-archaeological-charcoal">QR Code Scanner</h1>
          <p className="mt-2 text-archaeological-charcoal">
            Scan QR codes to quickly access artifact information
          </p>
        </div>

        {/* Scanner Card */}
        <div className="card mb-6">
          <div className="card-content">
            {/* Camera Permission Status */}
            {hasPermission === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Camera Access Required</p>
                  <p className="text-red-700 text-sm mt-1">
                    Please enable camera permissions in your browser settings to use the scanner.
                  </p>
                </div>
              </div>
            )}

            {/* Scanner Container */}
            {!isScanning && (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-archaeological-sage mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                  Ready to Scan
                </h3>
                <p className="text-archaeological-charcoal mb-6">
                  Click the button below to activate your camera
                </p>
                <button
                  onClick={startScanner}
                  className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  Start Scanner
                </button>
              </div>
            )}

            {isScanning && (
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                <div 
                  id="qr-reader" 
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Stop Button */}
            {isScanning && (
              <div className="mt-4 text-center">
                <button
                  onClick={stopScanner}
                  className="btn btn-danger btn-sm flex items-center gap-2 mx-auto"
                >
                  <X className="w-4 h-4" />
                  Stop Scanner
                </button>
                <p className="text-sm text-archaeological-olive mt-2">
                  Point your camera at a QR code
                </p>
              </div>
            )}

            {/* Last Scanned */}
            {lastScanned && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-green-800 font-medium text-sm">Last Scanned:</p>
                  <p className="text-green-700 text-xs truncate">{lastScanned}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Entry Card */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-archaeological-charcoal mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Manual Entry
            </h3>
            <p className="text-archaeological-charcoal text-sm mb-4">
              Already know the artifact ID? Enter it directly below.
            </p>
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="artifactId" className="block text-sm font-medium text-archaeological-charcoal mb-1">
                  Artifact ID
                </label>
                <input
                  type="text"
                  id="artifactId"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="input"
                  placeholder="e.g., xHDc4cQXBh13pTnzJSCN"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Go to Artifact
              </button>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📱 Scanning Tips:</h4>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Hold your phone steady</li>
            <li>Ensure good lighting</li>
            <li>Center the QR code in the frame</li>
            <li>Keep camera 4-6 inches from QR code</li>
            <li>Use manual entry if scanning doesn't work</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ScannerPage
