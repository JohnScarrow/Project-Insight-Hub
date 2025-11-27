import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const events = [
    { date: "2024-01-25", title: "Client meeting", time: "10:00 AM" },
    { date: "2024-01-27", title: "Sprint review", time: "2:00 PM" },
    { date: "2024-01-30", title: "Project deadline", time: "EOD" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex justify-between items-start border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                <span className="text-sm text-muted-foreground">{event.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
