import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, context, imageBase64, imageMimeType } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasImage = imageBase64 && imageMimeType;

    const getDemoResponse = (query, ctx) => {
      const q = (query + ' ' + (ctx || '')).toLowerCase();

      if (q.includes('chest') || q.includes('breath') || q.includes('bleeding') || q.includes('unconscious')) {
        return 'CRITICAL TRIAGE ALERT: Symptoms may indicate a medical emergency. Recommend immediate escalation and urgent transfer to the nearest Community Health Centre (CHC) or District Hospital via 108 Emergency Services. Do not delay for diagnostic testing.';
      }
      if (q.includes('pregnan') || q.includes('anc') || q.includes('fetal') || q.includes('గర్భం') || q.includes('गर्भावस्था')) {
        return 'Maternal Care Protocol: Ensure regular Antenatal Care (ANC) monitoring. Track blood pressure and urine protein to screen for preeclampsia. If maternal danger signs appear (severe headache, visual disturbances, epigastric pain, or decreased fetal movements), immediately arrange hospital review.';
      }
      if (q.includes('sugar') || q.includes('diabet') || q.includes('glucose')) {
        return 'Diabetes Management Guidance: Maintain glycemic log. If fasting blood sugar exceeds 140 mg/dL or postprandial exceeds 180 mg/dL, schedule PHC Medical Officer evaluation for dosage adjustment. Avoid dietary refined carbohydrates.';
      }
      if (q.includes('fever') || q.includes('temperature') || q.includes('జ్వరం') || q.includes('बुखार')) {
        return 'Fever Protocol Guidance: Monitor oral/axillary temperature every 4 hours. Maintain oral hydration with boiled water or ORS. If high fever persists beyond 48 hours or is accompanied by rigors, rash, or altered sensorium, refer for malaria and dengue screening.';
      }
      if (q.includes('vaccin') || q.includes('immun') || q.includes('టీకా')) {
        return 'National Immunization Schedule Guidance: Follow age-appropriate universal immunization guidelines. Ensure pentavalent, rotavirus, and measles-rubella vaccines are up to date. Document batch numbers in the mother-child tracking register.';
      }

      return 'General Community Healthcare Guidance: Document patient symptoms, measure current vital signs (BP, Pulse, Temperature, SpO2), and generate a Health Ticket for PHC Medical Officer review. Maintain oral hydration and rest.';
    };

    if (!apiKey || apiKey === 'demo') {
      // Demo mode — return canned response; never fabricate image analysis
      const demoResponse = hasImage
        ? 'Image noted in demo mode. Configure GEMINI_API_KEY for real image-assisted triage. ' + getDemoResponse(prompt, context)
        : getDemoResponse(prompt, context);

      return NextResponse.json({
        response: demoResponse,
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
- Provide general health education based on trusted public health guidelines.
- When an image is provided, describe only visible observations (e.g., redness, swelling, rash location). Do NOT attempt to diagnose. Provide structured observation and triage urgency only.`;

      // Build content parts — text first, then optional image
      const parts = [
        { text: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt }
      ];

      if (hasImage) {
        parts.push({
          inline_data: {
            mime_type: imageMimeType,
            data: imageBase64,
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts }],
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
          imageAnalyzed: hasImage,
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
