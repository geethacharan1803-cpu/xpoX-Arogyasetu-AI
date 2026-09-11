import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const ticketId = params.id;
    const ticket = await queryOne(
      'SELECT * FROM health_tickets WHERE ticket_number = ? OR id = ?',
      [ticketId, ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      ticket: {
        id: ticket.ticket_number || ticket.id,
        patientId: ticket.patient_id,
        patientName: ticket.patient_name,
        concern: ticket.concern,
        symptoms: ticket.symptoms,
        priority: ticket.priority,
        status: ticket.status,
        createdDate: ticket.created_at ? ticket.created_at.split('T')[0].split(' ')[0] : 'Today',
        createdBy: ticket.created_by,
        vitals: ticket.vitals_json ? JSON.parse(ticket.vitals_json) : null,
        timeline: ticket.timeline_json ? JSON.parse(ticket.timeline_json) : [],
        transcript: ticket.transcript,
        translatedTranscript: ticket.translated_transcript,
        detectedLanguage: ticket.detected_language,
      }
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to retrieve ticket' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const { status, stepName, stepNote, doctorName, updatedBy } = body;

    const ticket = await queryOne(
      'SELECT * FROM health_tickets WHERE ticket_number = ? OR id = ?',
      [ticketId, ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let timeline = ticket.timeline_json ? JSON.parse(ticket.timeline_json) : [];

    if (stepName) {
      timeline = timeline.map(step => {
        if (step.step === stepName) {
          return {
            ...step,
            completed: true,
            date: todayStr,
            note: stepNote || step.note,
          };
        }
        return step;
      });
    }

    await query(
      `UPDATE health_tickets SET
        status = COALESCE(?, status),
        timeline_json = ?,
        updated_at = ?
       WHERE ticket_number = ? OR id = ?`,
      [status || ticket.status, JSON.stringify(timeline), todayStr, ticketId, ticketId]
    );

    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [updatedBy || doctorName || 'Staff', 'staff', 'UPDATE_HEALTH_TICKET', 'health_tickets', ticketId, `Updated status to ${status || ticket.status}`]
    );

    return NextResponse.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
