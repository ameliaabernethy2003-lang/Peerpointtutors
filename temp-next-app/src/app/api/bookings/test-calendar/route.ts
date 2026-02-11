import { NextRequest, NextResponse } from 'next/server';
import { getCalendarClient } from '../../../utils/googleCalendar';

// Test endpoint to check calendar access
export async function GET(request: NextRequest) {
  try {
    const calendar = getCalendarClient();
    
    if (!calendar) {
      return NextResponse.json({
        success: false,
        message: 'Google Calendar API not configured. Check environment variables.',
        configured: false,
      }, { status: 200 });
    }

    // Try to list calendars
    try {
      const response = await calendar.calendarList.list();
      const calendars = response.data.items || [];
      
      return NextResponse.json({
        success: true,
        configured: true,
        calendarCount: calendars.length,
        calendars: calendars.map((cal: any) => ({
          id: cal.id,
          summary: cal.summary,
          accessRole: cal.accessRole,
          primary: cal.primary,
        })),
      }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        configured: true,
        error: error.message,
        code: error.code,
        details: error.response?.data,
      }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
