// Lädt und validiert alle Daten aus /data. Wird vom Build, vom Validator
// und von den Tests genutzt, damit überall dieselben Regeln gelten.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { z } from 'zod';
import {
  BrandSchema,
  DuelSchema,
  EvidenceFileSchema,
  ProductSchema,
  SourceSchema,
  SubstanceSchema,
  crossCheck,
  type Dataset,
} from './schema.ts';

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function parseFile<S extends z.ZodType>(schema: S, path: string, errors: string[]): z.infer<S>[] {
  if (!existsSync(path)) return [];
  const raw = readJson(path);
  const list = Array.isArray(raw) ? raw : [raw];
  const out: z.infer<S>[] = [];
  list.forEach((item, i) => {
    const r = schema.safeParse(item);
    if (r.success) out.push(r.data);
    else
      for (const issue of r.error.issues)
        errors.push(`${path}${list.length > 1 ? `[${i}]` : ''} ${issue.path.join('.')}: ${issue.message}`);
  });
  return out;
}

function parseDir<S extends z.ZodType>(schema: S, dir: string, errors: string[]): z.infer<S>[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => parseFile(schema, join(dir, f), errors));
}

export function loadDataset(root = join(process.cwd(), 'data')): { data: Dataset; errors: string[] } {
  const errors: string[] = [];
  const data: Dataset = {
    sources: parseFile(SourceSchema, join(root, 'sources.json'), errors),
    substances: parseDir(SubstanceSchema, join(root, 'substances'), errors),
    brands: parseDir(BrandSchema, join(root, 'brands'), errors),
    products: parseDir(ProductSchema, join(root, 'products'), errors),
    evidence: parseDir(EvidenceFileSchema, join(root, 'evidence'), errors),
    duels: parseFile(DuelSchema, join(root, 'duels.json'), errors),
  };
  if (errors.length === 0) errors.push(...crossCheck(data));
  return { data, errors };
}

let cached: Dataset | null = null;

/** Für Astro-Seiten: bricht den Build bei ungültigen Daten ab. */
export function getDataset(): Dataset {
  if (cached) return cached;
  const { data, errors } = loadDataset();
  if (errors.length) throw new Error('Ungültige Daten:\n' + errors.join('\n'));
  cached = data;
  return data;
}
