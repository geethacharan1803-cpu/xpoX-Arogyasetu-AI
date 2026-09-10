'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Globe, Volume2, Loader } from 'lucide-react';

const LANGUAGES = [
  { code: 'te-IN', label: 'Telugu', name: 'Telugu' },
  { code: 'hi-IN', label: 'Hindi', name: 'Hindi' },
  { code: 'en-IN', label: 'English', name: 'English' },
];

export default function AshaVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [translation, setTranslation] = useState('');
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = () => {
    setError('');
    setTranscript('');
    setTranslation('');
    setDetectedLang('');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      const langInfo = LANGUAGES.find(l => l.code === selectedLang);
      setDetectedLang(langInfo?.name || selectedLang);

      if (event.results[0]?.isFinal) {
        setIsRecording(false);
        handleTranslation(text, selectedLang);
      }
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else {
        setError('Something went wrong with voice recognition. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleTranslation = async (text, lang) => {
    if (!text || lang === 'en-IN') {
      setTranslation('');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: lang, targetLang: 'en-IN' }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslation(data.translation || '');
      } else {
        // Fallback demo translation
        setTranslation('[Translation service unavailable - demo mode]');
      }
    } catch (e) {
      setTranslation('[Translation service unavailable - demo mode]');
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || selectedLang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ArogyaVani</h1>
        <p className="page-subtitle">Voice-powered health communication assistant</p>
      </div>

      {/* Language Selector */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Language
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`btn ${selectedLang === lang.code ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedLang(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recorder */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
          {isRecording ? 'Listening... Speak now' : 'Tap the microphone to start recording'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
          <button
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff /> : <Mic />}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ textAlign: 'left' }}>
            {error}
            <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'var(--space-sm)' }} onClick={() => { setError(''); startRecording(); }}>
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header">
            <h3 className="card-title">Original Transcript ({detectedLang})</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => speak(transcript, selectedLang)}>
              <Volume2 size={14} /> Listen
            </button>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontStyle: 'italic' }}>
            &ldquo;{transcript}&rdquo;
          </div>
        </div>
      )}

      {/* Translation */}
      {processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="loading-container" style={{ padding: 'var(--space-md)' }}>
            <div className="spinner" />
            <span>Translating...</span>
          </div>
        </div>
      )}

      {translation && !processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header">
            <h3 className="card-title">English Translation</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => speak(translation, 'en-IN')}>
              <Volume2 size={14} /> Listen
            </button>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            &ldquo;{translation}&rdquo;
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>How to use ArogyaVani</h3>
        <ol style={{ paddingLeft: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          <li style={{ marginBottom: 'var(--space-sm)' }}>Select the language the patient speaks</li>
          <li style={{ marginBottom: 'var(--space-sm)' }}>Tap the microphone button to start recording</li>
          <li style={{ marginBottom: 'var(--space-sm)' }}>Ask the patient to describe their symptoms</li>
          <li style={{ marginBottom: 'var(--space-sm)' }}>The system will transcribe and translate automatically</li>
          <li style={{ marginBottom: 'var(--space-sm)' }}>Use the transcript when creating a health ticket</li>
        </ol>
      </div>
    </div>
  );
}
