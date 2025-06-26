export interface Shift {
  start: string;
  end: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface Settings {
  weekends: number[];
  holidays: Holiday[];
  shifts: {
    morning: Shift;
    night: Shift;
    [key: string]: Shift;
  };
}