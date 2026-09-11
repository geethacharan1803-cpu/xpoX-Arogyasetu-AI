'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Globe, Volume2, Loader, Camera, X } from 'lucide-react';

const LANGUAGES = [
  { code: 'te-IN', label: 'Telugu', name: 'Telugu' },
  { code: 'hi-IN', label: 'Hindi', name: 'Hindi' },
  { code: 'en-IN', label: 'English', name: 'English' },
];

export default function AshaVoice() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [translation, setTranslation] = useState('');
  const [aiGuidance, setAiGuidance] = useState('');
  const [selectedLang, setSelectedLang] = useState('te-IN');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [urgency, setUrgency] = useState('routine');
  const recognitionRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const DEMO_PROMPTS = {
    'te-IN': [
      { label: 'High Fever & Chills', text: 'నాకు మూడు రోజుల నుండి తీవ్రమైన జ్వరం మరియు వణుకు ఉంది, చాలా నీరసంగా ఉంది.' },
      { label: 'Pregnancy Nausea & Pain', text: 'నాకు గర్భం 7వ నెల, పొత్తికడుపులో కొద్దిగా నొప్పిగా ఉంది, తల తిరుగుతోంది.' },
    ],
    'hi-IN': [
      { label: 'Dizziness & High Sugar', text: 'मुझे सुबह से चक्कर आ रहे हैं और बहुत प्यास लग रही है, कमजोरी महसूस हो रही है।' },
      { label: 'Chest Tightness', text: 'सीने में भारीपन महसूस हो रहा है और सांस लेने में हल्की तकलीफ है।' },
    ],
    'en-IN': [
      { label: 'Persistent Cough', text: 'I have had a dry cough for the last two weeks with mild evening fever.' },
    ],
  };

  const handleImageAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setAttachedImage({ base64, mimeType: file.type, name: file.name });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processVoiceIntake = async (text, lang) => {
    setProcessing(true);
    setAiGuidance('');
    try {
      // 1. Fetch translation for PHC doctor review
      const resTrans = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: lang, targetLang: 'en-IN' }),
      });
      const dataTrans = await resTrans.json();
      const englishText = dataTrans.translation || text;
      setTranslation(englishText);

      // 2. Assess urgency based on symptoms
      const lower = (text + ' ' + englishText).toLowerCase();
      let detectedUrgency = 'routine';
      if (lower.includes('chest') || lower.includes('breath') || lower.includes('సీనె') || lower.includes('రక్తం') || lower.includes('severe') || lower.includes('తీవ్రమైన')) {
        detectedUrgency = 'emergency';
      } else if (lower.includes('fever') || lower.includes('pain') || lower.includes('జ్వరం') || lower.includes('నొప్పి') || lower.includes('बुखार') || lower.includes('दर्द') || lower.includes('sugar') || lower.includes('dizziness')) {
        detectedUrgency = 'urgent';
      }
      setUrgency(detectedUrgency);

      // 2b. If image is attached, also get AI assessment with image
      if (attachedImage) {
        try {
          const aiRes = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Voice intake transcript: ${englishText}. An image has been attached for visual assessment.`,
              context: `Patient symptoms described via voice in ${lang}. Original: ${text}`,
              imageBase64: attachedImage.base64,
              imageMimeType: attachedImage.mimeType,
            }),
          });
          const aiData = await aiRes.json();
          if (aiData.response) {
            // Combine image assessment with vernacular guidance
            const imageNote = `\n\n📷 Image Assessment: ${aiData.response}`;
            // Set urgency from combined assessment
            if (aiData.response.toLowerCase().includes('emergency') || aiData.response.toLowerCase().includes('critical')) {
              detectedUrgency = 'emergency';
              setUrgency('emergency');
            }
            setAiGuidance((prev) => prev + imageNote);
            return; // skip the default vernacular advice below since we have AI response
          }
        } catch (imgErr) {
          // Fall through to standard vernacular guidance
        }
      }

      // 3. Generate safe vernacular guidance
      let vernacularAdvice = '';
      if (lang === 'te-IN') {
        vernacularAdvice = detectedUrgency === 'emergency'
          ? 'అత్యవసర హెచ్చరిక: రోగికి తక్షణమే సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) వద్ద వైద్య సహాయం అవసరం. వైద్యుని పర్యవేక్షణ లేకుండా మందులు ఇవ్వవద్దు.'
          : 'ప్రాథమిక సలహా: రోగిని విశ్రాంతి తీసుకోమని, పుష్కలంగా నీరు త్రాగమని చెప్పండి. లక్షణాలను నమోదు చేసి PHC వైద్యుని సమీక్ష కోసం హెల్త్ టిక్కెట్ రూపొందించండి.';
      } else if (lang === 'hi-IN') {
        vernacularAdvice = detectedUrgency === 'emergency'
          ? 'आपातकालीन चेतावनी: मरीज को तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) ले जाएं। बिना डॉक्टर की सलाह कोई दवा न दें।'
          : 'प्राथमिक सलाह: मरीज को पर्याप्त पानी पीने और आराम करने की सलाह दें। लक्षणों का हेल्थ टिकट बनाकर डॉक्टर से परामर्श लें।';
      } else {
        vernacularAdvice = detectedUrgency === 'emergency'
          ? 'EMERGENCY ALERT: Immediate clinical referral to nearest PHC/Hospital is recommended. Do not administer unverified medication.'
          : 'Protocol Guidance: Encourage patient hydration and rest. Create a Health Ticket for PHC Medical Officer assessment.';
      }
      setAiGuidance(vernacularAdvice);
    } catch (e) {
      setTranslation(text);
      setAiGuidance('Guidance: Please record vitals and consult the PHC Medical Officer.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectDemoPrompt = (promptText) => {
    setTranscript(promptText);
    const langInfo = LANGUAGES.find(l => l.code === selectedLang);
    setDetectedLang(langInfo?.name || selectedLang);
    processVoiceIntake(promptText, selectedLang);
  };

  const startRecording = () => {
    setError('');
    setTranscript('');
    setTranslation('');
    setAiGuidance('');
    setDetectedLang('');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition is not supported in this browser. Please use Chrome/Edge or select one of the quick test prompts below.');
      return;
    }

    try {
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
          processVoiceIntake(text, selectedLang);
        }
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try speaking into the microphone or use the quick test prompts below.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access blocked. Enable permissions or test with the quick voice samples below.');
        } else {
          setError('Speech recognition note: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      setError('Voice recognition initialization error. Please select a sample prompt below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || selectedLang;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateTicketFromVoice = () => {
    router.push('/asha/tickets');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ArogyaVani</h1>
        <p className="page-subtitle">Vernacular voice-first health intake & triage assistant</p>
      </div>

      {/* Language Selector */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
          <h3 className="card-title">
            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Select Spoken Language (భాష / भाषा)
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
                setTranslation('');
                setAiGuidance('');
              }}
            >
              {lang.label} ({lang.code === 'te-IN' ? 'తెలుగు' : lang.code === 'hi-IN' ? 'हिन्दी' : 'English'})
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recorder */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl) var(--space-md)' }}>
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
          {isRecording ? '🎙️ Listening... Speak now in ' + LANGUAGES.find(l => l.code === selectedLang)?.name : 'Tap microphone to start voice recording'}
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

        {/* Quick Demo Field Prompts */}
        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
          <span className="text-xs text-muted" style={{ display: 'block', marginBottom: 'var(--space-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Field Voice Samples (1-Click Demo)
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(DEMO_PROMPTS[selectedLang] || DEMO_PROMPTS['te-IN']).map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectDemoPrompt(sample.text)}
              >
                &ldquo;{sample.label}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attach Photo — Feature 1: Multimodal Triage */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
          <h3 className="card-title">
            <Camera size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Attach Photo (Optional)
          </h3>
          <p className="text-xs text-muted">Attach a photo of wound, rash, swelling, or printed prescription for AI-assisted visual triage</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Camera size={16} />
            {attachedImage ? 'Change Photo' : 'Select Photo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageAttach}
              style={{ display: 'none' }}
            />
          </label>
          {attachedImage && (
            <button className="btn btn-sm btn-secondary" onClick={removeAttachedImage} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <X size={14} /> Remove
            </button>
          )}
        </div>
        {imagePreview && (
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
            <img
              src={imagePreview}
              alt="Attached photo preview"
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-border)' }}
            />
            <div>
              <span className="badge badge-info">📷 Photo Attached</span>
              <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
                {attachedImage.name} — will be included with next voice intake submission
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Results */}
      {transcript && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Original Patient Voice Transcript</h3>
              <span className="badge badge-info">{detectedLang || 'Vernacular'}</span>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => speak(transcript, selectedLang)}>
              <Volume2 size={14} /> Listen ({selectedLang.split('-')[0].toUpperCase()})
            </button>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-base)', fontWeight: 500, fontStyle: 'italic', marginTop: 'var(--space-sm)' }}>
            &ldquo;{transcript}&rdquo;
          </div>
        </div>
      )}

      {/* Processing Spinner */}
      {processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="loading-container" style={{ padding: 'var(--space-md)' }}>
            <div className="spinner" />
            <span>Processing vernacular voice with clinical triage safety...</span>
          </div>
        </div>
      )}

      {/* Triage & Guidance */}
      {aiGuidance && !processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)', borderLeft: urgency === 'emergency' ? '4px solid var(--color-danger)' : urgency === 'urgent' ? '4px solid var(--color-warning)' : '4px solid var(--color-success)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Vernacular Healthcare Guidance</h3>
              <span className={`badge ${urgency === 'emergency' ? 'badge-danger' : urgency === 'urgent' ? 'badge-warning' : 'badge-success'}`}>
                {urgency === 'emergency' ? 'EMERGENCY' : urgency === 'urgent' ? 'URGENT REVIEW' : 'ROUTINE'}
              </span>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => speak(aiGuidance, selectedLang)}>
              <Volume2 size={14} /> Speak to Patient
            </button>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-sm)' }}>
            <p className="text-sm font-semibold">{aiGuidance}</p>
            <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              ⚠️ AI Safety: Guidance only. Clinical decisions remain strictly with the Medical Officer.
            </p>
          </div>
        </div>
      )}

      {/* Doctor-Facing Translation */}
      {translation && !processing && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header">
            <h3 className="card-title">Doctor-Facing Clinical Summary (English)</h3>
            <span className="badge badge-neutral">For PHC Review</span>
          </div>
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-sm)' }}>
            <p className="text-sm">&ldquo;{translation}&rdquo;</p>
          </div>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleCreateTicketFromVoice}>
              Generate Health Ticket from this Intake
            </button>
          </div>
        </div>
      )}

      {/* System Guidelines */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-sm)' }}>ArogyaVani Vernacular Voice Architecture</h3>
        <p className="text-sm text-secondary">
          Voice records are captured in the patient&apos;s native dialect, transcribed directly in their original script, and preserved in the audit log. Safe guidance is spoken back in the same vernacular dialect, while an English structured summary is dispatched to the Medical Officer&apos;s desk.
        </p>
      </div>
    </div>
  );
}
