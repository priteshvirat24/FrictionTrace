'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FrictionButton from '@/components/FrictionButton';
import Onboarding from '@/components/Onboarding';
import MetaphorCanvas from '@/components/MetaphorCanvas';
import JudgeMode from '@/components/JudgeMode';
import Sidebar from '@/components/Sidebar';
import { FrictionCategory } from '@/lib/types';
import { addMoment, getSettings, updateSettings, getMoments } from '@/lib/storage';
import { Sparkles, ArrowRight, Mouse, Calendar, Search, Shield, Fingerprint, Users, VolumeX, SplitSquareHorizontal, Clock, CheckCircle2, Lock, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [momentCount, setMomentCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  
  const [judgeModeActive, setJudgeModeActive] = useState(false);
  const [judgeModeStep, setJudgeModeStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      setShowOnboarding(true);
    }
    setClasses(settings.classes);
    setMomentCount(getMoments().length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'j' || e.key === 'J') && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
        if (e.metaKey || e.ctrlKey) e.preventDefault();
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        setJudgeModeActive(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    updateSettings({ onboardingComplete: true });
    setShowOnboarding(false);
  }, []);

  const handleMomentLogged = useCallback(
    (data: {
      categories: FrictionCategory[];
      textNote?: string;
      classContext?: string;
    }) => {
      addMoment({ timestamp: new Date().toISOString(), ...data });
      setMomentCount((c) => c + 1);
    },
    []
  );

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF0E8', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      <div 
        style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}
      >
        {/* SIDEBAR */}
        <div style={{ opacity: judgeModeActive ? 0 : 1, transition: 'opacity 0.8s ease', pointerEvents: judgeModeActive ? 'none' : 'auto' }}>
          <Sidebar />
        </div>

        {/* HERO SECTION - Strictly flex-split */}
        <section style={{ height: '90vh', minHeight: '700px', display: 'flex', alignItems: 'stretch', padding: '0 0 0 4rem', position: 'relative' }}>
          
          {/* LEFT: TEXT (45%) */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem', paddingRight: '2rem', paddingTop: '8rem', zIndex: 20, opacity: judgeModeActive ? 0 : 1, transition: 'opacity 0.8s ease', pointerEvents: judgeModeActive ? 'none' : 'auto' }}>
            
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#EDDED0', color: '#985D48', padding: '0.4rem 1rem', borderRadius: '999px', width: 'max-content', fontSize: '0.75rem', fontWeight: 600 }}>
              <Sparkles size={14} color="#985D48" />
              AI investigates. You decide.
            </div>

            {/* Headline */}
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                  <span style={{ color: '#3A261D', display: 'block' }}>STOP MEASURING</span>
                  <span style={{ color: '#3A261D', display: 'block', marginBottom: '0.25rem' }}>THE CHILD.</span>
                  <span style={{ color: '#A35A52', display: 'block' }}>START MEASURING</span>
                  <span style={{ color: '#A35A52', display: 'block' }}>THE FRICTION.</span>
                </h1>

                {/* Subtitle */}
                <p style={{ fontSize: '1.1rem', color: '#5A453A', maxWidth: '90%', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                  Schools see the moment something goes wrong.<br/>
                  FrictionTrace helps reveal what happened before it.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                  <button className="btn-primary" style={{ padding: '1rem 1.8rem', fontSize: '1rem', borderRadius: '12px', background: '#3A261D', color: '#FAF0E8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                    Explore FrictionTrace
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setJudgeModeActive(true)} className="btn-secondary" style={{ padding: '1rem 1.8rem', fontSize: '1rem', borderRadius: '12px', background: '#C08C72', color: '#FAF0E8', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(192, 140, 114, 0.3)' }}>
                    <Sparkles size={18} />
                    30s Judge Mode
                  </button>
                </div>

                {/* Keyboard Hint */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <kbd style={{ fontFamily: 'var(--font-sans)', background: 'transparent', border: '1px solid #D6C2B6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#88624E', fontWeight: 600 }}>J</kbd>
                  <span style={{ fontSize: '0.85rem', color: '#88624E', fontWeight: 500 }}>Press J for Judge Mode</span>
                </div>
              </div>

          {/* RIGHT: 3D VISUAL (55%) */}
          <div 
            style={
              judgeModeActive ? {
                position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#FAF0E8', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              } : { 
                width: '55%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }
          >
            
            {/* Embedded 3D Canvas constrained purely to this div */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              {(() => {
                const getEnvironmentState = (step: number) => {
                  if (!judgeModeActive) return 'normal';
                  if (step === 2) return 'monday';
                  if (step === 3) return 'tuesday';
                  if (step === 4) return 'wednesday';
                  if (step === 5 || step === 6) return 'thursday';
                  if (step === 7 || step === 8) return 'pattern';
                  if (step === 9) return 'understanding';
                  return 'normal';
                };
                
                return (
                  <MetaphorCanvas 
                    frictionCount={momentCount} 
                    isJudgeMode={judgeModeActive} 
                    judgeModeStep={judgeModeStep} 
                    environmentState={getEnvironmentState(judgeModeStep)}
                  />
                );
              })()}
            </div>

          </div>
        </section>

        {/* ALL CONTENT BELOW HERO FADES OUT DURING JUDGE MODE */}
        <div style={{ opacity: judgeModeActive ? 0 : 1, transition: 'opacity 0.8s ease', pointerEvents: judgeModeActive ? 'none' : 'auto' }}>
          {/* FRICTION SENSOR - Prominent Full Width Section */}
            <section style={{ padding: '4rem', background: '#F8F1EB', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(214, 194, 182, 0.3)', borderBottom: '1px solid rgba(214, 194, 182, 0.3)', position: 'relative', zIndex: 25 }}>
              <div style={{ background: '#FAF0E8', padding: '2rem 4rem', borderRadius: '24px', border: '1px solid rgba(214, 194, 182, 0.4)', boxShadow: '0 10px 30px rgba(192, 140, 114, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#88624E', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  FRICTION SENSOR
                </div>
                
                <div>
                  <FrictionButton onMomentLogged={handleMomentLogged} classes={classes} />
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(214, 194, 182, 0.4)', margin: '1rem 0' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#5A453A', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Calendar size={14} strokeWidth={2.5} />
                  {momentCount} moments this week
                </div>
              </div>
            </section>

            {/* TIMELINE SECTION */}
            <section style={{ padding: '0 4rem 6rem', position: 'relative', zIndex: 10, marginTop: '-2rem' }}>
              <div style={{ background: '#FAF0E8', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '3rem', border: '1px solid rgba(214, 194, 182, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                  {/* Left: The Problem Text */}
                  <div>
                    <div style={{ display: 'inline-block', background: '#F4E7DB', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, color: '#88624E', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                      THE PROBLEM
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, color: '#3A261D', letterSpacing: '-0.02em' }}>
                      THE SCHOOL SEES THURSDAY.<br/>
                      <span style={{ color: '#A35A52' }}>FRICTIONTRACE SEES THE WHOLE WEEK.</span>
                    </h2>
                  </div>

                  {/* Right: Days */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'flex-start' }}>
                    {[
                      { day: 'MONDAY', title: 'Assignment\nchanges verbally', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
                      { day: 'TUESDAY', title: 'Cafeteria is\ntoo loud', icon: 'M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' },
                      { day: 'WEDNESDAY', title: 'Schedule changes\nwithout warning', icon: 'M17 2.1l4 4-4 4 M3 12.2v-2a4 4 0 0 1 4-4h13.8 M7 21.9l-4-4 4-4 M21 11.8v2a4 4 0 0 1-4 4H3.2' },
                      { day: 'THURSDAY', title: 'Student\nshuts down', isBreakdown: true, icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 15h8 M9 9h.01 M15 9h.01' }
                    ].map((event, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#88624E', letterSpacing: '0.05em' }}>
                          {event.day}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3A261D', lineHeight: 1.4, minHeight: '3rem', whiteSpace: 'pre-line' }}>
                          {event.title}
                        </div>
                        {event.isBreakdown ? 
                          <svg style={{ color: '#A35A52', marginTop: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={event.icon} /></svg>
                          :
                          <svg style={{ color: '#D6C2B6', marginTop: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={event.icon} /></svg>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Line */}
                <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
                  {/* Background Track */}
                  <div style={{ position: 'absolute', top: '50%', left: '33%', right: '12%', height: '2px', background: 'linear-gradient(to right, rgba(214, 194, 182, 0.4), rgba(163, 90, 82, 0.2), #A35A52)', transform: 'translateY(-50%)' }} />
                  
                  {/* Points */}
                  <div style={{ position: 'absolute', left: '33%', width: '67%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '0', top: '-5px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid rgba(192, 140, 114, 0.5)', background: '#FAF0E8' }} /></div>
                    <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '0', top: '-5px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid rgba(163, 90, 82, 0.6)', background: '#FAF0E8' }} /></div>
                    <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '0', top: '-5px', width: '10px', height: '10px', borderRadius: '50%', background: '#A35A52' }} /></div>
                    <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '0', top: '-7px', width: '14px', height: '14px', borderRadius: '50%', background: '#A35A52', border: '3px solid #FAF0E8', boxShadow: '0 0 0 1px #A35A52' }} /></div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#88624E', marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Mouse size={16} />
                Drag to explore the environment
              </div>
            </section>

            {/* CONCEPTUAL SHIFT SECTION */}
            <section style={{ padding: '6rem 4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#88624E', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>Traditional Systems Ask:</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 600, color: '#6A564A', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
                  "What's wrong with the student?"
                </h3>
              </div>
              
              <div style={{ width: '2px', height: '60px', background: 'linear-gradient(to bottom, rgba(192, 140, 114, 0), rgba(163, 90, 82, 0.5), rgba(192, 140, 114, 0))' }} />

              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A35A52', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>FrictionTrace Asks:</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#3A261D', letterSpacing: '-0.02em' }}>
                  "What's creating friction in the environment?"
                </h3>
              </div>
            </section>

            {/* ENVIRONMENTAL FRICTION SECTION */}
            <section style={{ padding: '4rem', background: '#F8F1EB', borderTop: '1px solid rgba(214, 194, 182, 0.3)', borderBottom: '1px solid rgba(214, 194, 182, 0.3)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#3A261D', letterSpacing: '-0.02em' }}>
                    Friction hides in plain sight.
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: '#6A564A', marginTop: '1rem' }}>
                    Different environmental conditions create different patterns of friction.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                  {[
                    { icon: <VolumeX size={24} />, title: 'Noise', desc: 'Overwhelming auditory input in cafeterias or halls.' },
                    { icon: <Users size={24} />, title: 'Crowding', desc: 'Too many bodies moving through confined spaces.' },
                    { icon: <Clock size={24} />, title: 'Unexpected Change', desc: 'Sudden schedule shifts without warning.' },
                    { icon: <SplitSquareHorizontal size={24} />, title: 'Transitions', desc: 'Moving from high-energy to low-energy tasks.' },
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#FAF0E8', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(214, 194, 182, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ color: '#A35A52', marginBottom: '1.5rem', background: 'rgba(163, 90, 82, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        {item.icon}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3A261D', marginBottom: '0.75rem' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#6A564A', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AGENTIC AI SECTION */}
            <section style={{ padding: '6rem 4rem' }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A35A52', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <Search size={16} /> AI INVESTIGATION
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#3A261D', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    AI investigates.<br/>You decide.
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#6A564A', marginTop: '1.5rem', lineHeight: 1.6 }}>
                    FrictionTrace doesn't diagnose students. Instead, our autonomous AI agent investigates the environmental evidence surrounding a moment of friction, looking for historical patterns and triggers.
                  </p>
                  <p style={{ fontSize: '1.1rem', color: '#6A564A', marginTop: '1rem', lineHeight: 1.6 }}>
                    It prepares insights for the student to review. The student always has the final say on what it means.
                  </p>
                </div>
                <div style={{ background: '#FAF0E8', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(214, 194, 182, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#88624E', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>AGENT ACTIVITY LOG</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      'Observed moment logged at 2:15 PM',
                      'Retrieved schedule context: Math class',
                      'Compared with 3 similar previous situations',
                      'Identified pattern: Unexpected transition',
                      'Prepared insight draft for student review'
                    ].map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <CheckCircle2 size={18} color="#A35A52" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.95rem', color: '#3A261D', fontWeight: 500 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FRICTION RECEIPT SHOWCASE */}
            <section style={{ padding: '6rem 4rem', background: '#3A261D', color: '#FAF0E8' }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#FAF0E8', letterSpacing: '-0.02em' }}>
                    The Friction Receipt
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#D6C2B6', marginTop: '1rem', maxWidth: '600px' }}>
                    A clear, student-owned document outlining exactly what happened, without medicalizing the behavior.
                  </p>
                </div>

                <div style={{ background: '#FAF0E8', borderRadius: '12px', padding: '3rem', width: '100%', maxWidth: '600px', color: '#3A261D', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px dashed rgba(214, 194, 182, 0.5)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#88624E' }}>FRICTION RECEIPT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>Thursday, 2:15 PM</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#88624E', textTransform: 'uppercase' }}>What Happened</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Schedule changed from maths to assembly.</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#88624E', textTransform: 'uppercase' }}>What I Experienced</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Unexpected transition + crowded hall.</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#88624E', textTransform: 'uppercase' }}>What Helped Before</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Five-minute verbal warning.</div>
                    </div>
                    <div style={{ background: '#F8F1EB', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #A35A52' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A35A52', textTransform: 'uppercase' }}>What I want adults to know</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem', fontStyle: 'italic' }}>"I need warning before switching activities."</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PRIVACY SECTION */}
            <section style={{ padding: '6rem 4rem', textAlign: 'center' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Lock size={48} color="#A35A52" strokeWidth={1.5} style={{ margin: '0 auto 2rem' }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 800, color: '#3A261D', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Nothing about me<br/>without me.
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#6A564A', marginTop: '1.5rem', lineHeight: 1.6 }}>
                  Student-owned data. No hidden monitoring. No webcam emotion detection. No automatic sharing to teachers. The student always decides what evidence gets shared.
                </p>
              </div>
            </section>

            {/* FINAL CTA & FOOTER */}
            <section style={{ padding: '6rem 4rem', background: '#F8F1EB', borderTop: '1px solid rgba(214, 194, 182, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#3A261D', textAlign: 'center', marginBottom: '2.5rem' }}>
                See the pattern.<br/>Understand the friction.
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowOnboarding(true)}
                  style={{ background: '#3A261D', color: '#FAF0E8', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background var(--transition-fast)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2A1A13'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#3A261D'}
                >
                  Explore FrictionTrace
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setJudgeModeActive(true)}
                  style={{ background: 'transparent', color: '#A35A52', border: '2px solid #A35A52', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-fast)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#A35A52'; e.currentTarget.style.color = '#FAF0E8'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A35A52'; }}
                >
                  <Sparkles size={18} />
                  30s Judge Mode
                </button>
              </div>
            </section>

          <footer style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(214, 194, 182, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3A261D', fontWeight: 700, fontSize: '0.9rem' }}>
              <Zap size={16} fill="currentColor" /> FrictionTrace
            </div>
            <div style={{ fontSize: '0.85rem', color: '#88624E' }}>
              Student-owned friction logging.
            </div>
          </footer>

        </div>
      </div>

      <JudgeMode 
        isActive={judgeModeActive} 
        onClose={() => setJudgeModeActive(false)} 
        onStepChange={setJudgeModeStep}
      />
    </div>
  );
}
