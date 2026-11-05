/**
 * Profilo studio persistito in `center`.
 */
import type { CenterProfile } from "../models/Center";
import { DataEngine } from "./DataEngine";

export type CenterIpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

function toProfile(model: {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  ownerName: string;
}): CenterProfile {
  return {
    name: model.name,
    slogan: model.slogan,
    address: model.address,
    phone: model.phone,
    email: model.email,
    logoUrl: model.logoUrl,
    ownerName: model.ownerName
  };
}

export class CenterService {
  private static instance: CenterService | null = null;

  static getInstance(): CenterService {
    if (!CenterService.instance) {
      CenterService.instance = new CenterService();
    }
    return CenterService.instance;
  }

  get(): CenterIpcResult<CenterProfile> {
    try {
      const model = DataEngine.getInstance().settings.ensureCenter();
      return { ok: true, data: toProfile(model) };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(patch: Partial<CenterProfile>): CenterIpcResult<CenterProfile> {
    try {
      const model = DataEngine.getInstance().settings.saveCenter(patch);
      return { ok: true, data: toProfile(model) };
    } catch (error) {
      return wrapError(error);
    }
  }
}

function wrapError(error: unknown): CenterIpcResult<never> {
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}
