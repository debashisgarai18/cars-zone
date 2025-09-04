import arcjet, { tokenBucket } from "@arcjet/next";

// rate limiting for 10 req per hour
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, 
      interval: 3600, 
      capacity: 10, 
    }),
  ],
});

export default aj;