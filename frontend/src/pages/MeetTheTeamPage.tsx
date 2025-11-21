import React from 'react'
import { Users, Mail, Github, Linkedin, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MeetTheTeamPage: React.FC = () => {
  const navigate = useNavigate()

  // Placeholder team members - to be filled in later
  const teamMembers = [
    {
      name: 'Team Member 1',
      role: 'Project Lead',
      bio: 'Passionate about preserving archaeological heritage through technology.',
      avatar: '👨‍💼',
      email: 'member1@archdb.com',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Team Member 2',
      role: 'Lead Developer',
      bio: 'Building innovative solutions for artifact management and discovery.',
      avatar: '👩‍💻',
      email: 'member2@archdb.com',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Team Member 3',
      role: 'Archaeologist',
      bio: 'Expert in archaeological classification and artifact preservation.',
      avatar: '👨‍🔬',
      email: 'member3@archdb.com',
      github: '#',
      linkedin: '#'
    },
    {
      name: 'Team Member 4',
      role: 'UI/UX Designer',
      bio: 'Creating intuitive and beautiful interfaces for artifact exploration.',
      avatar: '👩‍🎨',
      email: 'member4@archdb.com',
      github: '#',
      linkedin: '#'
    },
  ]

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
            <Users className="w-12 h-12 text-primary-400" />
            <h1 className="text-4xl font-bold">Meet the Team</h1>
          </div>
          <p className="text-archaeological-sage text-lg max-w-3xl">
            Get to know the passionate individuals behind archDB - dedicated to preserving and
            sharing archaeological heritage through innovative technology.
          </p>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="card text-center hover:shadow-xl transition-shadow">
              <div className="card-content">
                {/* Avatar */}
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full flex items-center justify-center text-5xl">
                    {member.avatar}
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-archaeological-charcoal mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-archaeological-olive text-sm mb-4">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 rounded-full bg-archaeological-warmGray hover:bg-primary-100 transition-colors"
                    title="Email"
                  >
                    <Mail className="w-4 h-4 text-archaeological-charcoal" />
                  </a>
                  <a
                    href={member.github}
                    className="p-2 rounded-full bg-archaeological-warmGray hover:bg-primary-100 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4 text-archaeological-charcoal" />
                  </a>
                  <a
                    href={member.linkedin}
                    className="p-2 rounded-full bg-archaeological-warmGray hover:bg-primary-100 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-archaeological-charcoal" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="mt-16 card">
          <div className="card-content">
            <h2 className="text-2xl font-bold text-archaeological-charcoal mb-4 text-center">
              Our Mission
            </h2>
            <p className="text-archaeological-charcoal text-center max-w-3xl mx-auto leading-relaxed">
              At archDB, we believe in making archaeological discoveries accessible to everyone.
              Our team combines expertise in archaeology, technology, and design to create a
              platform that bridges the gap between ancient artifacts and modern discovery. We're
              committed to preserving cultural heritage while embracing innovative solutions for
              artifact management, documentation, and sharing.
            </p>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-lg shadow-archaeological-md p-8">
            <h3 className="text-xl font-bold text-archaeological-charcoal mb-2">
              Want to Join Our Team?
            </h3>
            <p className="text-archaeological-olive mb-4">
              We're always looking for passionate individuals to join our mission.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="btn btn-primary"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetTheTeamPage

