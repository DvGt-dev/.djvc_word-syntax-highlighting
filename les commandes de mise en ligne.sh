#!/bin/bash

# Installation des dépendances nécessaires
npm install -g yo generator-code
npm install --save-dev typescript
npm install --save-dev vscode
npm install --save-dev vscode-test

# Création des dossiers nécessaires
mkdir -p syntaxes themes

# Création du fichier de licence
echo "MIT License
Copyright (c) 2024 Djontso Victorien
[...]" > LICENSE

# Création du fichier .vscodeignore pour optimiser la taille
echo ".vscode/**
.vscode-test/**
node_modules/**
src/**
.gitignore
**/tsconfig.json
**/*.map
**/*.ts" > .vscodeignore

# Compilation et packaging
npm run compile
vsce package

# Configuration Git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DvGt-dev/djvc-syntax-highlighting.git
git push -u origin main

# Publication de l'extension
vsce login djvc-Extention-4txt-by-Djontso-Victorien
vsce publish

# mise a jour de l'extension
# Mettre à jour package.json
{
  "version": "0.0.2",  // Incrémenter la version
}
# Créer/Mettre à jour .vscodeignore
echo ".vscode/**
.vscode-test/**
node_modules/**
out/test/**
src/**
.gitignore
webpack.config.js
**/tsconfig.json
**/*.map
**/*.ts" > .vscodeignore
# Recompiler
npm run compile

# Créer le package
vsce package

# Publier la mise à jour
vsce publish