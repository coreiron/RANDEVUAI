
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Repeat, X } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

interface RecurringAppointmentProps {
  onSave: (recurringData: any) => void;
  onCancel: () => void;
}

const RecurringAppointment: React.FC<RecurringAppointmentProps> = ({ onSave, onCancel }) => {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState<Date>();
  const [maxOccurrences, setMaxOccurrences] = useState<number>();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [useEndDate, setUseEndDate] = useState(true);

  const daysOfWeek = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 0, label: 'Pazar' }
  ];

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const generatePreview = () => {
    if (!endDate && !maxOccurrences) return [];

    const preview = [];
    const startDate = new Date();
    let currentDate = new Date(startDate);
    let count = 0;
    const maxPreview = 5;
    const maxCount = maxOccurrences || 10;

    while (count < maxPreview && count < maxCount) {
      if (frequency === 'weekly' && selectedDays.length > 0) {
        const dayOfWeek = currentDate.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          preview.push(new Date(currentDate));
          count++;
        }
        currentDate = addDays(currentDate, 1);
      } else {
        preview.push(new Date(currentDate));
        count++;
        
        switch (frequency) {
          case 'daily':
            currentDate = addDays(currentDate, interval);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, interval);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, interval);
            break;
        }
      }

      if (endDate && currentDate > endDate) break;
    }

    return preview;
  };

  const handleSave = () => {
    const recurringData = {
      frequency,
      interval,
      endDate: useEndDate ? endDate : null,
      maxOccurrences: !useEndDate ? maxOccurrences : null,
      selectedDays: frequency === 'weekly' ? selectedDays : [],
      preview: generatePreview()
    };
    
    onSave(recurringData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Tekrarlayan Randevu
          <Button variant="ghost" size="sm" onClick={onCancel} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sıklık Seçimi */}
        <div>
          <Label>Tekrarlama Sıklığı</Label>
          <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aralık */}
        <div>
          <Label>Her {interval} {frequency === 'daily' ? 'gün' : frequency === 'weekly' ? 'hafta' : 'ay'}</Label>
          <Input
            type="number"
            min="1"
            max="12"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Haftalık için gün seçimi */}
        {frequency === 'weekly' && (
          <div>
            <Label>Tekrarlama Günleri</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bitiş Seçeneği */}
        <div>
          <Label>Bitiş Seçeneği</Label>
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-end-date"
                checked={useEndDate}
                onCheckedChange={(checked) => setUseEndDate(!!checked)}
              />
              <Label htmlFor="use-end-date">Bitiş tarihi belirle</Label>
            </div>
            
            {useEndDate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd MMMM yyyy', { locale: tr }) : 'Bitiş tarihi seçin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-max-occurrences"
                checked={!useEndDate}
                onCheckedChange={(checked) => setUseEndDate(!checked)}
              />
              <Label htmlFor="use-max-occurrences">Maksimum randevu sayısı</Label>
            </div>
            
            {!useEndDate && (
              <Input
                type="number"
                min="1"
                max="52"
                placeholder="Maksimum randevu sayısı"
                value={maxOccurrences || ''}
                onChange={(e) => setMaxOccurrences(parseInt(e.target.value) || undefined)}
              />
            )}
          </div>
        </div>

        {/* Önizleme */}
        <div>
          <Label>Önizleme (İlk 5 randevu)</Label>
          <div className="mt-2 space-y-1">
            {generatePreview().map((date, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                {format(date, 'dd MMMM yyyy, EEEE', { locale: tr })}
              </div>
            ))}
          </div>
        </div>

        {/* Kaydet/İptal */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Tekrarlayan Randevu Oluştur
          </Button>
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringAppointment;
