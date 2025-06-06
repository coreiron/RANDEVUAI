
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentCalendarProps {
  availableTimeSlots: Record<string, string[]>;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  className?: string;
}

export const AppointmentCalendar = ({
  availableTimeSlots,
  onDateSelect,
  onTimeSelect,
  selectedDate,
  selectedTime,
  className
}: AppointmentCalendarProps) => {
  const [nextAvailableDates, setNextAvailableDates] = useState<Date[]>([]);
  
  // Find the next few dates that have available time slots
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    
    // Look ahead 60 days max
    for (let i = 0; i < 60 && dates.length < 5; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (availableTimeSlots[dateStr] && availableTimeSlots[dateStr].length > 0) {
        dates.push(date);
      }
    }
    
    setNextAvailableDates(dates);
  }, [availableTimeSlots]);

  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableTimeSlots[dateStr] || [];
  };

  const availableTimesForSelectedDate = getAvailableTimesForDate(selectedDate);

  const getHighlightedDates = () => {
    const dates: Date[] = [];
    
    // Add all dates with available slots
    Object.keys(availableTimeSlots).forEach(dateStr => {
      if (availableTimeSlots[dateStr] && availableTimeSlots[dateStr].length > 0) {
        const [year, month, day] = dateStr.split('-').map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    });
    
    return dates;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-5", className)}>
      <h3 className="font-bold text-lg mb-5 text-appointme-primary flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Randevu Tarihi ve Saati Seçin
      </h3>
      
      {nextAvailableDates.length > 0 && (
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-2">En yakın müsait tarihler:</p>
          <div className="flex flex-wrap gap-2">
            {nextAvailableDates.map((date, index) => (
              <Button 
                key={index}
                variant="outline"
                className={cn(
                  "flex flex-col h-auto py-2",
                  selectedDate && isSameDay(selectedDate, date) ? "border-appointme-primary bg-appointme-primary/10" : ""
                )}
                onClick={() => onDateSelect(date)}
              >
                <span className="text-xs uppercase">
                  {format(date, 'EEE', { locale: tr })}
                </span>
                <span className={cn(
                  "text-sm font-bold", 
                  isToday(date) ? "text-appointme-primary" : ""
                )}>
                  {format(date, 'd', { locale: tr })}
                </span>
                <span className="text-xs">
                  {format(date, 'MMM', { locale: tr })}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            modifiers={{
              highlighted: getHighlightedDates(),
            }}
            modifiersStyles={{
              highlighted: { fontWeight: 'bold', backgroundColor: 'rgba(0, 128, 128, 0.1)' },
            }}
            disabled={(date) => {
              // Disable dates with no available slots
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasSlots = availableTimeSlots[dateStr] && availableTimeSlots[dateStr].length > 0;
              
              // Also disable dates before today and more than 60 days in the future
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const futureLimit = addDays(today, 60);
              return !hasSlots || date < today || date > futureLimit;
            }}
            className="border rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">
            {selectedDate 
              ? `${format(selectedDate, 'PPP', { locale: tr })} Tarihindeki Müsait Saatler` 
              : "Lütfen bir tarih seçin"}
          </h4>
          
          {selectedDate ? (
            availableTimesForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
                {availableTimesForSelectedDate.map((time) => (
                  <Button 
                    key={time} 
                    variant="outline" 
                    className={cn(
                      "flex items-center justify-center",
                      selectedTime === time ? 
                        "bg-appointme-primary text-white hover:bg-appointme-primary hover:text-white" : 
                        ""
                    )}
                    onClick={() => onTimeSelect(time)}
                  >
                    {selectedTime === time ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full justify-center items-center text-center p-8 text-gray-500 border rounded-md border-dashed">
                <Clock className="h-12 w-12 mb-2 text-gray-300" />
                <p>Bu tarih için uygun randevu saati bulunmamaktadır.</p>
                <p className="text-sm mt-2">Lütfen başka bir tarih seçin.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col h-full justify-center items-center text-center p-8 text-gray-500 border rounded-md border-dashed">
              <Calendar className="h-12 w-12 mb-2 text-gray-300" />
              <p>Uygun saatleri görmek için önce bir tarih seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
