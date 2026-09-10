import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Smart vernacular fallback dictionary for offline & demo mode
    const getDemoTranslation = (inputText, src, tgt) => {
      const lower = inputText.toLowerCase();

      // Telugu to English
      if (src === 'te-IN' || lower.includes('జ్వరం') || lower.includes('నొప్పి') || lower.includes('నీరసం') || lower.includes('గర్భం') || lower.includes('దగ్గు')) {
        if (lower.includes('తీవ్రమైన జ్వరం') || lower.includes('వణుకు')) {
          return 'Patient reports high fever with chills and severe weakness for the past 3 days.';
        }
        if (lower.includes('గర్భం') || lower.includes('నొప్పి') || lower.includes('తల తిరుగుతోంది')) {
          return 'Patient is in the 7th month of pregnancy reporting lower abdominal cramps and mild dizziness.';
        }
        if (lower.includes('దగ్గు')) {
          return 'Patient presents with persistent cough for more than 2 weeks with evening low-grade fever.';
        }
        if (lower.includes('చక్కర') || lower.includes('షుగర్')) {
          return 'Patient reports elevated blood sugar levels, fatigue, and frequent urination.';
        }
        return `[Translated from Telugu]: ${inputText}`;
      }

      // Hindi to English
      if (src === 'hi-IN' || lower.includes('बुखार') || lower.includes('चक्कर') || lower.includes('सीने') || lower.includes('दर्द')) {
        if (lower.includes('चक्कर') || lower.includes('कमजोरी')) {
          return 'Patient complains of morning dizziness, extreme thirst, and generalized weakness.';
        }
        if (lower.includes('सीने') || lower.includes('सांस')) {
          return 'Patient reports chest heaviness and mild shortness of breath on exertion.';
        }
        if (lower.includes('बुखार') || lower.includes('दर्द')) {
          return 'Patient presents with high fever and body ache since yesterday.';
        }
        return `[Translated from Hindi]: ${inputText}`;
      }

      // English to Telugu
      if (tgt === 'te-IN') {
        return `రోగికి సూచనలు: వైద్యుల సలహా మేరకు మందులను క్రమం తప్పకుండా వాడండి మరియు పుష్కలంగా నీరు త్రాగండి.`;
      }

      // English to Hindi
      if (tgt === 'hi-IN') {
        return `मरीज के लिए निर्देश: डॉक्टर की सलाह के अनुसार नियमित दवा लें और पर्याप्त आराम करें।`;
      }

      return inputText;
    };

    // If no valid API key, return demo translation
    if (!apiKey || apiKey === 'demo') {
      return NextResponse.json({
        translation: getDemoTranslation(text, sourceLang, targetLang),
        sourceLang: sourceLang || 'unknown',
        targetLang: targetLang || 'en-IN',
        mode: 'demo',
      });
    }

    // Use Gemini API for translation
    try {
      const sourceLabel = sourceLang === 'hi-IN' ? 'Hindi' : sourceLang === 'te-IN' ? 'Telugu' : 'the original language';
      const targetLabel = targetLang === 'en-IN' ? 'English' : targetLang === 'hi-IN' ? 'Hindi' : 'Telugu';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Translate the following text from ${sourceLabel} to ${targetLabel}. Return ONLY the translation, nothing else.\n\nText: ${text}`
              }]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translation = data.candidates?.[0]?.content?.parts?.[0]?.text || text;
        return NextResponse.json({ translation, sourceLang, targetLang, mode: 'ai' });
      }
    } catch (aiError) {
      // Fall through to demo mode
    }

    return NextResponse.json({
      translation: `[Translation unavailable] ${text}`,
      sourceLang,
      targetLang,
      mode: 'fallback',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
