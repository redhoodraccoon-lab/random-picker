#!/bin/bash
rm -rf .next node_modules
chmod -R 755 .
npm install
npx prisma migrate dev --name init
npm run build
