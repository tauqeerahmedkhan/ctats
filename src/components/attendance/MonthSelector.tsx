import React from 'react';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i);
  
  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear = selectedYear - 1;
    }
    
    onMonthChange(newMonth, newYear);
  };
  
  const goToNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear = selectedYear + 1;
    }
    
    onMonthChange(newMonth, newYear);
  };
  
  const goToToday = () => {
    const today = new Date();
    onMonthChange(today.getMonth() + 1, today.getFullYear());
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            icon={<ChevronLeft size={16} />}
            aria-label="Previous month"
          />
          
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value), selectedYear)}
              className="bg-white border border-gray-300 rounded-md py-1 pl-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => onMonthChange(selectedMonth, parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded-md py-1 pl-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            icon={<ChevronRight size={16} />}
            aria-label="Next month"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
        >
          Today
        </Button>
      </div>
    </div>
  );
};