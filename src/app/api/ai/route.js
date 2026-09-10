import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'demo') {
      return NextResponse.json({
        response: 'Insufficient verified information. Please consult a healthcare professional.',
        mode: 'demo',
        disclaimer: 'This AI assistant does not provide medical diagnoses or prescriptions. Always consult a qualified healthcare professional.',
      });
    }

    try {
      const systemPrompt = `You are a healthcare information assistant for ArogyaSetu AI, a rural healthcare platform in India.

CRITICAL RULES:
- You are NOT a doctor. Never diagnose or prescribe.
- Never add, remove, or change any medicine, dosage, frequency, or duration.
- If you lack reliable information, say: "Insufficient verified information. Please consult a healthcare professional."
- Always recommend consulting a healthcare professional for medical decisions.
- You may translate, explain, and simplify approved medical instructions.
- Provide general health education based on trusted public health guidelines.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{
              parts: [{ text: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt }]
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Insufficient verified information. Please consult a healthcare professional.';
        return NextResponse.json({
          response: aiResponse,
          mode: 'ai',
          disclaimer: 'This AI assistant does not provide medical diagnoses or prescriptions. Always consult a qualified healthcare professional.',
        });
      }
    } catch (aiError) {
      // Fall through
    }

    return NextResponse.json({
      response: 'Insufficient verified information. Please consult a healthcare professional.',
      mode: 'fallback',
      disclaimer: 'AI service temporarily unavailable.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
