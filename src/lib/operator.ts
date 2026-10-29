// Betreiberangaben (Impressum). Nichts davon darf erfunden werden:
// fehlende Angaben bleiben null und blockieren die Freigabe.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Operator {
  name: string | null;
  legalForm: string | null;
  street: string | null;
  postalCodeCity: string | null;
  email: string | null;
  phone: string | null;
  representedBy: string | null;
  register: string | null;
  vatId: string | null;
  responsibleForContent: string | null;
  privacyReviewedBy: string | null;
}

/** Pflichtfelder für ein Impressum (Telefon, Register und USt-ID nur, wenn vorhanden). */
export const REQUIRED: (keyof Operator)[] = ['name', 'street', 'postalCodeCity', 'email', 'responsibleForContent'];

export function loadOperator(root = join(process.cwd(), 'data')): Operator {
  const raw = JSON.parse(readFileSync(join(root, 'operator.json'), 'utf8'));
  const out = {} as Operator;
  for (const k of ['name', 'legalForm', 'street', 'postalCodeCity', 'email', 'phone', 'representedBy', 'register', 'vatId', 'responsibleForContent', 'privacyReviewedBy'] as (keyof Operator)[]) {
    const v = raw[k];
    out[k] = typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
  }
  return out;
}

export function missingOperatorFields(op: Operator): string[] {
  const miss: string[] = REQUIRED.filter((k) => !op[k]);
  if (op.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(op.email)) miss.push('email (ungültig)');
  return miss;
}
