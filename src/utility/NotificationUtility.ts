// Email

// notification

// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 9000000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "ACb9716ad8f287d0a22e34c4f95b643891";
  const authToken = "c106d9ad3b36538d2e3fbe957a3262ae";
  const client = require("twilio")(accountSid, authToken);
  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+12543298955",
    to: `+91${toPhoneNumber}`,
  });

  return response;
};

// PAyment notification or Email
