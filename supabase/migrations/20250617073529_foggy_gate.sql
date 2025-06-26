/*
  # Create analytics functions for attendance system

  1. Functions
    - get_attendance_summary: Get monthly attendance summary with punctuality metrics
    - get_employee_analytics: Get detailed analytics for a specific employee
*/

-- Function to get attendance summary for a date range
CREATE OR REPLACE FUNCTION get_attendance_summary(start_date date, end_date date)
RETURNS TABLE (
  employee_id text,
  employee_name text,
  department text,
  shift text,
  present_days bigint,
  absent_days bigint,
  total_hours numeric,
  overtime_hours numeric,
  avg_hours_per_day numeric,
  on_time_days bigint,
  late_days bigint,
  avg_lateness_minutes numeric,
  early_departures bigint,
  punctuality_percentage numeric,
  hours_efficiency numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.department,
    e.shift,
    COUNT(CASE WHEN a.present = true THEN 1 END) as present_days,
    COUNT(CASE WHEN a.present = false THEN 1 END) as absent_days,
    COALESCE(SUM(a.hours), 0) as total_hours,
    COALESCE(SUM(a.overtime_hours), 0) as overtime_hours,
    CASE 
      WHEN COUNT(CASE WHEN a.present = true THEN 1 END) > 0 
      THEN COALESCE(SUM(a.hours), 0) / COUNT(CASE WHEN a.present = true THEN 1 END)
      ELSE 0 
    END as avg_hours_per_day,
    
    -- On time calculation
    COUNT(CASE 
      WHEN a.present = true AND a.time_in IS NOT NULL AND 
           ((e.shift = 'morning' AND a.time_in <= '09:00') OR
            (e.shift = 'night' AND a.time_in <= '21:00'))
      THEN 1 
    END) as on_time_days,
    
    -- Late days calculation
    COUNT(CASE 
      WHEN a.present = true AND a.time_in IS NOT NULL AND 
           ((e.shift = 'morning' AND a.time_in > '09:00') OR
            (e.shift = 'night' AND a.time_in > '21:00'))
      THEN 1 
    END) as late_days,
    
    -- Average lateness in minutes
    COALESCE(AVG(CASE 
      WHEN a.present = true AND a.time_in IS NOT NULL AND 
           ((e.shift = 'morning' AND a.time_in > '09:00') OR
            (e.shift = 'night' AND a.time_in > '21:00'))
      THEN 
        CASE 
          WHEN e.shift = 'morning' THEN 
            EXTRACT(EPOCH FROM (a.time_in::time - '09:00'::time)) / 60
          WHEN e.shift = 'night' THEN 
            EXTRACT(EPOCH FROM (a.time_in::time - '21:00'::time)) / 60
        END
    END), 0) as avg_lateness_minutes,
    
    -- Early departures
    COUNT(CASE 
      WHEN a.present = true AND a.time_out IS NOT NULL AND 
           ((e.shift = 'morning' AND a.time_out < '17:00') OR
            (e.shift = 'night' AND a.time_out < '05:00'))
      THEN 1 
    END) as early_departures,
    
    -- Punctuality percentage
    CASE 
      WHEN COUNT(CASE WHEN a.present = true AND a.time_in IS NOT NULL THEN 1 END) > 0
      THEN (COUNT(CASE 
        WHEN a.present = true AND a.time_in IS NOT NULL AND 
             ((e.shift = 'morning' AND a.time_in <= '09:00') OR
              (e.shift = 'night' AND a.time_in <= '21:00'))
        THEN 1 
      END)::numeric / COUNT(CASE WHEN a.present = true AND a.time_in IS NOT NULL THEN 1 END)::numeric) * 100
      ELSE 100 
    END as punctuality_percentage,
    
    -- Hours efficiency (actual vs expected)
    CASE 
      WHEN COUNT(CASE WHEN a.present = true THEN 1 END) > 0
      THEN (COALESCE(SUM(a.hours), 0) / (COUNT(CASE WHEN a.present = true THEN 1 END) * 8)) * 100
      ELSE 0 
    END as hours_efficiency
    
  FROM employees e
  LEFT JOIN attendance a ON e.id = a.employee_id AND a.date BETWEEN start_date AND end_date
  GROUP BY e.id, e.name, e.department, e.shift
  ORDER BY e.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed employee analytics
CREATE OR REPLACE FUNCTION get_employee_analytics(emp_id text, start_date date, end_date date)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  employee_data record;
  weekly_stats jsonb[];
  monthly_stats jsonb[];
  week_start date;
  week_end date;
  month_start date;
  month_end date;
  current_week date;
  current_month date;
BEGIN
  -- Get employee basic info
  SELECT e.id, e.name, e.department, e.shift
  INTO employee_data
  FROM employees e
  WHERE e.id = emp_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Employee not found"}'::jsonb;
  END IF;
  
  -- Get overall statistics
  WITH stats AS (
    SELECT 
      COUNT(*) as total_days,
      COUNT(CASE WHEN a.present = true THEN 1 END) as present_days,
      COUNT(CASE WHEN a.present = false THEN 1 END) as absent_days,
      COALESCE(SUM(a.hours), 0) as total_hours,
      COALESCE(SUM(a.overtime_hours), 0) as overtime_hours,
      CASE 
        WHEN COUNT(CASE WHEN a.present = true THEN 1 END) > 0 
        THEN COALESCE(SUM(a.hours), 0) / COUNT(CASE WHEN a.present = true THEN 1 END)
        ELSE 0 
      END as avg_hours_per_day,
      
      COUNT(CASE 
        WHEN a.present = true AND a.time_in IS NOT NULL AND 
             ((employee_data.shift = 'morning' AND a.time_in <= '09:00') OR
              (employee_data.shift = 'night' AND a.time_in <= '21:00'))
        THEN 1 
      END) as on_time_days,
      
      COUNT(CASE 
        WHEN a.present = true AND a.time_in IS NOT NULL AND 
             ((employee_data.shift = 'morning' AND a.time_in > '09:00') OR
              (employee_data.shift = 'night' AND a.time_in > '21:00'))
        THEN 1 
      END) as late_days,
      
      COALESCE(AVG(CASE 
        WHEN a.present = true AND a.time_in IS NOT NULL AND 
             ((employee_data.shift = 'morning' AND a.time_in > '09:00') OR
              (employee_data.shift = 'night' AND a.time_in > '21:00'))
        THEN 
          CASE 
            WHEN employee_data.shift = 'morning' THEN 
              EXTRACT(EPOCH FROM (a.time_in::time - '09:00'::time)) / 60
            WHEN employee_data.shift = 'night' THEN 
              EXTRACT(EPOCH FROM (a.time_in::time - '21:00'::time)) / 60
          END
      END), 0) as avg_lateness,
      
      COUNT(CASE 
        WHEN a.present = true AND a.time_out IS NOT NULL AND 
             ((employee_data.shift = 'morning' AND a.time_out < '17:00') OR
              (employee_data.shift = 'night' AND a.time_out < '05:00'))
        THEN 1 
      END) as early_departures
      
    FROM attendance a
    WHERE a.employee_id = emp_id AND a.date BETWEEN start_date AND end_date
  )
  SELECT jsonb_build_object(
    'employeeId', employee_data.id,
    'employeeName', employee_data.name,
    'department', employee_data.department,
    'totalDays', s.total_days,
    'presentDays', s.present_days,
    'absentDays', s.absent_days,
    'totalHours', s.total_hours,
    'overtimeHours', s.overtime_hours,
    'avgHoursPerDay', s.avg_hours_per_day,
    'punctualityScore', CASE 
      WHEN s.present_days > 0 THEN (s.on_time_days::numeric / s.present_days::numeric) * 100
      ELSE 100 
    END,
    'attendancePercentage', CASE 
      WHEN s.total_days > 0 THEN (s.present_days::numeric / s.total_days::numeric) * 100
      ELSE 0 
    END,
    'onTimeDays', s.on_time_days,
    'lateDays', s.late_days,
    'avgLateness', s.avg_lateness,
    'earlyDepartures', s.early_departures
  )
  INTO result
  FROM stats s;
  
  -- Get weekly statistics
  current_week := date_trunc('week', start_date);
  weekly_stats := ARRAY[]::jsonb[];
  
  WHILE current_week <= end_date LOOP
    week_start := current_week;
    week_end := LEAST(current_week + interval '6 days', end_date);
    
    WITH week_data AS (
      SELECT 
        COUNT(CASE WHEN a.present = true THEN 1 END) as present_days,
        COALESCE(SUM(a.hours), 0) as total_hours,
        COALESCE(SUM(a.overtime_hours), 0) as overtime_hours
      FROM attendance a
      WHERE a.employee_id = emp_id AND a.date BETWEEN week_start AND week_end
    )
    SELECT array_append(weekly_stats, jsonb_build_object(
      'week', to_char(week_start, 'YYYY-MM-DD'),
      'presentDays', w.present_days,
      'totalHours', w.total_hours,
      'overtimeHours', w.overtime_hours
    ))
    INTO weekly_stats
    FROM week_data w;
    
    current_week := current_week + interval '1 week';
  END LOOP;
  
  -- Get monthly statistics
  current_month := date_trunc('month', start_date);
  monthly_stats := ARRAY[]::jsonb[];
  
  WHILE current_month <= end_date LOOP
    month_start := current_month;
    month_end := LEAST(current_month + interval '1 month' - interval '1 day', end_date);
    
    WITH month_data AS (
      SELECT 
        COUNT(CASE WHEN a.present = true THEN 1 END) as present_days,
        COALESCE(SUM(a.hours), 0) as total_hours,
        COALESCE(SUM(a.overtime_hours), 0) as overtime_hours
      FROM attendance a
      WHERE a.employee_id = emp_id AND a.date BETWEEN month_start AND month_end
    )
    SELECT array_append(monthly_stats, jsonb_build_object(
      'month', to_char(month_start, 'YYYY-MM'),
      'presentDays', m.present_days,
      'totalHours', m.total_hours,
      'overtimeHours', m.overtime_hours
    ))
    INTO monthly_stats
    FROM month_data m;
    
    current_month := current_month + interval '1 month';
  END LOOP;
  
  -- Add weekly and monthly stats to result
  result := result || jsonb_build_object(
    'weeklyStats', to_jsonb(weekly_stats),
    'monthlyStats', to_jsonb(monthly_stats)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;