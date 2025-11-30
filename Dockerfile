# Steg 1: Använd Node 20 Alpine (Lättviktig och stabil)
FROM node:20-alpine

# Fix för kompatibilitet
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Kopiera package.json (Vi ignorerar lock-filen för att tvinga ny installation av rätt versioner)
COPY package.json ./

# Installera dependencies
RUN npm install

# Kopiera källkoden
COPY . .

# Stäng av telemetri
ENV NEXT_TELEMETRY_DISABLED 1

# Bygg appen för produktion
RUN npm run build

EXPOSE 3000

# Starta i produktionsläge
CMD ["npm", "start"]