import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, FileCheck, CheckCircle, XCircle, AlertTriangle, Wifi } from 'lucide-react'
import CryptoJS from 'crypto-js'

type Scenario = 'encryption' | 'integrity' | 'authentication'
type Mode = 'http' | 'https'

interface Packet {
  id: string
  content: string
  encrypted?: boolean
  hash?: string
  tampered?: boolean
  position: 'client' | 'center' | 'server'
}

function App() {
  const [scenario, setScenario] = useState<Scenario>('encryption')
  const [mode, setMode] = useState<Mode>('http')
  const [inputText, setInputText] = useState('我的密码是123456')
  const [packet, setPacket] = useState<Packet | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [centerMessage, setCenterMessage] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [showCertError, setShowCertError] = useState(false)

  const scenarioData = {
    encryption: {
      title: '🔐 加密 (防监听)',
      description: '演示数据加密如何保护隐私',
      placeholder: '我的密码是123456',
    },
    integrity: {
      title: '🛡️ 完整性 (防篡改)',
      description: '演示Hash如何检测数据被篡改',
      placeholder: '转账给张三 100元',
    },
    authentication: {
      title: '✅ 验证 (防伪造)',
      description: '演示证书如何验证服务器身份',
      placeholder: '我的银行账号',
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
      setCenterMessage(`😈 截获明文: "${inputText}"`)

      await sleep(1000)
      setPacket({ ...newPacket, position: 'server' })
      setServerMessage(`✅ 收到数据: "${inputText}"`)

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
      setCenterMessage(`🤬 只能看到乱码，无法解密！`)

      await sleep(1000)
      setPacket({ ...newPacket, position: 'server' })
      const decrypted = decryptData(encrypted)
      setServerMessage(`✅ 解密成功: "${decrypted}"`)

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
      const tamperedContent = inputText.replace('张三', '黑客').replace('100', '10000')
      setCenterMessage(`😈 篡改数据: "${tamperedContent}"`)

      await sleep(1000)
      setPacket({ ...newPacket, content: tamperedContent, tampered: true, position: 'server' })
      setServerMessage(`❌ 执行被篡改的指令: "${tamperedContent}"`)

      await sleep(1000)
      setPacket(null)
    } else {
      // HTTPS: integrity check with hash
      const hash = calculateHash(inputText)
      const newPacket: Packet = {
        id: '1',
        content: inputText,
        hash: hash,
        position: 'client',
      }
      setPacket(newPacket)

      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      const tamperedContent = inputText.replace('张三', '黑客').replace('100', '10000')
      setCenterMessage(`😈 尝试篡改: "${tamperedContent}"`)

      await sleep(1000)
      setPacket({ ...newPacket, content: tamperedContent, tampered: true, position: 'server' })
      const newHash = calculateHash(tamperedContent)
      const isValid = newHash === hash
      setServerMessage(
        `🔍 Hash校验: ${isValid ? '✅ 通过' : '❌ 失败'}\n原始Hash: ${hash.substring(0, 16)}...\n当前Hash: ${newHash.substring(0, 16)}...\n🚫 拒收数据包！`
      )

      await sleep(1500)
      setPacket(null)
    }
    setIsAnimating(false)
  }

  const handleAuthenticationScenario = async () => {
    if (mode === 'http') {
      // HTTP: hacker can pretend to be server
      setCenterMessage(`🎭 我是真服务器！(假冒)`)
      await sleep(500)

      const newPacket: Packet = {
        id: '1',
        content: inputText,
        position: 'client',
      }
      setPacket(newPacket)

      await sleep(500)
      setPacket({ ...newPacket, position: 'center' })
      setCenterMessage(`😈 成功截获所有数据: "${inputText}"`)
      setServerMessage(`😴 服务器未收到任何数据`)

      await sleep(1500)
      setPacket(null)
    } else {
      // HTTPS: certificate validation
      setShowCertError(true)
      setCenterMessage(`🚫 无法提供合法CA证书`)
      setServerMessage(`⏳ 等待连接...`)

      await sleep(1500)
      setShowCertError(false)
      setCenterMessage(`🤬 连接被客户端拦截`)
      setServerMessage(`😴 服务器未收到任何数据`)

      await sleep(1500)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              HTTPS 安全演示器
            </h1>
            
            {/* HTTP/HTTPS Toggle */}
            <button
              onClick={() => setMode(mode === 'http' ? 'https' : 'http')}
              className={`relative inline-flex items-center h-16 rounded-full w-32 transition-colors ${
                mode === 'https' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <span
                className={`inline-block w-14 h-14 transform rounded-full bg-white shadow-lg transition-transform ${
                  mode === 'https' ? 'translate-x-16' : 'translate-x-1'
                }`}
              />
              <span className="absolute left-2 text-white font-bold text-sm">
                {mode === 'http' ? '🔴 HTTP' : ''}
              </span>
              <span className="absolute right-2 text-white font-bold text-sm">
                {mode === 'https' ? '🟢 HTTPS' : ''}
              </span>
            </button>
          </div>

          {/* Scenario Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScenario('encryption')
                setInputText('我的密码是123456')
              }}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                scenario === 'encryption'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Lock className="inline-block w-5 h-5 mr-2" />
              1. 加密 (防监听)
            </button>
            <button
              onClick={() => {
                setScenario('integrity')
                setInputText('转账给张三 100元')
              }}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                scenario === 'integrity'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FileCheck className="inline-block w-5 h-5 mr-2" />
              2. 完整性 (防篡改)
            </button>
            <button
              onClick={() => {
                setScenario('authentication')
                setInputText('我的银行账号')
              }}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                scenario === 'authentication'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <CheckCircle className="inline-block w-5 h-5 mr-2" />
              3. 验证 (防伪造)
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>{scenarioData[scenario].title}</strong> - {scenarioData[scenario].description}
            </p>
          </div>
        </div>
      </header>

      {/* Stage */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6 relative">
          {/* Client */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💻</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">客户端</h3>
                <p className="text-sm text-gray-500">用户浏览器</p>
              </div>
            </div>

            {showCertError && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <XCircle className="w-5 h-5" />
                  证书无效，拦截连接！
                </div>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={scenarioData[scenario].placeholder}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isAnimating}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isAnimating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isAnimating ? '发送中...' : '📤 发送'}
              </button>

              {mode === 'https' && scenario === 'integrity' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                    <FileCheck className="w-4 h-4" />
                    防伪贴 (Hash)
                  </div>
                  <div className="font-mono break-all text-gray-600">
                    {calculateHash(inputText).substring(0, 32)}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Hacker */}
          <div className="bg-white rounded-xl shadow-xl p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                mode === 'http' ? 'bg-red-500' : 'bg-yellow-500'
              }`}>
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">中间人</h3>
                <p className="text-sm text-gray-500">公共WiFi / 黑客</p>
              </div>
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              {centerMessage ? (
                <div className={`p-4 rounded-lg text-center ${
                  mode === 'http' ? 'bg-red-100 border-2 border-red-500' : 'bg-yellow-100 border-2 border-yellow-500'
                }`}>
                  <p className="text-sm font-semibold whitespace-pre-line">{centerMessage}</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">监听中...</p>
                </div>
              )}
            </div>
          </div>

          {/* Server */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">服务器</h3>
                <p className="text-sm text-gray-500">银行 / 网站</p>
              </div>
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              {serverMessage ? (
                <div className={`p-4 rounded-lg ${
                  serverMessage.includes('❌') || serverMessage.includes('🚫')
                    ? 'bg-red-100 border-2 border-red-500'
                    : serverMessage.includes('😴')
                    ? 'bg-gray-100 border-2 border-gray-400'
                    : 'bg-green-100 border-2 border-green-500'
                }`}>
                  <p className="text-sm font-semibold whitespace-pre-line">{serverMessage}</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">等待数据...</p>
                </div>
              )}
            </div>
          </div>

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
                <div className={`px-6 py-4 rounded-lg shadow-2xl transform -translate-y-1/2 ${
                  packet.tampered
                    ? 'bg-red-500 text-white'
                    : packet.encrypted
                    ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  <div className="font-bold text-sm mb-1">📦 数据包</div>
                  <div className="text-xs font-mono break-all max-w-[150px]">
                    {packet.encrypted ? packet.content.substring(0, 30) + '...' : packet.content}
                  </div>
                  {packet.hash && (
                    <div className="mt-2 text-xs">
                      🔒 Hash: {packet.hash.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">📚 说明</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🔐 场景 1: 加密</h4>
              <p className="text-gray-600">
                <strong>HTTP:</strong> 明文传输，黑客能看到所有内容<br />
                <strong>HTTPS:</strong> AES加密，黑客只能看到乱码
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🛡️ 场景 2: 完整性</h4>
              <p className="text-gray-600">
                <strong>HTTP:</strong> 数据可被篡改，服务器无法察觉<br />
                <strong>HTTPS:</strong> SHA-256 Hash校验，篡改立即被发现
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">✅ 场景 3: 验证</h4>
              <p className="text-gray-600">
                <strong>HTTP:</strong> 黑客可假冒服务器截获数据<br />
                <strong>HTTPS:</strong> CA证书验证，假冒立即被识破
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
