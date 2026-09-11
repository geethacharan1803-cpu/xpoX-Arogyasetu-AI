import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const ticketId = searchParams.get('ticketId');

    let sql = 'SELECT * FROM voice_records WHERE 1=1';
    const params = [];

    if (patientId) {
      sql += ' AND patient_id = ?';
      params.push(patientId);
    }
    if (ticketId) {
      sql += ' AND health_ticket_id = ?';
      params.push(ticketId);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    return NextResponse.json({ voiceRecords: result.rows });
  } catch (error) {
    console.error('Error fetching voice records:', error);
    return NextResponse.json({ error: 'Failed to retrieve voice records' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      ticketId,
      audioReference,
      detectedLanguage,
      transcript,
      translatedText,
      aiSummary,
      urgency,
      createdBy,
    } = body;

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Voice transcript is required' }, { status: 400 });
    }

    const todayStr = new Date().toISOString();

    await query(
      `INSERT INTO voice_records (
        patient_id, health_ticket_id, audio_reference, detected_language, transcript,
        translated_text, ai_summary, urgency, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId || null,
        ticketId || null,
        audioReference || null,
        detectedLanguage || 'Vernacular',
        transcript.trim(),
        translatedText || null,
        aiSummary || null,
        urgency || 'routine',
        createdBy || 'ASHA Priya',
        todayStr
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Voice record safely preserved in database',
      record: {
        transcript: transcript.trim(),
        translatedText,
        detectedLanguage,
        urgency,
        timestamp: todayStr,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving voice record:', error);
    return NextResponse.json({ error: 'Failed to save voice record in database' }, { status: 500 });
  }
}
