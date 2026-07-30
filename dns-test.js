import dns from "node:dns/promises";

try {
  const records = await dns.resolveSrv("_mongodb._tcp.cluster0.ijcfe4z.mongodb.net");
  console.log(records);
} catch (err) {
  console.error(err);
}