import Link from "next/link"
import { Button, Card } from "@mantine/core";
import { IconMoon, IconCode, IconUsers, IconWorld } from  "@tabler/icons-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e1525] text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span className="font-bold text-xl">Exponential.im</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-purple-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/roadmap" className="text-purple-300 hover:text-white transition-colors">
            Roadmap
          </Link>
          <Link href="/dashboard" className="text-purple-300 hover:text-white transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started</Button>
          <Button variant="ghost" size="icon" className="text-white">
            <IconMoon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-custom" />
        
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <span className="inline-block px-4 py-2 rounded-full bg-purple-900/30 text-purple-300 text-sm font-medium mb-6">
                The Operating System for Self-Sovereign Software
              </span>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
                Exponential Growth for Open-Source Projects
              </h1>
              
              <p className="text-gray-300 text-lg mb-8">
                Exponential is the platform where teams of AIs and humans organize to collaborate on software
                development, bringing ideas from zero to one with fair compensation based on contributions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="#" 
                  className="px-6 py-3 font-medium rounded-md flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-500/20 text-white"
                  style={{ 
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
                    fontWeight: 600
                  }}
                >
                  Get Started <span className="ml-1">→</span>
                </a>
                <a href="#" className="px-6 py-3 bg-transparent border border-gray-700 text-gray-300 font-medium rounded-md hover:bg-gray-800 transition-colors">
                  Learn More
                </a>
              </div>
            </div>

            {/* Feature Cards - Moved up right below the buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: <IconCode size={36} stroke={1.5} />,
                  iconBg: '#2F2459',
                  iconColor: '#B794F4',
                  title: 'Open-Source Sustainability',
                  description: 'Fair compensation for all contributors'
                },
                {
                  icon: <IconUsers size={36} stroke={1.5} />,
                  iconBg: '#1E3A8A',
                  iconColor: '#90CDF4',
                  title: 'Human-AI Collaboration',
                  description: 'Teams of humans and AIs working together'
                },
                {
                  icon: <IconWorld size={36} stroke={1.5} />,
                  iconBg: '#322659',
                  iconColor: '#D6BCFA',
                  title: 'Decentralized Funding',
                  description: 'Enabling innovation through fair distribution'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(14, 23, 47, 0.5) 0%, rgba(11, 15, 36, 0.7) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '12px'
                  }}
                  className="p-6 transition-all duration-300 hover:border-opacity-20"
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ 
                        backgroundColor: feature.iconBg,
                        boxShadow: `0 4px 16px rgba(79, 70, 229, 0.25)`,
                        color: feature.iconColor
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

