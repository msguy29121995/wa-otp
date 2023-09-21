const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const { default: makeWASocket, Browsers } = require('@whiskeysockets/baileys');

async function connectionlogic() {
  const { state, saveCreds } = await useMultiFileAuthState('authUser');
  const client = makeWASocket({
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Server'),
    auth: state,
  });

  client.ev.on('connection.update', async (update) => {
    const { connection, LastDisconnect } = update || {};

    if (connection === 'close') {
      const shouldReconnect = LastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connectionlogic();
      }
    } else if (connection === 'open') {
      console.log('\n\nAUTH BERHASIL\n\n');
    }
  });

  client.ev.on('creds.update', saveCreds);

  client.ev.on('messages.upsert', (m) => {
    async function sendss(id, text) {
      await client.sendMessage(id, { text: text });
    }

    // console.log(m.messages[0]);
    // console.log(JSON.stringify(m.messages[0], undefined, 2));

    const typeMessage = m.type;
    const pesanMasuk = m.messages[0];
    const fromMe = m.messages[0].key.fromMe;

    // Pesan masuk
    if (!fromMe && typeMessage === 'notify') {
      const id = m.messages[0].key.remoteJid.replace('@s.whatsapp.net', '');
      const pushname = m.messages[0].pushName;
      const rizalNumber = '6282347431338@s.whatsapp.net';

      try {
        if (pesanMasuk.message.conversation !== '') {
          const text = `FromNumber: ${id}\nPushName: *${pushname}*\nBody: 👇\n\n${pesanMasuk.message.conversation}`;
          sendss(rizalNumber, text);
        }
      } catch (error) {
        console.log(JSON.stringify(pesanMasuk, undefined, 2));
        console.error(error.message);
      }
    }
  });
}

connectionlogic();
