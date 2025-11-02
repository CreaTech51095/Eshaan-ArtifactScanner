import React, { useRef, useState, useEffect } from 'react'
import { Camera, X, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
      setError('')
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, facingMode])

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setError(`Camera access denied: ${err.message}`)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImage(imageDataUrl)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    if (!capturedImage) return

    // Convert data URL to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File(
          [blob], 
          `camera_${Date.now()}.jpg`, 
          { type: 'image/jpeg' }
        )
        onCapture(file)
        onClose()
        setCapturedImage(null)
      })
      .catch(err => {
        console.error('Error converting image:', err)
        setError('Failed to process image')
      })
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setCapturedImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-4xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Take Photo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera View or Captured Image */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-8">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-gray-400 text-sm">
                Please ensure you have granted camera permissions and try again.
              </p>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-full object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-900 flex justify-center items-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={switchCamera}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                title="Switch camera"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Switch</span>
              </button>
              <button
                onClick={capturePhoto}
                disabled={!stream || !!error}
                className="w-16 h-16 bg-white rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Take photo"
              >
                <div className="w-14 h-14 border-4 border-gray-900 rounded-full" />
              </button>
              <div className="w-16" /> {/* Spacer for centering */}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraCapture

