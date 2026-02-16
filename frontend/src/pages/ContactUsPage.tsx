import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, ArrowLeft, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ContactUsPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Placeholder - to be implemented later
    setTimeout(() => {
      toast.success('Thank you for contacting us! We\'ll get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-archaeological-warmGray">
      {/* Header */}
      <div className="bg-archaeological-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-archaeological-sage hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <MessageSquare className="w-12 h-12 text-primary-400" />
            <h1 className="text-4xl font-bold">Contact Us</h1>
          </div>
          <p className="text-archaeological-sage text-lg max-w-3xl">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <div className="card-content">
                <h2 className="text-xl font-bold text-archaeological-charcoal mb-4">
                  Get in Touch
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-charcoal">Email</p>
                      <a 
                        href="mailto:contact@archdb.com"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        contact@archdb.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-charcoal">Phone</p>
                      <a 
                        href="tel:+1234567890"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-charcoal">Address</p>
                      <p className="text-sm text-archaeological-olive">
                        123 Archaeological Way<br />
                        Museum District<br />
                        Heritage City, ST 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-bold text-archaeological-charcoal mb-2">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm text-archaeological-olive">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 2:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-content">
                <h2 className="text-2xl font-bold text-archaeological-charcoal mb-6">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-archaeological-charcoal mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-archaeological-charcoal mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-archaeological-charcoal mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-archaeological-charcoal mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>

                <p className="mt-4 text-sm text-archaeological-olive text-center">
                  We typically respond within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 card">
          <div className="card-content">
            <h2 className="text-2xl font-bold text-archaeological-charcoal mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                  How do I get started with archDB?
                </h3>
                <p className="text-archaeological-olive">
                  Simply create an account and start adding artifacts to your collection. You can upload photos,
                  add GPS locations, and generate QR codes for easy artifact tracking.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                  Can I collaborate with museums?
                </h3>
                <p className="text-archaeological-olive">
                  Yes! We're actively working with museums to integrate their collections. Contact us to discuss
                  partnership opportunities.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                  Is archDB free to use?
                </h3>
                <p className="text-archaeological-olive">
                  We offer both free and premium tiers. The free tier includes basic features for individual
                  researchers and small collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUsPage


