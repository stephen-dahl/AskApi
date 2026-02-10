import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { AwsHelper, EnvironmentBase } from "@churchapps/apihelper";

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Environment extends EnvironmentBase {
  static membershipApi: string;
  static messagingApi: string;
  static aiProvider: string;
  static openAiApiKey: string;
  static openRouterApiKey: string;

  static async init(environment: string) {
    let file = "dev.json";
    if (environment === "staging") file = "staging.json";
    if (environment === "prod") file = "prod.json";

    const relativePath = "../../config/" + file;
    const physicalPath = path.resolve(__dirname, relativePath);

    let data: Record<string, any> = {};
    try {
      const json = fs.readFileSync(physicalPath, "utf8");
      data = JSON.parse(json);
    } catch {
      console.log("Config file not found, using environment variables");
    }
    await this.populateBase(data, "askApi", environment);

    this.membershipApi = process.env.API_MEMBERSHIP || data.membershipApi;
    this.messagingApi = process.env.API_MESSAGING || data.messagingApi;
    this.aiProvider = process.env.AI_PROVIDER || data.aiProvider || "openrouter";
    this.openAiApiKey = process.env.OPENAI_API_KEY || (await AwsHelper.readParameter(`/${environment}/openAIKey`));
    this.openRouterApiKey =
      process.env.OPENROUTER_API_KEY || (await AwsHelper.readParameter(`/${environment}/openRouterApiKey`));
  }
}
