type StkInput = { phoneNumber: string; amount: number; accountReference: string; description: string };
type StkResult = { checkoutRequestId: string; merchantRequestId: string; responseDescription: string };

const apiBase = process.env.MPESA_ENVIRONMENT === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
const timestamp = () => { const date = new Date(); const parts = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0"), String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0"), String(date.getSeconds()).padStart(2, "0")]; return parts.join(""); };

export async function requestMpesaStkPush(input: StkInput): Promise<StkResult> {
  const credentials = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const tokenResponse = await fetch(`${apiBase}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${credentials}` }, cache: "no-store" });
  if (!tokenResponse.ok) throw new Error("MPESA_AUTH_FAILED");
  const { access_token: token } = await tokenResponse.json() as { access_token: string };
  const time = timestamp(); const shortcode = process.env.MPESA_SHORTCODE || ""; const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${time}`).toString("base64");
  const response = await fetch(`${apiBase}/mpesa/stkpush/v1/processrequest`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: time, TransactionType: "CustomerPayBillOnline", Amount: Math.round(input.amount), PartyA: input.phoneNumber, PartyB: shortcode, PhoneNumber: input.phoneNumber, CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`, AccountReference: input.accountReference, TransactionDesc: input.description }) });
  if (!response.ok) throw new Error("MPESA_REQUEST_FAILED");
  const data = await response.json(); return { checkoutRequestId: data.CheckoutRequestID, merchantRequestId: data.MerchantRequestID, responseDescription: data.ResponseDescription };
}
