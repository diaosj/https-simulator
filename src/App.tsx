import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, FileCheck, CheckCircle, XCircle, AlertTriangle, Wifi, Monitor, Server, Send, Package, Key, BookOpen, Unlock, FileWarning, ShieldCheck, AlertOctagon, Globe } from 'lucide-react'
import CryptoJS from 'crypto-js'
import { translations, type Locale } from './i18n'

type Scenario = 'encryption' | 'integrity' | 'authentication'
type Mode = 'http' | 'https'
type HandshakeStatus = 'idle' | 'in_progress' | 'completed'
type MessageType = 'error' | 'neutral' | 'success' | ''

interface Packet {
  id: string
  content: string
  encrypted?: boolean
  hash?: string
  tampered?: boolean
  position: 'client' | 'center' | 'server'
}

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const t = translations[locale]
  const [scenario, setScenario] = useState<Scenario>('encryption')
  const [mode, setMode] = useState<Mode>('http')
  const [inputText, setInputText] = useState(() => translations['en'].encryptionPlaceholder)
  const [packet, setPacket] = useState<Packet | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [centerMessage, setCenterMessage] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [serverMessageType, setServerMessageType] = useState<MessageType>('')
  const [showCertError, setShowCertError] = useState(false)
  const [handshakeStatus, setHandshakeStatus] = useState<HandshakeStatus>('idle')
  const [handshakeStep, setHandshakeStep] = useState(0)
  const [hackerLog, setHackerLog] = useState<string[]>([])
  const hackerLogRef = useRef<string[]>([])
  const [integrityStep, setIntegrityStep] = useState(0)
  const [serverAlert, setServerAlert] = useState(false)
  const [authStep, setAuthStep] = useState(0)
  const [clientAlertFlash, setClientAlertFlash] = useState(false)

  const resetSimulation = useCallback(() => {
    setPacket(null)
    setIsAnimating(false)
    setCenterMessage('')
    setServerMessage('')
    setServerMessageType('')
    setShowCertError(false)
    setHackerLog([])
    hackerLogRef.current = []
    setIntegrityStep(0)
    setServerAlert(false)
    setAuthStep(0)
    setClientAlertFlash(false)
  }, [])

  useEffect(() => {
    resetSimulation()
    if (scenario === 'authentication') {
      setHandshakeStatus('idle')
      setHandshakeStep(0)
    } else if (mode === 'https' && handshakeStatus === 'idle') {
      runHandshakeAnimation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scenario, resetSimulation])

  const TYPEWRITER_CHAR_DELAY_MS = 40

  // Typewriter effect for hacker terminal
  const typewriterAppend = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      let charIndex = 0
      const completedLines = [...hackerLogRef.current]
      const interval = setInterval(() => {
        if (charIndex <= text.length) {
          const partial = text.slice(0, charIndex)
          const updatedLogs = [...completedLines, partial]
          hackerLogRef.current = updatedLogs
          setHackerLog([...updatedLogs])
          charIndex++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, TYPEWRITER_CHAR_DELAY_MS)
    })
  }, [])

  const runHandshakeAnimation = useCallback(async () => {
    setHandshakeStatus('in_progress')
    setHandshakeStep(0)
    setHackerLog([])
    hackerLogRef.current = []

    // Step 1: Server shows Public Key (yellow) + Private Key (red)
    await sleep(400)
    setHandshakeStep(1)

    // Step 2: Public Key flies from Server → Client, Hacker intercepts
    await sleep(1800)
    setHandshakeStep(2)

    // Step 3: Client receives Public Key, generates Session Key (green)
    await sleep(2200)
    setHandshakeStep(3)

    // Step 4: Session Key packaged into encrypted box, locked with Public Key
    await sleep(1800)
    setHandshakeStep(4)

    // Step 5: Box flies to Server, pauses at Hacker with typewriter log
    await sleep(1500)
    setHandshakeStep(5)

    // Typewriter logs during step 5 pause
    await sleep(300)
    hackerLogRef.current = []
    setHackerLog([])
    await typewriterAppend('> Intercepting payload...')
    await sleep(400)
    await typewriterAppend('> Attempting to decrypt...')
    await sleep(400)
    await typewriterAppend('> Error: Missing Server Private Key (Red). Decryption FAILED.')

    await sleep(800)

    // Step 6: Box continues to Server, Private Key decrypts, extracts Session Key
    setHandshakeStep(6)

    await sleep(2200)

    // Step 7: Both sides show Secure Channel badge
    setHandshakeStep(7)
    await sleep(1200)
    setHandshakeStep(0)
    setHandshakeStatus('completed')
    setHackerLog([])
    hackerLogRef.current = []
  }, [typewriterAppend])

  const scenarioData = {
    encryption: {
      title: t.encryptionTitle,
      description: t.encryptionDesc,
      placeholder: t.encryptionPlaceholder,
    },
    integrity: {
      title: t.integrityTitle,
      description: t.integrityDesc,
      placeholder: t.integrityPlaceholder,
    },
    authentication: {
      title: t.authenticationTitle,
      description: t.authenticationDesc,
      placeholder: t.authenticationPlaceholder,
    },
  }

  // Encryption functions
  // NOTE: The hardcoded key is intentional for this educational/demonstration app.
  // In production, use secure key generation and key management systems.
  const encryptData = (text: string): string => {
    const encrypted = CryptoJS.AES.encrypt(text, 'secret-key').toString()
    return encrypted
  }

  const decryptData = (encrypted: string): string => {
    const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret-key')
    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  const calculateHash = (text: string): string => {
    return CryptoJS.SHA256(text).toString()
  }

  const handleSend = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCenterMessage('')
    setServerMessage('')
    setShowCertError(false)

    if (scenario === 'encryption') {
      await handleEncryptionScenario()
    } else if (scenario === 'integrity') {
      await handleIntegrityScenario()
    } else if (scenario === 'authentication') {
      await handleAuthenticationScenario()
    }
  }

  const handleEncryptionScenario = async () => {
    if (mode === 'http') {
      // HTTP: plaintext
      const newPacket: Packet = {
        id: '1',
        content: inputText,
        position: 'client',
      }
      setPacket(newPacket)

      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      setCenterMessage(t.interceptedPlaintext(inputText))

      await sleep(1000)
      setPacket({ ...newPacket, position: 'server' })
      setServerMessage(t.receivedData(inputText))
      setServerMessageType('success')

      await sleep(1000)
      setPacket(null)
    } else {
      // HTTPS: encrypted
      const encrypted = encryptData(inputText)
      const newPacket: Packet = {
        id: '1',
        content: encrypted,
        encrypted: true,
        position: 'client',
      }
      setPacket(newPacket)

      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      setCenterMessage(t.cannotDecrypt)

      await sleep(1000)
      setPacket({ ...newPacket, position: 'server' })
      const decrypted = decryptData(encrypted)
      setServerMessage(t.decryptionSuccess(decrypted))
      setServerMessageType('success')

      await sleep(1000)
      setPacket(null)
    }
    setIsAnimating(false)
  }

  const handleIntegrityScenario = async () => {
    if (mode === 'http') {
      // HTTP: can be tampered
      const newPacket: Packet = {
        id: '1',
        content: inputText,
        position: 'client',
      }
      setPacket(newPacket)

      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      const tamperedContent = t.tamperText(inputText)
      setCenterMessage(t.tamperedData(tamperedContent))

      await sleep(1000)
      setPacket({ ...newPacket, content: tamperedContent, tampered: true, position: 'server' })
      setServerMessage(t.executingTampered(tamperedContent))
      setServerMessageType('error')

      await sleep(1000)
      setPacket(null)
    } else {
      // HTTPS: encrypted cipher box + MAC tag → blind bit-flip → hash verify fail → reject
      const encrypted = encryptData(inputText)
      const hash = calculateHash(encrypted)
      const newPacket: Packet = {
        id: '1',
        content: encrypted,
        encrypted: true,
        hash: hash,
        position: 'client',
      }
      setIntegrityStep(0)
      setServerAlert(false)
      setHackerLog([])
      hackerLogRef.current = []
      setPacket(newPacket)

      // Step 1: Packet flies to hacker zone
      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      setIntegrityStep(1)

      // Step 2: Hacker typewriter logs
      await sleep(400)
      await typewriterAppend(t.interceptingEncrypted)
      await sleep(400)
      await typewriterAppend(t.blindBitFlip)
      await sleep(300)

      // Step 3: Glitch attack visual — mark packet tampered
      setIntegrityStep(2)
      setPacket({ ...newPacket, tampered: true, position: 'center' })
      await sleep(1200)

      // Step 4: Packet continues to server
      setPacket({ ...newPacket, tampered: true, position: 'server' })
      setIntegrityStep(3)
      await sleep(1000)

      // Step 5: Server verifies MAC → failure
      setIntegrityStep(4)
      setServerAlert(true)
      const newHash = calculateHash(encrypted + '-corrupted')
      setServerMessage(
        t.integrityFailed(hash.substring(0, 16), newHash.substring(0, 16))
      )
      setServerMessageType('error')

      await sleep(2000)
      setPacket(null)
      setIntegrityStep(0)
      setServerAlert(false)
      setHackerLog([])
      hackerLogRef.current = []
    }
    setIsAnimating(false)
  }

  const handleAuthenticationScenario = async () => {
    if (mode === 'http') {
      // HTTP: Phishing success - hacker impersonates server
      setHackerLog([])
      hackerLogRef.current = []

      // Hacker pretends to be server
      await typewriterAppend(t.impersonatingServer)
      await sleep(800)

      // Client sends plaintext data
      const newPacket: Packet = {
        id: '1',
        content: inputText,
        position: 'client',
      }
      setPacket(newPacket)
      await sleep(500)

      // Hacker intercepts and swallows the packet
      setPacket({ ...newPacket, position: 'center' })
      await sleep(600)
      setPacket(null)
      await typewriterAppend(t.phishingSuccess)

      // Server never received anything
      setServerMessage(t.noRequestReceived)
      setServerMessageType('neutral')

      await sleep(2000)
      setHackerLog([])
      hackerLogRef.current = []
    } else {
      // HTTPS: CA certificate verification - handshake fails at step 1
      setHackerLog([])
      hackerLogRef.current = []
      setAuthStep(0)
      setClientAlertFlash(false)

      // Step 1: Hacker sends fake certificate to Client
      setAuthStep(1)
      await typewriterAppend(t.sendingFakeCert)
      await sleep(2200)

      // Step 2: Client receives fake cert, scanning/verification begins
      setAuthStep(2)
      await sleep(1800)

      // Step 3: Verification fails, certificate rejected, client border flashes red
      setAuthStep(3)
      setClientAlertFlash(true)
      await sleep(1500)

      // Step 4: UI warning displayed
      setAuthStep(4)
      setServerMessage(t.noRequestReceived)
      setServerMessageType('neutral')
      await typewriterAppend(t.impersonationFailed)

      await sleep(3000)

      // Reset auth animation state
      setAuthStep(0)
      setClientAlertFlash(false)
      setHackerLog([])
      hackerLogRef.current = []
    }
    setIsAnimating(false)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getPacketPosition = (position: 'client' | 'center' | 'server') => {
    switch (position) {
      case 'client':
        return { x: 0, y: 0 }
      case 'center':
        return { x: 400, y: 0 }
      case 'server':
        return { x: 800, y: 0 }
    }
  }

  const isHackerActive = (centerMessage !== '' && mode === 'http') || (integrityStep > 0 && integrityStep < 3) || (scenario === 'authentication' && hackerLog.length > 0)

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-200">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-700 shadow-lg p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-3xl font-bold text-slate-100 flex items-center gap-2 sm:gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              {t.title}
            </h1>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Toggle */}
              <button
                onClick={() => {
                  const newLocale = locale === 'en' ? 'zh' : 'en'
                  setLocale(newLocale)
                  const newT = translations[newLocale]
                  const placeholders: Record<Scenario, string> = {
                    encryption: newT.encryptionPlaceholder,
                    integrity: newT.integrityPlaceholder,
                    authentication: newT.authenticationPlaceholder,
                  }
                  setInputText(placeholders[scenario])
                  resetSimulation()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-cyan-500 transition-all"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-sm">{locale === 'en' ? '中文' : 'EN'}</span>
              </button>

              {/* HTTP/HTTPS Toggle */}
            <button
              onClick={() => {
                if (mode === 'http') {
                  setMode('https')
                  if (scenario !== 'authentication') {
                    runHandshakeAnimation()
                  }
                } else {
                  setMode('http')
                  setHandshakeStatus('idle')
                  setHandshakeStep(0)
                }
              }}
              className={`relative inline-flex items-center h-10 sm:h-16 rounded-full w-20 sm:w-32 transition-colors ${
                mode === 'https' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <span
                className={`inline-block w-8 h-8 sm:w-14 sm:h-14 transform rounded-full bg-white shadow-lg transition-transform ${
                  mode === 'https' ? 'translate-x-10 sm:translate-x-16' : 'translate-x-1'
                }`}
              />
              <span className="absolute left-1.5 sm:left-2 text-white font-bold text-[10px] sm:text-sm">
                {mode === 'http' ? 'HTTP' : ''}
              </span>
              <span className="absolute right-1.5 sm:right-2 text-white font-bold text-[10px] sm:text-sm">
                {mode === 'https' ? 'HTTPS' : ''}
              </span>
            </button>
            </div>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => {
                setScenario('encryption')
                setInputText(t.encryptionPlaceholder)
              }}
              className={`flex-1 px-3 py-2 sm:px-6 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                scenario === 'encryption'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <Lock className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {t.encryptionTab}
            </button>
            <button
              onClick={() => {
                setScenario('integrity')
                setInputText(t.integrityPlaceholder)
              }}
              className={`flex-1 px-3 py-2 sm:px-6 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                scenario === 'integrity'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <FileCheck className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {t.integrityTab}
            </button>
            <button
              onClick={() => {
                setScenario('authentication')
                setInputText(t.authenticationPlaceholder)
              }}
              className={`flex-1 px-3 py-2 sm:px-6 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                scenario === 'authentication'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              <CheckCircle className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {t.authenticationTab}
            </button>
          </div>

          <div className="mt-4 p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong className="text-cyan-400">{scenarioData[scenario].title}</strong> - {scenarioData[scenario].description}
            </p>
          </div>
        </div>
      </header>

      {/* Stage */}
      <main className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-3 gap-3 sm:gap-6 relative">
          {/* Client */}
          <div className={`bg-slate-900/80 backdrop-blur rounded-xl p-6 transition-all duration-300 ${
            clientAlertFlash
              ? 'border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] client-alert-flash'
              : mode === 'https'
              ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'border border-slate-700'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">{t.client}</h3>
                <p className="text-sm text-slate-400">{t.clientDesc}</p>
              </div>
            </div>

            {scenario !== 'authentication' && (handshakeStatus === 'completed' || (handshakeStatus === 'in_progress' && handshakeStep === 7)) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-3 py-2 bg-green-900/40 border border-green-500 rounded-lg text-center"
              >
                <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-1">
                  <Key className="w-4 h-4 text-green-400" /> Secure Channel: Session Key Ready
                </span>
              </motion.div>
            )}

            {/* Auth Scenario HTTPS: Scanning animation (Step 2) */}
            <AnimatePresence>
              {scenario === 'authentication' && authStep === 2 && (
                <motion.div
                  key="auth-scan"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-4 p-4 bg-cyan-900/30 border-2 border-cyan-500 rounded-lg text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex items-center justify-center gap-2 text-cyan-400 font-bold"
                  >
                    <ShieldCheck className="w-6 h-6" />
                    {t.caVerifying}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Scenario HTTPS: Verification failed (Step 3) */}
            <AnimatePresence>
              {scenario === 'authentication' && authStep === 3 && (
                <motion.div
                  key="auth-fail"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 bg-red-900/40 border-2 border-red-500 rounded-lg text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                    <XCircle className="w-6 h-6" />
                    {t.certFailed}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Scenario HTTPS: ERR_CERT warning (Step 4) */}
            <AnimatePresence>
              {scenario === 'authentication' && authStep === 4 && (
                <motion.div
                  key="auth-warning"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-red-400 font-bold text-lg mb-2">
                    <AlertOctagon className="w-6 h-6" />
                    ERR_CERT_AUTHORITY_INVALID
                  </div>
                  <p className="text-red-300 font-semibold text-sm">
                    {t.authFailed}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showCertError && scenario !== 'authentication' && (
              <div className="mb-4 p-4 bg-red-900/40 border-2 border-red-500 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="w-5 h-5" />
                  {t.certInvalid}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={scenarioData[scenario].placeholder}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isAnimating || handshakeStatus === 'in_progress'}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isAnimating || handshakeStatus === 'in_progress'
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95 shadow-lg shadow-cyan-500/20'
                }`}
              >
                {handshakeStatus === 'in_progress' ? (
                  <><Lock className="inline-block w-4 h-4 mr-1" /> {t.handshaking}</>
                ) : isAnimating ? t.sending : (
                  <><Send className="inline-block w-4 h-4 mr-1" /> {t.send}</>
                )}
              </button>

              {mode === 'https' && scenario === 'integrity' && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                    <Shield className="w-4 h-4" />
                    MAC Tag (Hash/HMAC)
                  </div>
                  <div className="font-mono break-all text-green-400">
                    {calculateHash(inputText).substring(0, 32)}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Hacker (Terminal Style) */}
          <div className={`bg-black rounded-xl p-0 relative overflow-hidden transition-all duration-300 ${
            isHackerActive
              ? 'border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : 'border border-slate-700'
          }`}>
            {/* Terminal Title Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400 font-mono">hacker@mitm:~</span>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  mode === 'http' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{t.hacker}</h3>
                  <p className="text-sm text-slate-500">{t.hackerDesc}</p>
                </div>
              </div>

              <div className="min-h-[200px] flex items-center justify-center">
                {handshakeStatus === 'in_progress' && (handshakeStep === 2 || handshakeStep === 5) ? (
                  <div className={`p-4 rounded-lg text-left font-mono w-full ${
                    handshakeStep === 5
                      ? 'bg-red-900/30 border-2 border-red-500 animate-pulse'
                      : 'bg-yellow-900/20 border border-yellow-500/40'
                  }`}>
                    {handshakeStep === 2 && (
                      <p className="text-sm font-semibold text-green-400">
                        [Intercepted: Public Key (Useless alone)]
                      </p>
                    )}
                    {handshakeStep === 5 && hackerLog.length > 0 && (
                      <div className="space-y-1">
                        {hackerLog.map((line, i) => (
                          <p key={i} className={`text-sm font-semibold ${
                            line.includes('FAILED') ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {line}
                            {i === hackerLog.length - 1 && <span className="animate-pulse">▊</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : integrityStep >= 1 && integrityStep <= 2 && hackerLog.length > 0 ? (
                  <div className="p-4 rounded-lg text-left font-mono w-full bg-red-900/30 border-2 border-red-500 animate-pulse">
                    <div className="space-y-1">
                      {hackerLog.map((line, i) => (
                        <p key={i} className="text-sm font-semibold text-green-400">
                          {line}
                          {i === hackerLog.length - 1 && <span className="animate-pulse">▊</span>}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : scenario === 'authentication' && hackerLog.length > 0 ? (
                  <div className="p-4 rounded-lg text-left font-mono w-full bg-red-900/30 border-2 border-red-500 animate-pulse">
                    <div className="space-y-1">
                      {hackerLog.map((line, i) => (
                        <p key={i} className={`text-sm font-semibold ${
                          line.includes('FAILED') || line.includes('failed') || line.includes('失败') ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {line}
                          {i === hackerLog.length - 1 && <span className="animate-pulse">▊</span>}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : centerMessage ? (
                  <div className={`p-4 rounded-lg text-center font-mono ${
                    mode === 'http' ? 'bg-red-900/30 border border-red-500/60' : 'bg-yellow-900/20 border border-yellow-500/40'
                  }`}>
                    <p className="text-sm font-semibold whitespace-pre-line text-green-400">{centerMessage}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-green-500/40" />
                    <p className="text-sm font-mono text-green-400/60">$ listening...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Server */}
          <div className={`bg-slate-900/80 backdrop-blur rounded-xl p-6 transition-all duration-300 ${
            serverAlert
              ? 'border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] server-alert-flash'
              : mode === 'https'
              ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'border border-slate-700'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">{t.server}</h3>
                <p className="text-sm text-slate-400">{t.serverDesc}</p>
              </div>
            </div>

            {scenario !== 'authentication' && (handshakeStatus === 'completed' || (handshakeStatus === 'in_progress' && handshakeStep === 7)) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-3 py-2 bg-green-900/40 border border-green-500 rounded-lg text-center"
              >
                <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-1">
                  <Key className="w-4 h-4 text-green-400" /> Secure Channel: Session Key Ready
                </span>
              </motion.div>
            )}

            <div className="min-h-[200px] flex items-center justify-center">
              {serverMessage ? (
                <div className={`p-4 rounded-lg ${
                  serverMessageType === 'error'
                    ? 'bg-red-900/30 border border-red-500/60'
                    : serverMessageType === 'neutral'
                    ? 'bg-slate-800 border border-slate-600'
                    : 'bg-green-900/30 border border-green-500/60'
                }`}>
                  <p className="text-sm font-semibold whitespace-pre-line text-slate-200">{serverMessage}</p>
                </div>
              ) : (
                <div className="text-slate-500 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">{t.waitingForData}</p>
                </div>
              )}
            </div>
          </div>

          {/* TLS Handshake Animation */}
          <AnimatePresence>
            {/* Step 1: Server shows Public Key (yellow) + Private Key (red) */}
            {handshakeStatus === 'in_progress' && handshakeStep === 1 && (
              <motion.div
                key="step1-keys"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-[20%] right-[4%] z-50 flex flex-col gap-2"
              >
                <div className="px-4 py-2 rounded-lg bg-yellow-500 text-white shadow-2xl shadow-yellow-500/50 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  <span className="font-bold text-sm">Public Key</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  <span className="font-bold text-sm">Private Key</span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Public Key flies Server → Client (through Hacker) */}
            {handshakeStatus === 'in_progress' && handshakeStep === 2 && (
              <>
                {/* Private Key stays at Server */}
                <motion.div
                  key="step2-private-key"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-[20%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Private Key</span>
                  </div>
                </motion.div>
                {/* Public Key flies to Client */}
                <motion.div
                  key="step2-public-key-fly"
                  initial={{ x: '68%', y: 0, opacity: 1 }}
                  animate={{ x: '2%', y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
                >
                  <div className="px-4 py-2 rounded-lg bg-yellow-500 text-white shadow-2xl shadow-yellow-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Public Key</span>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 3: Client receives Public Key, generates Session Key */}
            {handshakeStatus === 'in_progress' && handshakeStep === 3 && (
              <>
                {/* Private Key stays at Server */}
                <motion.div
                  key="step3-private-key"
                  className="absolute top-[20%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Private Key</span>
                  </div>
                </motion.div>
                {/* Public Key arrived at Client */}
                <motion.div
                  key="step3-public-key"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-[20%] left-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-yellow-500 text-white shadow-2xl shadow-yellow-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Public Key</span>
                  </div>
                </motion.div>
                {/* Session Key generates at Client */}
                <motion.div
                  key="step3-session-key"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'backOut' }}
                  className="absolute top-[35%] left-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-green-500 text-white shadow-2xl shadow-green-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Session Key</span>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 4: Session Key packaged into box, locked with Public Key */}
            {handshakeStatus === 'in_progress' && handshakeStep === 4 && (
              <>
                {/* Private Key stays at Server */}
                <motion.div
                  key="step4-private-key"
                  className="absolute top-[20%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Private Key</span>
                  </div>
                </motion.div>
                {/* Session Key + Public Key merge into encrypted box */}
                <motion.div
                  key="step4-session-key-fade"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-[35%] left-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-green-500 text-white shadow-2xl shadow-green-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Session Key</span>
                  </div>
                </motion.div>
                <motion.div
                  key="step4-pubkey-fade"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-[20%] left-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-yellow-500 text-white shadow-2xl shadow-yellow-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Public Key</span>
                  </div>
                </motion.div>
                {/* Encrypted box appears */}
                <motion.div
                  key="step4-box"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'backOut' }}
                  className="absolute top-[25%] left-[4%] z-50"
                >
                  <div className="relative px-5 py-3 rounded-lg bg-purple-600 text-white shadow-2xl shadow-purple-500/50">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      <Lock className="w-4 h-4" />
                      <span className="font-bold text-sm">Encrypted Box</span>
                    </div>
                    <div className="text-xs mt-1 opacity-80">Contains: Session Key</div>
                    {/* Yellow badge indicating locked with Public Key */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Key className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 5: Box flies to Server, pauses at Hacker */}
            {handshakeStatus === 'in_progress' && handshakeStep === 5 && (
              <>
                {/* Private Key stays at Server */}
                <motion.div
                  key="step5-private-key"
                  className="absolute top-[20%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Private Key</span>
                  </div>
                </motion.div>
                {/* Box flies to center then pauses */}
                <motion.div
                  key="step5-box"
                  initial={{ x: '2%', y: 0, opacity: 1 }}
                  animate={{ x: '35%', y: 0, opacity: 1 }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                  className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
                >
                  <div className="relative px-5 py-3 rounded-lg bg-purple-600 text-white shadow-2xl shadow-purple-500/50">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      <Lock className="w-4 h-4" />
                      <span className="font-bold text-sm">Encrypted Box</span>
                    </div>
                    <div className="text-xs mt-1 opacity-80">Contains: Session Key</div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Key className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 6: Box continues to Server, Private Key decrypts, Session Key extracted */}
            {handshakeStatus === 'in_progress' && handshakeStep === 6 && (
              <>
                {/* Private Key at Server */}
                <motion.div
                  key="step6-private-key"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-[20%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-2xl shadow-red-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Private Key</span>
                  </div>
                </motion.div>
                {/* Box flies to Server then disappears */}
                <motion.div
                  key="step6-box"
                  initial={{ x: '35%', y: 0, opacity: 1 }}
                  animate={{ x: '68%', y: 0, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
                >
                  <div className="relative px-5 py-3 rounded-lg bg-purple-600 text-white shadow-2xl shadow-purple-500/50">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      <Lock className="w-4 h-4" />
                      <span className="font-bold text-sm">Encrypted Box</span>
                    </div>
                    <div className="text-xs mt-1 opacity-80">Contains: Session Key</div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Key className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </motion.div>
                {/* Private Key "touches" box - Unlock icon appears */}
                <motion.div
                  key="step6-unlock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="absolute top-[38%] right-[8%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-red-900/60 border border-red-400 text-white flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-bold">Decrypting...</span>
                  </div>
                </motion.div>
                {/* Session Key extracted at Server */}
                <motion.div
                  key="step6-session-key"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.6, ease: 'backOut' }}
                  className="absolute top-[50%] right-[4%] z-50"
                >
                  <div className="px-4 py-2 rounded-lg bg-green-500 text-white shadow-2xl shadow-green-500/50 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    <span className="font-bold text-sm">Session Key</span>
                  </div>
                </motion.div>
              </>
            )}

            {/* Auth Scenario HTTPS: Fake certificate flies from Hacker → Client */}
            {scenario === 'authentication' && authStep === 1 && (
              <motion.div
                key="auth-fake-cert"
                initial={{ x: '35%', y: 0, opacity: 1 }}
                animate={{ x: '2%', y: 0, opacity: 1 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="absolute top-1/2 left-0 z-50 -translate-y-1/2"
              >
                <div className="px-4 py-3 rounded-lg bg-red-700 text-white shadow-2xl shadow-red-500/50 border-2 border-red-400">
                  <div className="flex items-center gap-2">
                    <FileWarning className="w-5 h-5" />
                    <span className="font-bold text-sm">Fake Certificate</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80 flex items-center gap-1">
                    <Key className="w-3 h-3" /> Fake Public Key
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Packet */}
          <AnimatePresence>
            {packet && (
              <motion.div
                key={packet.id}
                initial={getPacketPosition('client')}
                animate={getPacketPosition(packet.position)}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute top-1/2 left-[12%] z-50"
              >
                {/* Integrity HTTPS: cipher box with shield */}
                {scenario === 'integrity' && mode === 'https' ? (
                  <div className={`relative px-6 py-4 rounded-lg shadow-2xl transform -translate-y-1/2 border-2 ${
                    packet.tampered
                      ? 'bg-slate-900 border-red-500 shadow-red-500/50 integrity-glitch'
                      : 'bg-slate-900 border-green-500 shadow-green-500/30'
                  }`}>
                    <div className="font-bold text-sm mb-1 flex items-center gap-1 text-slate-200">
                      <Package className="w-4 h-4" /> {t.cipherBox}
                    </div>
                    <div className="text-xs font-mono break-all max-w-[150px] text-slate-400">
                      {packet.content.substring(0, 20)}...
                    </div>
                    <div className="mt-1 text-xs flex items-center gap-1 text-green-400">
                      <Key className="w-3 h-3" /> AES
                    </div>
                    {/* Shield / MAC tag */}
                    {integrityStep < 4 ? (
                      <div className="absolute -top-3 -right-3 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -top-3 -right-3 w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center opacity-40">
                        <Shield className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`px-6 py-4 rounded-lg shadow-2xl transform -translate-y-1/2 ${
                    packet.tampered
                      ? 'bg-red-600 text-white shadow-red-500/50'
                      : packet.encrypted
                      ? 'bg-purple-600 text-white shadow-purple-500/50'
                      : 'bg-blue-600 text-white shadow-blue-500/50'
                  }`}>
                    <div className="font-bold text-sm mb-1 flex items-center gap-1"><Package className="w-4 h-4" /> {t.dataPacket}</div>
                    <div className="text-xs font-mono break-all max-w-[150px]">
                      {packet.encrypted ? packet.content.substring(0, 30) + '...' : packet.content}
                    </div>
                    {packet.hash && (
                      <div className="mt-2 text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Hash: {packet.hash.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="font-bold text-lg mb-4 text-slate-100 flex items-center gap-2"><BookOpen className="w-5 h-5" /> {t.legend}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-1"><Lock className="w-4 h-4" /> {t.scenario1Legend}</h4>
              <p className="text-slate-400">
                <strong className="text-slate-300">HTTP:</strong> {t.scenario1Http}<br />
                <strong className="text-slate-300">HTTPS:</strong> {t.scenario1Https}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-1"><Shield className="w-4 h-4" /> {t.scenario2Legend}</h4>
              <p className="text-slate-400">
                <strong className="text-slate-300">HTTP:</strong> {t.scenario2Http}<br />
                <strong className="text-slate-300">HTTPS:</strong> {t.scenario2Https}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {t.scenario3Legend}</h4>
              <p className="text-slate-400">
                <strong className="text-slate-300">HTTP:</strong> {t.scenario3Http}<br />
                <strong className="text-slate-300">HTTPS:</strong> {t.scenario3Https}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
