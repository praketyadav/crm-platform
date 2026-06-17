// Author: Vineet | Module: Follow-Up Components | CRM Platform v1.0
import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../services/api.js';

const locales = { 'en-US': await import('date-fns/locale/en-US').then(m => m.default || m) };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function FollowUpCalendar({ onSelectEvent }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/followups/calendar').then(res => {
      setEvents((res.data.data || []).map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })));
    }).catch(() => {});
  }, []);

  const eventStyleGetter = (event) => {
    const colors = { PENDING: '#6C63FF', DONE: '#22C55E', MISSED: '#EF4444' };
    return { style: { backgroundColor: colors[event.status] || '#6C63FF', border: 'none', borderRadius: '4px', fontSize: '12px' } };
  };

  return (
    <div className="h-[500px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
}
