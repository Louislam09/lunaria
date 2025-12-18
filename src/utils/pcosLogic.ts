export interface PCOSInfo {
  hasPCOS: boolean;
  symptoms: string[];
  cycleLength: number;
  treatment: string[];
}

export function getPCOSMessage(info: PCOSInfo): string {
  if (!info.hasPCOS) return '';
  
  if (info.cycleLength > 35) {
    return 'Los ciclos largos pueden ser comunes con SOP. Considera hablar con un profesional de la salud.';
  }
  
  if (info.symptoms.length >= 3) {
    return 'Tienes varios síntomas relacionados con SOP. Es importante llevar un seguimiento regular.';
  }
  
  return 'Recuerda que con SOP, las predicciones pueden ser menos precisas.';
}

export function shouldShowPCOSAlert(info: PCOSInfo): boolean {
  return info.hasPCOS && (info.cycleLength > 35 || info.symptoms.length >= 3);
}

