<p align="center">
  <h1 align="center">🔐 HTTPS 安全演示沙盒<br/><sub>HTTPS Visual Simulator</sub></h1>
</p>

<p align="center">
  <strong>一个纯前端交互式密码学教学动画沙盒 —— 赛博朋克风格，硬核演绎 HTTPS 底层原理</strong>
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

## 📖 项目简介

> **"如果你无法简单地解释它，那你就没有真正理解它。"** —— 理查德·费曼

**HTTPS Visual Simulator** 是一个**纯前端交互式动画沙盒**，采用**赛博朋克 / 黑客终端**的暗黑视觉风格。它的使命是将晦涩难懂的 HTTPS 底层密码学原理——**CIA 三要素（机密性、完整性、身份验证）**、**TLS 握手协议**、**RSA/AES 混合加密体系**——通过**极其直观的逐帧动画分镜**，展现出来。

无需后端，无需部署，打开浏览器即可体验一场关于**信息安全攻防**的视觉盛宴。你将亲眼看到中间人（MITM）如何发起攻击，又是如何被现代密码学机制逐一击溃。

<p align="center">
  <!-- 👇 请在此处放置项目演示动图（GIF / 视频截图） -->
  <img src="" alt="HTTPS Visual Simulator 演示动图" width="800" />
  <br/>
  <em>📸 请在此处放置演示动图 (GIF) 或截图</em>
</p>

---

## 🎯 核心演示场景

本项目涵盖 **4 个硬核密码学教学场景**，完整还原 HTTPS 保护数据的全过程：

### 🤝 TLS 握手（RSA 交换 AES 会话密钥）

> 一切安全通信的起点 —— 密钥协商。

演示了完整的 **TLS 握手七步流程**：

1. **Server** 亮出自己的 🟡 公钥（Public Key）与 🔴 私钥（Private Key）。
2. 🟡 公钥通过网络传输至 **Client**，途经中间人的监听节点。
3. **Client** 使用公钥生成 🟢 会话密钥（Session Key）。
4. 会话密钥被封装进紫色加密盒子，用公钥上锁。
5. 加密盒子飞向 **Server**，中间人截获后尝试解密 —— **失败**。黑客终端闪烁：
   ```
   > Intercepting payload...
   > Attempting to decrypt...
   > Error: Missing Server Private Key. Decryption FAILED.
   ```
6. **Server** 用 🔴 私钥解锁盒子，取出 🟢 会话密钥。
7. 双方建立 **安全加密信道**，后续通信全部使用 AES 对称加密。

---

### 🔒 场景一：机密性（防监听）

> **明文 vs AES-GCM 密文 —— 中间人截获了，但读不懂。**

| 模式 | 传输内容 | 中间人看到的 |
|:---:|:---:|:---:|
| HTTP | `"转账给张三100元"` | `"转账给张三100元"` ⚠️ 完全可读 |
| HTTPS | `U2FsdGVkX1...` (AES 密文) | `U2FsdGVkX1...` 🔒 不可读乱码 |

在 HTTP 模式下，中间人像读报纸一样轻松获取你的明文数据。切换到 HTTPS 后，即使截获数据包，看到的也只是一堆**经过 AES 加密的不可读密文**。机密性，就是让窃听者"看得见，读不懂"。

---

### 🛡️ 场景二：完整性（防篡改）

> **这是本项目的硬核亮点 —— "加密 ≠ 防篡改"。**

许多人误以为数据加密后就万事大吉。本场景深入演示了一个反直觉的事实：**黑客无需解密，也能破坏你的数据**。

**攻击演示：比特翻转攻击（Bit-Flipping Attack）**

1. Client 发送 AES 加密后的密文与 **SHA-256 哈希校验值**。
2. 中间人截获密文后，**盲目翻转部分比特位** —— 密文被"污染"。
3. 篡改后的密文到达 Server，Server 解密后得到乱码。
4. Server 重新计算哈希并与原始校验值比对 —— **不匹配！**
5. Server 立即 **丢弃该数据包**，弹出红色告警：
   ```
   ⚠️ 完整性校验失败！数据已被篡改，连接已终止。
   ```

这就是 **MAC（消息认证码）** 机制的威力：确保数据"一个比特都不能改"。

---

### 📜 场景三：身份验证（防伪造）

> **中间人举着假证书，被浏览器当场识破。**

| 模式 | 服务器身份 | 验证结果 |
|:---:|:---:|:---:|
| HTTP | 无验证机制 | 黑客冒充服务器，用户毫不知情 ⚠️ |
| HTTPS | CA 签发数字证书 | 假证书被识别，连接立即拦截 🛑 |

在 HTTP 模式下，中间人可以完美伪装成目标服务器，你的所有数据直接送入黑客手中。HTTPS 模式下，浏览器会验证服务器出示的 **CA 数字证书**——中间人无法伪造受信任 CA 的签名，冒充者**当场被拦截**，连接被终止。

---

## 🚀 快速开始

确保本地已安装 [Node.js](https://nodejs.org/)（v16+）和 npm。

```bash
# 1. 克隆项目
git clone https://github.com/diaosj/https-simulator.git

# 2. 进入项目目录
cd https-simulator

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

启动后，在浏览器中打开终端输出的本地地址（默认 `http://localhost:5173`），即可进入 HTTPS 安全演示沙盒。

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 📄 开源许可

本项目基于 [MIT License](./LICENSE) 开源。

---

<p align="center">
  <sub>用代码诠释安全，用动画点亮密码学。</sub>
  <br/>
  <sub>Built with 🖤 by <a href="https://github.com/diaosj">diaosj</a></sub>
</p>