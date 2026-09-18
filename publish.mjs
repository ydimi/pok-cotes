#!/usr/bin/env node
// Copie le site rendu depuis l'atelier vers ce dépôt public.
//
//   node publish.mjs
//
// ÉTANCHÉITÉ — NON NÉGOCIABLE. L'atelier (../pok) contient les relevés de prix, les cotes,
// la méthode et les scripts. Ce dépôt est public et ne doit recevoir que des pages rendues.
// Trois couches indépendantes, chacune suffisante à elle seule :
//
//   1. on ne lit QUE ../pok/site, et uniquement les extensions .html, .jpg, .png, .webp ;
//   2. tout nom de fichier suspect interrompt la publication par un exit 1 ;
//   3. le .gitignore de ce dépôt interdit par défaut *.json, *.md, *.mjs, data/, scripts/…
//
// Ne jamais remplacer l'énumération par une copie de dossier en aveugle.

import { readdir, readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const ATELIER = join(ICI, '..', 'pok');
const SOURCE = join(ATELIER, 'site');

const EXTENSIONS = ['.html', '.jpg', '.jpeg', '.png', '.webp', '.svg'];
const SOUS_DOSSIERS = ['', 'c', 'img'];   // aucune récursion aveugle

// Deny-list : tout ce qui, par son nom, trahit une donnée d'atelier.
const INTERDIT = /(prix|cote|vente|deal|manuel|reference|script|snapshot|\.env|secret|token|methode|strategie)/i;

function verifier(nom) {
  if (INTERDIT.test(nom)) {
    console.error(`ABANDON : nom de fichier suspect refusé à la publication : ${nom}`);
    console.error('          Ce dépôt est public. Vérifier ce que produit l’atelier avant de recommencer.');
    process.exit(1);
  }
}

let existe = false;
try { existe = (await stat(SOURCE)).isDirectory(); } catch { /* absent */ }
if (!existe) {
  console.error(`ABANDON : ${relative(ICI, SOURCE)} introuvable.`);
  console.error('          Générer d’abord le site dans l’atelier :');
  console.error('            node scripts/fetch-collection.mjs <setId>');
  console.error('            node scripts/gen-collection.mjs <setId>');
  console.error('            node scripts/gen-index.mjs');
  process.exit(1);
}

// --- Recensement -------------------------------------------------------------------

const aCopier = [];
for (const sd of SOUS_DOSSIERS) {
  const dossier = join(SOURCE, sd);
  let entrees = [];
  try { entrees = await readdir(dossier, { withFileTypes: true }); } catch { continue; }
  for (const e of entrees) {
    if (!e.isFile()) continue;
    const ext = e.name.slice(e.name.lastIndexOf('.')).toLowerCase();
    if (!EXTENSIONS.includes(ext)) continue;
    verifier(e.name);
    aCopier.push(sd ? `${sd}/${e.name}` : e.name);
  }
}

if (!aCopier.some((f) => f === 'index.html')) {
  console.error('ABANDON : site/index.html manquant — lancer node scripts/gen-index.mjs dans l’atelier.');
  process.exit(1);
}

// --- Copie -------------------------------------------------------------------------

// On repart d'un état propre pour que la suppression d'une collection dans l'atelier se
// répercute ici, au lieu de laisser une page orpheline en ligne indéfiniment.
for (const sd of ['c', 'img']) await rm(join(ICI, sd), { recursive: true, force: true });

let octets = 0;
for (const chemin of aCopier) {
  const src = join(SOURCE, ...chemin.split('/'));
  const dst = join(ICI, ...chemin.split('/'));
  await mkdir(dirname(dst), { recursive: true });
  const contenu = await readFile(src);
  await writeFile(dst, contenu);
  octets += contenu.length;
  console.log(`copié   : ${chemin} (${(contenu.length / 1024).toFixed(1)} Ko)`);
}

console.log(`\nOK -> ${aCopier.length} fichier(s), ${(octets / 1024 / 1024).toFixed(2)} Mo.`);
console.log('Prochaine étape : vérifier git status, puis add + commit + push (ou la commande /publie).');
