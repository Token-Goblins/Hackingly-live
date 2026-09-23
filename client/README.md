# 🖥️ fintrust.ai — Frontend Client Application

Modern, high-performance institutional web interface built with **React 19**, **TypeScript**, and **Vite 8** for the **fintrust.ai** Identity & Eligibility Trust Engine.

---

## 🌟 Client Capabilities

- **Participant Identity Portal**: Multi-document selector (Aadhaar, PAN, College ID, Voter ID, DL), live webcam capture with framing guide, and instant forensic trust score verification.
- **Institutional Compliance Dashboard**: Real-time KPIs (Total Registrations, Verified, Rejected, Review Queue, Sybil Fraud Blocked), interactive fraud radar, and 1-click human-in-the-loop review actions.
- **Tamper-Evident Event Pass**: Dynamically generated cryptographic ticket with attendee photograph, verification badges, HMAC security hash, and QR code for venue entrance check-in.
- **Interactive Test Vectors Drawer**: 8 preloaded test cases for rapid live demonstration (legitimate IDs, digitally altered DOB, Sybil cross-registration, biometric impersonation, nickname variations).
- **In-Browser Configuration Modals**: Live customization of event eligibility rules (age thresholds, accredited institutions) and cloud AI credentials (AWS Textract & Google Gemini Vision).

---

## 🚀 Running the Client

### From the Root Directory (Recommended):
```bash
# Run both backend server (port 5000) and frontend client (port 5173) concurrently:
npm run dev

# Or run client only:
npm run client
```

### Directly inside the `client` directory:
```bash
npm run dev      # Start Vite dev server on http://localhost:5173
npm run build    # Type-check with tsc and compile production bundle
npm run lint     # Lint source code using Oxlint
npm run preview  # Preview production build locally
```

---

## 📁 Component Architecture

- [`src/components/ParticipantPortal.tsx`](./src/components/ParticipantPortal.tsx): Registration form, webcam photo capture, and live verification analysis visualizer.
- [`src/components/AdminDashboard.tsx`](./src/components/AdminDashboard.tsx): Organizer metrics, filterable applicant database, human review actions, and venue desk check-in scanner.
- [`src/components/ParticipantTicket.tsx`](./src/components/ParticipantTicket.tsx): Downloadable/printable digital ticket with HMAC signature and QR code.
- [`src/components/TestCasesDrawer.tsx`](./src/components/TestCasesDrawer.tsx): Quick-loader drawer for the 8 hackathon test scenarios.
- [`src/components/RulesModal.tsx`](./src/components/RulesModal.tsx): Event eligibility rules manager.
- [`src/components/AiConfigModal.tsx`](./src/components/AiConfigModal.tsx): Cloud AI provider settings (AWS Textract & Gemini Vision).
- [`src/components/Sidebar.tsx`](./src/components/Sidebar.tsx): FinTrust.ai navigation bar with live review queue counter.
