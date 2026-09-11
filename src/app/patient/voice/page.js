'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Globe, Volume2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const LANGUAGES = [
  { code: 'te-IN', label: 'Telugu', name: 'Telugu' },
  { code: 'hi-IN', label: 'Hindi', name: 'Hindi' },
  { code: 'en-IN', label: 'English', name: 'English' },
];

export default function PatientVoice() {
  const router = useRouter();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [guidance, setGuidance] = useState('');
  const [selectedLang, setSelectedLang] = useState('te-IN');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [manualText, setManualText] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const SAMPLES = {
    'te-IN': [
      { label: 'Fever advice', text: 'నాకు నిన్నటి నుండి కొద్దిగా జ్వరం ఉంది, నేను ఏ ఆహారం తీసుకోవాలి?' },
      { label: 'Taking medicines', text: 'నా బిపి మందులను భోజనానికి ముందు వేసుకోవాలా లేదా తర్వాతనా?' },
    ],
    'hi-IN': [
      { label: 'Fever advice', text: 'मुझे कल से हल्का बुखार है, क्या मुझे आराम करना चाहिए?' },
      { label: 'Water intake', text: 'गर्मी के मौसम में कितना पानी पीना चाहिए?' },
    ],
    'en-IN': [
      { label: 'Hydration advice', text: 'How much water should I drink while recovering from fever?' },
    ],
  };

  const processQuery = async (text, lang) => {
    if (!text || !text.trim()) return;
    setProcessing(true);
    setError('');

    try {
      // Call AI endpoint
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: `Patient question asked in ${lang}. Provide safe public health educational guidance. Remind them to consult PHC doctor or ASHA worker for clinical treatment.`,
        }),
      });

      const data = await res.json();
      setGuidance(data.response || 'Please consult your PHC Medical Officer or ASHA worker for personalized medical advice.');

      // Save to voice records in database
      await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user?.patientId || 'P-2026-001',
          transcript: text,
          detectedLanguage: lang,
          aiSummary: data.response,
          createdBy: user?.name || 'Patient',
        }),
      });
    } catch (e) {
      console.error('Error processing patient voice:', e);
      setGuidance('Please rest, stay hydrated with clean water, and contact your local ASHA worker if symptoms persist.');
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = () => {
    setError('');
    setTranscript('');
    setGuidance('');
    transcriptRef.current = '';

    if (typeof window === 'undefined' || (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      setError('Browser voice recognition not supported. Please type in the text box below or click a sample question.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) {
          setTranscript(text);
          transcriptRef.current = text;
          const langInfo = LANGUAGES.find(l => l.code === selectedLang);
          setDetectedLang(langInfo?.name || selectedLang);
        }
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        if (transcriptRef.current) {
          processQuery(transcriptRef.current, selectedLang);
        } else {
          setError('Microphone notice: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcriptRef.current) {
          processQuery(transcriptRef.current, selectedLang);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      setError('Voice recognition error. Please select a sample prompt or type below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (transcriptRef.current) {
      processQuery(transcriptRef.current, selectedLang);
    }
  };

  const speak = (text, lang) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || selectedLang;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectSample = (text) => {
    setTranscript(text);
    transcriptRef.current = text;
    processQuery(text, selectedLang);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    transcriptRef.current = manualText.trim();
    processQuery(manualText.trim(), selectedLang);
    setManualText('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Voice Health Assistant</h1>
        <p className="page-subtitle">Ask questions about your health and medications in your native language</p>
      </div>

      {/* Language selector */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
          <h3 className="card-title">
            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Select Your Language (భాష / भाषा)
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`btn ${selectedLang === lang.code ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setSelectedLang(lang.code);
                setTranscript('');
                setGuidance('');
              }}
            >
              {lang.label} ({lang.code === 'te-IN' ? 'తెలుగు' : lang.code === 'hi-IN' ? 'हिन्दी' : 'English'})
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recorder Card */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}>
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
          {isRecording ? '🎙️ Listening... Speak now in ' + LANGUAGES.find(l => l.code === selectedLang)?.name : 'Tap microphone to speak your question'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <button
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff /> : <Mic />}
          </button>
        </div>

        {error && (
          <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: 'var(--space-md)' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Quick Sample Questions */}
        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
          <span className="text-xs text-muted" style={{ display: 'block', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' }}>
            Quick Sample Questions (1-Click Test)
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(SAMPLES[selectedLang] || SAMPLES['te-IN']).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectSample(sample.text)}
              >
                &ldquo;{sample.label}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Direct Text Input */}
        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)', textAlign: 'left' }}>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Or type your health question here..."
              value={manualText}
              onChange={e => setManualText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              Ask Assistant
            </button>
          </form>
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header">
            <h3 className="card-title">Your Question</h3>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontStyle: 'italic' }}>
            &ldquo;{transcript}&rdquo;
          </div>
        </div>
      )}

      {/* Spinner */}
      {processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="loading-container" style={{ padding: 'var(--space-md)' }}>
            <div className="spinner" />
            <span>Consulting clinical public health guidance...</span>
          </div>
        </div>
      )}

      {/* Guidance */}
      {guidance && !processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)', borderLeft: '4px solid var(--color-primary)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Health Information Response</h3>
            <button className="btn btn-sm btn-primary" onClick={() => speak(guidance, selectedLang)}>
              <Volume2 size={14} /> Listen
            </button>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-sm)' }}>
            <p className="text-sm font-semibold">{guidance}</p>
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-sm)' }}>
              ⚠️ Disclaimer: This assistant provides general health education only. For diagnosis or prescriptions, always consult your PHC Medical Officer or ASHA worker.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/patient/ticket')}>
              View My Health Tickets <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
