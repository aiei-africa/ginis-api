export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  // TODO: wire to SMS provider (Hubtel or Arkesel) once selected.
  console.log(`[OTP STUB] Would send code ${code} to ${phone}`);
}
