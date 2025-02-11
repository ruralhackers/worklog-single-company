
export const calculateDuration = (clockIn: string, clockOut: string | null): string => {
  if (!clockOut) return "En curso";
  
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  
  if (end <= start) return "Error en fechas";
  
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return `${hours.toFixed(2)} horas`;
};
