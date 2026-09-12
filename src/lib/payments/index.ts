export type PaymentProvider = "MPESA" | "CARD";
export type PaymentRequest = { phoneNumber?: string; amount: number; accountReference: string; description: string };
export interface PaymentGateway { initiate(request: PaymentRequest): Promise<{ providerReference: string; message: string }> }
export { requestMpesaStkPush } from "./mpesa";
