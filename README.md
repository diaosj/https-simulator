<p align="center">
  <h1 align="center">HTTPS Visual Simulator</h1>
</p>

<p align="center">
  <strong>A purely front-end, interactive cryptography teaching sandbox with a cyberpunk aesthetic — visually demonstrating the inner workings of HTTPS</strong>
</p>

<p align="center">
  <a href="./README.zh-CN.md">中文文档</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-10.16-FF0050?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/CryptoJS-4.2-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="CryptoJS" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="License MIT" />
</p>

---

## About

> **"If you can't explain it simply, you don't understand it well enough."** — Richard Feynman

**HTTPS Visual Simulator** is a **purely front-end, interactive animation sandbox** with a **cyberpunk / hacker-terminal** dark visual style. Its mission is to demystify the underlying cryptographic principles of HTTPS — the **CIA triad (Confidentiality, Integrity, Authentication)**, the **TLS handshake protocol**, and the **RSA/AES hybrid encryption scheme** — through **highly intuitive, frame-by-frame animated sequences**.

No backend required, no deployment needed — just open your browser and experience a visual showcase of **information security attack and defense**. Watch firsthand how a Man-in-the-Middle (MITM) launches attacks, and how modern cryptographic mechanisms defeat them one by one.

<p align="center">
  <!-- Place a project demo GIF / video screenshot here -->
  <img src="" alt="HTTPS Visual Simulator Demo" width="800" />
  <br/>
  <em>Place a demo GIF or screenshot here</em>
</p>

---

## Core Demo Scenarios

This project covers **4 in-depth cryptography teaching scenarios**, fully illustrating how HTTPS protects data:

### TLS Handshake (RSA Key Exchange for AES Session Key)

> The starting point of all secure communication — key negotiation.

Demonstrates the complete **7-step TLS handshake process**:

1. The **Server** presents its Public Key and Private Key.
2. The Public Key is transmitted over the network to the **Client**, passing through the MITM's interception node.
3. The **Client** generates a Session Key using the Public Key.
4. The Session Key is encapsulated in an encrypted box, locked with the Public Key.
5. The encrypted box travels to the **Server**. The MITM intercepts it and attempts to decrypt — **failure**. The hacker terminal flashes:
   ```
   > Intercepting payload...
   > Attempting to decrypt...
   > Error: Missing Server Private Key. Decryption FAILED.
   ```
6. The **Server** unlocks the box with its Private Key and retrieves the Session Key.
7. Both parties establish a **secure encrypted channel**; all subsequent communication uses AES symmetric encryption.

---

### Scenario 1: Confidentiality (Preventing Eavesdropping)

> **Plaintext vs. AES-GCM ciphertext — the MITM intercepts the data but cannot read it.**

| Mode | Transmitted Content | What the MITM Sees |
|:---:|:---:|:---:|
| HTTP | `"Transfer $100 to Alice"` | `"Transfer $100 to Alice"` — Fully readable |
| HTTPS | `U2FsdGVkX1...` (AES ciphertext) | `U2FsdGVkX1...` — Unreadable ciphertext |

In HTTP mode, the MITM reads your plaintext data as easily as reading a newspaper. After switching to HTTPS, even if the data packets are intercepted, the attacker sees nothing but **unreadable AES-encrypted ciphertext**. Confidentiality means the eavesdropper "can see it, but can't read it."

---

### Scenario 2: Integrity (Preventing Tampering)

> **A key highlight of this project — "Encryption does NOT equal tamper-proofing."**

Many people mistakenly assume that data is safe once it's encrypted. This scenario demonstrates a counterintuitive fact: **an attacker can corrupt your data without ever decrypting it**.

**Attack Demo: Bit-Flipping Attack**

1. The Client sends the AES-encrypted ciphertext along with a **SHA-256 hash digest**.
2. The MITM intercepts the ciphertext and **blindly flips some bits** — the ciphertext is now "corrupted."
3. The tampered ciphertext arrives at the Server, which decrypts it into garbled data.
4. The Server recomputes the hash and compares it against the original digest — **mismatch!**
5. The Server immediately **drops the packet** and raises a red alert:
   ```
   Integrity check failed! Data has been tampered with. Connection terminated.
   ```

This is the power of the **MAC (Message Authentication Code)** mechanism: ensuring that not a single bit can be altered.

---

### Scenario 3: Authentication (Preventing Impersonation)

> **The MITM presents a forged certificate and gets caught on the spot by the browser.**

| Mode | Server Identity | Verification Result |
|:---:|:---:|:---:|
| HTTP | No verification mechanism | Attacker impersonates the server; user is unaware |
| HTTPS | Digital certificate issued by a CA | Forged certificate is detected; connection is blocked |

In HTTP mode, the MITM can perfectly impersonate the target server, and all your data goes straight to the attacker. In HTTPS mode, the browser verifies the **CA-issued digital certificate** presented by the server — the MITM cannot forge a signature from a trusted CA, and the impostor is **immediately blocked** and the connection is terminated.

---

## Getting Started

Make sure [Node.js](https://nodejs.org/) (v16+) and npm are installed locally.

```bash
# 1. Clone the repository
git clone https://github.com/diaosj/https-simulator.git

# 2. Navigate to the project directory
cd https-simulator

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

After starting, open the local address shown in the terminal (default: `http://localhost:5173`) in your browser to enter the HTTPS Visual Simulator.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <sub>Explaining security through code, illuminating cryptography through animation.</sub>
  <br/>
  <sub>Built with care by <a href="https://github.com/diaosj">diaosj</a></sub>
</p>