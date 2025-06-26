import { supabase } from '../lib/supabase';
import { Settings, Holiday, Shift } from '../types/Settings';

export const getSettings = async (): Promise<Settings> => {
  try {
    const defaultSettings: Settings = {
      weekends: [0, 6],
      holidays: [],
      shifts: {
        morning: { start: '09:00', end: '17:00' },
        night: { start: '21:00', end: '05:00' },
      },
    };

    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) throw error;

    const settings: Settings = { ...defaultSettings };

    data.forEach((setting) => {
      const key = setting.key as keyof Settings;
      const value = setting.value;

      if (key === 'weekends') {
        settings.weekends = value;
      } else if (key === 'holidays') {
        settings.holidays = value;
      } else if (key === 'shifts') {
        settings.shifts = value;
      }
    });

    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      weekends: [0, 6],
      holidays: [],
      shifts: {
        morning: { start: '09:00', end: '17:00' },
        night: { start: '21:00', end: '05:00' },
      },
    };
  }
};

export const updateSettings = async (settings: Settings): Promise<boolean> => {
  try {
    const updates = [
      { key: 'weekends', value: settings.weekends },
      { key: 'holidays', value: settings.holidays },
      { key: 'shifts', value: settings.shifts },
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('settings')
        .upsert(update, { onConflict: 'key' });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

export const addHoliday = async (holiday: Holiday): Promise<boolean> => {
  try {
    const settings = await getSettings();
    
    const existingHoliday = settings.holidays.find((h) => h.date === holiday.date);
    if (existingHoliday) {
      return false;
    }

    settings.holidays.push(holiday);
    return await updateSettings(settings);
  } catch (error) {
    console.error('Error adding holiday:', error);
    return false;
  }
};

export const deleteHoliday = async (date: string): Promise<boolean> => {
  try {
    const settings = await getSettings();
    settings.holidays = settings.holidays.filter((h) => h.date !== date);
    return await updateSettings(settings);
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return false;
  }
};

export const updateShifts = async (shifts: Record<string, Shift>): Promise<boolean> => {
  try {
    const settings = await getSettings();
    settings.shifts = shifts;
    return await updateSettings(settings);
  } catch (error) {
    console.error('Error updating shifts:', error);
    return false;
  }
};

export const updateWeekends = async (weekends: number[]): Promise<boolean> => {
  try {
    const settings = await getSettings();
    settings.weekends = weekends;
    return await updateSettings(settings);
  } catch (error) {
    console.error('Error updating weekends:', error);
    return false;
  }
};