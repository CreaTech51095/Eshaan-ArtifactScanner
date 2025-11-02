import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Share2, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

interface ArtifactQRCodeProps {
  artifactId: string
  artifactName: string
  size?: number
}

const ArtifactQRCode: React.FC<ArtifactQRCodeProps> = ({ 
  artifactId, 
  artifactName,
  size = 256 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    generateQRCode()
  }, [artifactId])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    try {
      // Generate URL that points to artifact detail page
      const artifactUrl = `${window.location.origin}/artifacts/${artifactId}`
      
      // Generate QR code on canvas
      await QRCode.toCanvas(canvasRef.current, artifactUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#1e293b',  // slate-800
          light: '#ffffff'
        }
      })

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(artifactUrl, {
        width: size,
        margin: 2
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `${artifactName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr-code.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const handlePrint = () => {
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow pop-ups to print')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${artifactName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              margin-bottom: 20px;
            }
            img {
              border: 2px solid #ccc;
              padding: 10px;
              background: white;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${artifactName}</h1>
            <p>Scan to view artifact details</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="footer">
              <p>Archaeological Artifacts Scanner</p>
              <p>Artifact ID: ${artifactId}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleShare = async () => {
    const artifactUrl = `${window.location.origin}/artifacts/${artifactId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: artifactName,
          text: `Check out this artifact: ${artifactName}`,
          url: artifactUrl
        })
        toast.success('Shared successfully!')
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(artifactUrl)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleDownload}
          className="btn btn-outline btn-sm flex items-center gap-2"
          title="Download QR Code"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="btn btn-outline btn-sm flex items-center gap-2"
          title="Print QR Code"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleShare}
          className="btn btn-outline btn-sm flex items-center gap-2"
          title="Share Link"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Scan this QR code to view artifact details
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ID: {artifactId}
        </p>
      </div>
    </div>
  )
}

export default ArtifactQRCode

