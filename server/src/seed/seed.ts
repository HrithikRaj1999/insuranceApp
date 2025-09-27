import mongoose from "mongoose";
import dotenv from "dotenv";
import policyModel from "../models/policy.model";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/insurance-claims";
console.log({
  MONGODB_URI,
});
async function seedPolicies() {
  try {
    const { faker } = await import("@faker-js/faker");
    await mongoose.connect(MONGODB_URI!);
    await policyModel.deleteMany({});
    const docs = Array.from({
      length: 50,
    }).map(() => {
      const type = faker.helpers.arrayElement(["Auto", "Health", "Life", "Travel"]);
      const startDate = faker.date.between({
        from: "2023-01-01",
        to: "2025-01-01",
      });
      const endDate = faker.date.future({
        years: type === "Life" ? 20 : 1,
        refDate: startDate,
      });
      return {
        policyNumber: `${type.substring(0, 4).toUpperCase()}-${faker.number.int({
          min: 100000,
          max: 999999,
        })}`,
        holderName: faker.person.fullName(),
        type,
        premiumAmount: faker.number.int({
          min: 8080,
          max: 50000,
        }),
        startDate,
        endDate,
        status: faker.helpers.arrayElement(["active", "expired", "pending"]),
        coverageDetails: faker.lorem.sentence({
          min: 8,
          max: 15,
        }),
      };
    });
    await policyModel.insertMany(docs, {
      ordered: false,
    });
    process.stdout.write("success");
    process.exit(0);
  } catch {
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}
seedPolicies();
