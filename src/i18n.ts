export type Locale = 'en' | 'zh'

export interface Translations {
  title: string
  encryptionTab: string
  integrityTab: string
  authenticationTab: string
  encryptionTitle: string
  encryptionDesc: string
  encryptionPlaceholder: string
  integrityTitle: string
  integrityDesc: string
  integrityPlaceholder: string
  authenticationTitle: string
  authenticationDesc: string
  authenticationPlaceholder: string
  client: string
  clientDesc: string
  hacker: string
  hackerDesc: string
  server: string
  serverDesc: string
  handshaking: string
  sending: string
  send: string
  cannotDecrypt: string
  noRequestReceived: string
  waitingForData: string
  caVerifying: string
  certFailed: string
  authFailed: string
  certInvalid: string
  interceptingEncrypted: string
  blindBitFlip: string
  impersonatingServer: string
  phishingSuccess: string
  sendingFakeCert: string
  impersonationFailed: string
  cipherBox: string
  dataPacket: string
  legend: string
  scenario1Legend: string
  scenario1Http: string
  scenario1Https: string
  scenario2Legend: string
  scenario2Http: string
  scenario2Https: string
  scenario3Legend: string
  scenario3Http: string
  scenario3Https: string
  interceptedPlaintext: (text: string) => string
  receivedData: (text: string) => string
  decryptionSuccess: (text: string) => string
  tamperedData: (text: string) => string
  executingTampered: (text: string) => string
  integrityFailed: (origHash: string, newHash: string) => string
  tamperText: (text: string) => string
}

export const translations: Record<Locale, Translations> = {
  en: {
    title: 'HTTPS Security Simulator',
    encryptionTab: '1. Encryption (Anti-Eavesdropping)',
    integrityTab: '2. Integrity (Anti-Tampering)',
    authenticationTab: '3. Authentication (Anti-Impersonation)',
    encryptionTitle: 'Encryption (Anti-Eavesdropping)',
    encryptionDesc: 'Demonstrates how encryption protects privacy',
    encryptionPlaceholder: 'My password is 123456',
    integrityTitle: 'Integrity (Anti-Tampering)',
    integrityDesc: 'Demonstrates how hashing detects data tampering',
    integrityPlaceholder: 'Transfer $100 to Alice',
    authenticationTitle: 'Authentication (Anti-Impersonation)',
    authenticationDesc: 'Demonstrates how certificates verify server identity',
    authenticationPlaceholder: 'My bank account',
    client: 'Client',
    clientDesc: 'User Browser',
    hacker: 'Man-in-the-Middle',
    hackerDesc: 'Public WiFi / Hacker',
    server: 'Server',
    serverDesc: 'Bank / Website',
    handshaking: 'Handshaking...',
    sending: 'Sending...',
    send: 'Send',
    cannotDecrypt: 'Can only see garbled data, unable to decrypt!',
    noRequestReceived: '[No request received]',
    waitingForData: 'Waiting for data...',
    caVerifying: 'CA Certificate Verification...',
    certFailed: 'Certificate Verification Failed!',
    authFailed: 'Authentication failed! Connection severed.',
    certInvalid: 'Invalid certificate, connection blocked!',
    interceptingEncrypted: '> Intercepting encrypted data (AES)...',
    blindBitFlip: '> Cannot decrypt! Executing blind bit-flipping attack...',
    impersonatingServer: '[Impersonating target server...]',
    phishingSuccess: '[Credentials captured: Phishing successful!]',
    sendingFakeCert: '> Sending forged SSL certificate...',
    impersonationFailed: '> Impersonation FAILED! Client rejected the forged certificate.',
    cipherBox: 'Cipher Box',
    dataPacket: 'Data Packet',
    legend: 'Legend',
    scenario1Legend: 'Scenario 1: Encryption',
    scenario1Http: 'Plaintext transmission, hackers can see everything',
    scenario1Https: 'AES encrypted, hackers only see garbled data',
    scenario2Legend: 'Scenario 2: Integrity',
    scenario2Http: 'Data can be tampered, server is unaware',
    scenario2Https: 'AES encryption + hash verification, blind tampering detected and dropped',
    scenario3Legend: 'Scenario 3: Authentication',
    scenario3Http: 'Hacker impersonates server, phishing captures all data',
    scenario3Https: 'CA certificate detects forgery, handshake fails immediately, connection severed',
    interceptedPlaintext: (text: string) => `Intercepted plaintext: "${text}"`,
    receivedData: (text: string) => `Received data: "${text}"`,
    decryptionSuccess: (text: string) => `Decryption successful: "${text}"`,
    tamperedData: (text: string) => `Tampered data: "${text}"`,
    executingTampered: (text: string) => `Executing tampered command: "${text}"`,
    integrityFailed: (origHash: string, newHash: string) =>
      `❌ Integrity check failed! Hash mismatch, data was tampered in transit! Dropped.\nOriginal Hash: ${origHash}...\nCurrent Hash: ${newHash}...`,
    tamperText: (text: string) => text.replace('Alice', 'Hacker').replace('100', '10000'),
  },
  zh: {
    title: 'HTTPS 安全演示器',
    encryptionTab: '1. 加密 (防监听)',
    integrityTab: '2. 完整性 (防篡改)',
    authenticationTab: '3. 验证 (防伪造)',
    encryptionTitle: '加密 (防监听)',
    encryptionDesc: '演示数据加密如何保护隐私',
    encryptionPlaceholder: '我的密码是123456',
    integrityTitle: '完整性 (防篡改)',
    integrityDesc: '演示Hash如何检测数据被篡改',
    integrityPlaceholder: '转账给张三 100元',
    authenticationTitle: '验证 (防伪造)',
    authenticationDesc: '演示证书如何验证服务器身份',
    authenticationPlaceholder: '我的银行账号',
    client: '客户端',
    clientDesc: '用户浏览器',
    hacker: '中间人',
    hackerDesc: '公共WiFi / 黑客',
    server: '服务器',
    serverDesc: '银行 / 网站',
    handshaking: '握手中...',
    sending: '发送中...',
    send: '发送',
    cannotDecrypt: '只能看到乱码，无法解密！',
    noRequestReceived: '[未收到任何请求]',
    waitingForData: '等待数据...',
    caVerifying: 'CA 证书验证中...',
    certFailed: '证书验证失败！',
    authFailed: '身份验证失败！已切断连接。',
    certInvalid: '证书无效，拦截连接！',
    interceptingEncrypted: '> 截获加密数据 (AES)...',
    blindBitFlip: '> 无法解密！执行盲目比特翻转攻击 (Bit-Flipping)...',
    impersonatingServer: '[伪装成目标服务器...]',
    phishingSuccess: '[获取账号密码：钓鱼成功！]',
    sendingFakeCert: '> 发送伪造的 SSL 证书...',
    impersonationFailed: '> 伪装失败！客户端拒绝了伪造证书。',
    cipherBox: '密码箱',
    dataPacket: '数据包',
    legend: '说明',
    scenario1Legend: '场景 1: 加密',
    scenario1Http: '明文传输，黑客能看到所有内容',
    scenario1Https: 'AES加密，黑客只能看到乱码',
    scenario2Legend: '场景 2: 完整性',
    scenario2Http: '数据可被篡改，服务器无法察觉',
    scenario2Https: 'AES加密 + 哈希校验，盲改被发现并丢弃',
    scenario3Legend: '场景 3: 验证',
    scenario3Http: '黑客伪装成服务器，钓鱼截获全部数据',
    scenario3Https: 'CA证书验证假证书，握手第一步即失败，连接被切断',
    interceptedPlaintext: (text: string) => `截获明文: "${text}"`,
    receivedData: (text: string) => `收到数据: "${text}"`,
    decryptionSuccess: (text: string) => `解密成功: "${text}"`,
    tamperedData: (text: string) => `篡改数据: "${text}"`,
    executingTampered: (text: string) => `执行被篡改的指令: "${text}"`,
    integrityFailed: (origHash: string, newHash: string) =>
      `❌ 完整性校验失败！MAC Tag 不匹配，数据在传输途中被篡改！已丢弃。\n原始MAC: ${origHash}...\n当前MAC: ${newHash}...`,
    tamperText: (text: string) => text.replace('张三', '黑客').replace('100', '10000'),
  },
}
