import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Award, BarChart2, BookOpen, Globe, Pencil, Star, Target, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
})

export default function App() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en')

  const userTypes = [
    {
      title: language === 'en' ? "I'm a Parent" : 'Mimi ni Mzazi',
      icon: <Users className="size-10 text-(--color-kids-green)" />,
      color: 'var(--color-kids-green)',
      desc:
        language === 'en'
          ? (
              <>
                <span>Track your child's progress</span>
                <br />
                <span>and support their learning</span>
              </>
            )
          : 'Fuatilia maendeleo ya mtoto wako na kusaidia ujifunzaji wao',
      to: '/parent/login',
    },
    {
      title: language === 'en' ? "I'm a Teacher" : 'Mimi ni Mwalimu',
      icon: <BookOpen className="size-10 text-(--color-kids-blue)" />,
      color: 'var(--color-kids-blue)',
      desc:
        language === 'en'
          ? (
              <>
                <span>Manage your class, track student progress,</span>
                <br />
                <span>and access teaching materials</span>
              </>
            )
          : 'Simamia darasa lako, fuatilia maendeleo ya wanafunzi, na pata nyenzo za kufundishia',
      to: '/teacher/login',
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <div className="flex gap-2 p-2 rounded-xl bg-card shadow-md">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all tap-target-accessible',
              language === 'en' ? 'shadow-md bg-(--color-primary) text-white' : 'bg-transparent text-foreground'
            )}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('sw')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all tap-target-accessible',
              language === 'sw' ? 'shadow-md bg-(--color-primary) text-white' : 'bg-transparent text-foreground'
            )}
            aria-pressed={language === 'sw'}
          >
            Kiswahili
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12 sm:pt-32 sm:pb-16">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="mx-auto w-36 h-36 rounded-full flex items-center justify-center shadow-md border border-[var(--color-primary)]">
            <div className="bg-white rounded-full flex items-center justify-center w-[86%] h-[86%]">
              <img src="/kona.png" alt="Kona Ya Hisabati" className="h-20 w-auto" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {language === 'en' ? 'Welcome to' : 'Karibu'}
            <br />
            <span style={{ color: 'var(--color-kids-yellow)' }}>Kona Ya Hisabati</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto text-muted-foreground">
            {language === 'en'
              ? 'An interactive mathematics learning platform for Tanzanian early-grade students.'
              : 'Jukwaa la kujifunza hisabati kwa njia ya kuvutia kwa wanafunzi wa Tanzania.'}
          </p>

          <div className="flex justify-center gap-6 text-4xl sm:text-5xl">
            <Pencil className="size-7 animate-bounce text-(--color-primary)" />
            <BarChart2 className="size-7 animate-bounce text-(--color-kids-green)" />
            <Target className="size-7 animate-bounce text-(--color-accent)" />
            <Star className="size-7 animate-bounce text-(--color-kids-yellow)" />
          </div> 
        </div>
      </div>

      {/* User Type Selection */}
      <div className="container mx-auto px-4 pb-16 sm:pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{language === 'en' ? 'Choose Your Role' : 'Chagua Jukumu Lako'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {userTypes.map((type, index) => (
            <Link key={index} to={type.to} className="block">
              <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex flex-col items-center text-center space-y-4 p-6">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: `${type.color}20`, border: `4px solid ${type.color}` }}
                  >
                    {type.icon}
                  </div> 

                  <h3 className="text-xl sm:text-2xl font-bold">{type.title}</h3>

                  <p className="text-sm sm:text-base text-muted-foreground">{type.desc}</p>

                  <div className="pt-4 w-full">
                    <Button size="lg" className="w-full min-h-17.5">
                      {language === 'en' ? 'Get Started' : 'Anza Sasa'}
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">{language === 'en' ? 'Why Kona Ya Hisabati?' : 'Kwa Nini Kona Ya Hisabati?'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: <Pencil className="size-10 text-(--color-primary)" />, title: language === 'en' ? 'Interactive Learning' : 'Kujifunza kwa Kuvutia', desc: language === 'en' ? 'Fun games and activities' : 'Michezo na shughuli za kufurahisha' },
              { icon: <Globe className="size-10 text-(--color-kids-green)" />, title: language === 'en' ? 'Local Content' : 'Maudhui ya Kimitaani', desc: language === 'en' ? 'Designed for Tanzanian students' : 'Imeundwa kwa wanafunzi wa Tanzania' },
              { icon: <BarChart2 className="size-10 text-(--color-accent)" />, title: language === 'en' ? 'Track Progress' : 'Fuatilia Maendeleo', desc: language === 'en' ? 'Monitor learning achievements' : 'Angalia mafanikio ya kujifunza' },
              { icon: <Award className="size-10 text-(--color-kids-yellow)" />, title: language === 'en' ? 'Rewards & Badges' : 'Tuzo na Beji', desc: language === 'en' ? 'Earn rewards as you learn' : 'Pata tuzo unavyojifunza' },
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-3">
                <div>{feature.icon}</div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-white">© {new Date().getFullYear()} Kona Ya Hisabati. {language === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}</p>

            <div className="flex gap-6">
              <Link to="/about" className="text-sm sm:text-base text-white hover:underline">{language === 'en' ? 'About' : 'Kuhusu'}</Link>
              <Link to="/privacy" className="text-sm sm:text-base text-white hover:underline">{language === 'en' ? 'Privacy' : 'Faragha'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
