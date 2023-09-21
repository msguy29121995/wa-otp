const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const { default: makeWASocket, Browsers } = require('@whiskeysockets/baileys');

async function connectionlogic() {
  const { state, saveCreds } = await useMultiFileAuthState('authUser-03');
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
      const id = pesanMasuk.key.remoteJid.replace('@s.whatsapp.net', '');
      const pushname = pesanMasuk.pushName;
      const rizalNumber = '6282347431338@s.whatsapp.net';

      try {
        const contentText = pesanMasuk.message.conversation;
        if (contentText !== '') {
          const text = `FromNumber: ${id}\nPushName: *${pushname}*\nBody: 👇\n\n*${contentText}*\n\n `;
          sendss(rizalNumber, text);
        }
      } catch (error) {
        console.log(' try 1 error  =>  ', error.message);
        // sendss(rizalNumber, JSON.stringify(pesanMasuk, undefined, 2));
      }

      try {
        const pesanfromStich = pesanMasuk.message.templateMessage.hydratedTemplate;
        if (pesanfromStich !== '') {
          const contentText = pesanfromStich.hydratedContentText;
          const footerText = pesanfromStich.hydratedFooterText;
          const text = `FromNumber: ${id}\nPushName: *${pushname}*\nBody: 👇\n\n*${contentText}*\n\n_${footerText}_ `;
          sendss(rizalNumber, text);
          // console.log(pesanMasuk.message);
          // console.log(JSON.stringify(pesanMasuk.message.templateMessage, undefined, 2));
        }
      } catch (error) {
        console.log(('tray 2error  =>  ', error.message));
        // sendss(rizalNumber, JSON.stringify(pesanMasuk, undefined, 2));
      }

      try {
        const pesanfromStich = pesanMasuk.message.highlyStructuredMessage.hydratedHsm;

        if (pesanfromStich !== '') {
          const verifiedBizNmae = pesanMasuk.verifiedBizNmae;
          const contentText = pesanfromStich.hydratedTemplate.hydratedContentText;
          // const footerText = pesanMasuk.message.templateMessage.hydratedTemplate.hydratedFooterText;
          const text = `FromNumber: ${id}\nPushName: *${verifiedBizNmae}*\nBody: 👇\n\n*${contentText}*\n\n `;
          sendss(rizalNumber, text);
          // console.log(pesanMasuk.message);
          // console.log(JSON.stringify(pesanMasuk.message.templateMessage, undefined, 2));
        }
      } catch (error) {
        console.log('try 3 error  =>  ', error.message);
        // sendss(rizalNumber, JSON.stringify(pesanMasuk, undefined, 2));
      }
    }
  });
}

connectionlogic();
