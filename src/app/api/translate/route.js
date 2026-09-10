import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no valid API key, return demo translation
    if (!apiKey || apiKey === 'demo') {
      return NextResponse.json({
        translation: `[Demo translation] ${text}`,
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
