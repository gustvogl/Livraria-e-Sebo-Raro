import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escolherCapaDaGaleria, abrirCameraOuGaleria, tirarFotoDaCapa, mensagemDaGaleria, obterArquivoDaCapa } from '../src/lib/camera.js';

test('Android abre o seletor de fotos sem bloquear o arquivo por falta de permissão ampla', async () => {
  let chamada;
  let pediuPermissao = false;
  const camera = {
    checkPermissions: async () => ({ photos: 'denied', camera: 'denied' }),
    requestPermissions: async () => { pediuPermissao = true; },
    getPhoto: async options => { chamada = options; return { webPath: 'https://localhost/capa.jpg' }; },
  };
  const image = await escolherCapaDaGaleria({ camera, platform: 'android' });
  assert.equal(image.webPath, 'https://localhost/capa.jpg');
  assert.equal(chamada.source, 'PHOTOS');
  assert.equal(chamada.resultType, 'uri');
  assert.equal(chamada.quality, 90);
  assert.equal(pediuPermissao, false);
});

test('iOS aceita acesso limitado à biblioteca sem pedir acesso total', async () => {
  let pediuPermissao = false;
  const camera = {
    checkPermissions: async () => ({ photos: 'limited' }),
    requestPermissions: async () => { pediuPermissao = true; },
    getPhoto: async () => ({ webPath: 'capacitor://capa.jpg' }),
  };
  await escolherCapaDaGaleria({ camera, platform: 'ios' });
  assert.equal(pediuPermissao, false);
});

test('permissão negada no iOS não abre a biblioteca nem finge sucesso', async () => {
  let abriu = false;
  const camera = {
    checkPermissions: async () => ({ photos: 'prompt' }),
    requestPermissions: async () => ({ photos: 'denied' }),
    getPhoto: async () => { abriu = true; },
  };
  await assert.rejects(escolherCapaDaGaleria({ camera, platform: 'ios' }), /PERMISSAO_FOTOS_NEGADA/);
  assert.equal(abriu, false);
});

test('cancelar propaga a rejeição para o catch e produz mensagem recuperável', async () => {
  const cancelamento = new Error('User cancelled photos app');
  const camera = { getPhoto: async () => { throw cancelamento; } };
  await assert.rejects(escolherCapaDaGaleria({ camera, platform: 'web' }), error => error === cancelamento);
  assert.equal(mensagemDaGaleria(cancelamento).type, 'info');
  assert.equal(mensagemDaGaleria(new Error('User denied permission to photos')).type, 'error');
});

test('imagem sem URI não é anunciada como importada', async () => {
  await assert.rejects(escolherCapaDaGaleria({ camera: { getPhoto: async () => ({}) }, platform: 'web' }), /IMAGEM_SEM_WEBPATH/);
});

test('capa é persistida como bytes válidos, não como URI temporária', async () => {
  const photo = { webPath: 'data:image/png;base64,iVBORw0KGgo=' };
  const blob = await obterArquivoDaCapa(photo);
  assert.equal(blob.type, 'image/png');
  assert.ok(blob.size > 0);
  assert.strictEqual(await obterArquivoDaCapa({ blob }), blob);
});

test('arquivo que não é imagem não pode entrar no acervo como capa', async () => {
  await assert.rejects(obterArquivoDaCapa({ webPath: 'data:text/plain,arquivo' }), /imagem válido/);
});

test('seletor nativo oferece câmera e galeria sem exigir permissão antes da escolha', async () => {
  let chamada;
  const camera = {
    checkPermissions: async () => ({ camera: 'denied', photos: 'denied' }),
    requestPermissions: async () => assert.fail('O seletor deve aguardar a escolha do usuário'),
    getPhoto: async options => { chamada = options; return { webPath: 'https://localhost/foto.jpg' }; },
  };
  await abrirCameraOuGaleria({ camera, platform: 'android' });
  assert.equal(chamada.source, 'PROMPT');
  assert.equal(chamada.resultType, 'uri');
  assert.equal(chamada.promptLabelPicture, 'Tirar foto');
  assert.equal(chamada.promptLabelPhoto, 'Escolher da galeria');
});

test('captura direta solicita somente câmera e abre a captura após autorização', async () => {
  let chamada;
  const camera = {
    checkPermissions: async () => ({ camera: 'prompt', photos: 'denied' }),
    requestPermissions: async options => {
      assert.deepEqual(options.permissions, ['camera']);
      return { camera: 'granted' };
    },
    getPhoto: async options => { chamada = options; return { webPath: 'https://localhost/foto.jpg' }; },
  };
  await tirarFotoDaCapa({ camera, platform: 'android' });
  assert.equal(chamada.source, 'CAMERA');
  assert.equal(chamada.webUseInput, false);
});

test('câmera negada não abre captura e informa o recurso que foi bloqueado', async () => {
  const camera = {
    checkPermissions: async () => ({ camera: 'prompt' }),
    requestPermissions: async () => ({ camera: 'denied' }),
    getPhoto: async () => assert.fail('Não deve capturar sem a autorização necessária'),
  };
  await assert.rejects(tirarFotoDaCapa({ camera, platform: 'android' }), /PERMISSAO_CAMERA_NEGADA/);
  const feedback = mensagemDaGaleria(new Error('User denied access to camera'));
  assert.equal(feedback.type, 'error');
  assert.match(feedback.text, /à câmera/);
});

test('no navegador usa a câmera web e delega a autorização ao navegador', async () => {
  let chamada;
  const camera = { getPhoto: async options => { chamada = options; return { webPath: 'blob:foto-web' }; } };
  await tirarFotoDaCapa({ camera, platform: 'web' });
  assert.equal(chamada.source, 'CAMERA');
  assert.equal(chamada.webUseInput, false);
});

test('cancelar a câmera mantém o erro recuperável e permite nova captura', async () => {
  let chamadas = 0;
  const cancelamento = new Error('User cancelled photos app');
  const camera = { getPhoto: async () => { if (++chamadas === 1) throw cancelamento; return { webPath: 'blob:nova-foto' }; } };
  await assert.rejects(tirarFotoDaCapa({ camera, platform: 'web' }), error => error === cancelamento);
  assert.equal(mensagemDaGaleria(cancelamento).type, 'info');
  const image = await tirarFotoDaCapa({ camera, platform: 'web' });
  assert.equal(image.webPath, 'blob:nova-foto');
});
