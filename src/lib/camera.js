import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Aluno 11: a origem deve ser Photos; o resultado deve ser Uri.
 * A injeção do plugin nos testes permite verificar permissões e falhas reais.
 */
export async function escolherCapaDaGaleria({
  camera = Camera,
  platform = Capacitor.getPlatform(),
} = {}) {
  if (platform !== 'web') {
    const permissoes = await camera.checkPermissions();
    // Android utiliza Photo Picker / ACTION_OPEN_DOCUMENT. Não exige acesso
    // amplo a todas as fotos. A autorização é concedida ao arquivo escolhido.
    // No iOS, tratamos também o acesso limitado à biblioteca de fotos.
    if (platform === 'ios' && !['granted', 'limited'].includes(permissoes.photos)) {
      const resposta = await camera.requestPermissions({ permissions: ['photos'] });
      if (!['granted', 'limited'].includes(resposta.photos)) {
        throw new Error('PERMISSAO_FOTOS_NEGADA');
      }
    }
  }

  const image = await camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    correctOrientation: true,
    saveToGallery: false,
    // O navegador abre o seletor de arquivos sem precisar de PWA Elements.
    webUseInput: true,
  });

  if (!image?.webPath) throw new Error('IMAGEM_SEM_WEBPATH');
  return image;
}

/** No Android o próprio plugin pede a permissão somente após escolher Câmera. */
export async function abrirCameraOuGaleria({
  camera = Camera,
  platform = Capacitor.getPlatform(),
} = {}) {
  if (platform !== 'web') await camera.checkPermissions();
  const image = await camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
    correctOrientation: true,
    saveToGallery: false,
    webUseInput: false,
    promptLabelHeader: 'Escolha a origem da capa',
    promptLabelPicture: 'Tirar foto',
    promptLabelPhoto: 'Escolher da galeria',
    promptLabelCancel: 'Cancelar',
  });
  if (!image?.webPath) throw new Error('IMAGEM_SEM_WEBPATH');
  return image;
}

/** Captura direta; no navegador usa a prévia de câmera do PWA Elements. */
export async function tirarFotoDaCapa({
  camera = Camera,
  platform = Capacitor.getPlatform(),
} = {}) {
  if (platform !== 'web') {
    const status = await camera.checkPermissions();
    if (status.camera !== 'granted') {
      const response = await camera.requestPermissions({ permissions: ['camera'] });
      if (response.camera !== 'granted') throw new Error('PERMISSAO_CAMERA_NEGADA');
    }
  }
  const image = await camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
    saveToGallery: false,
    webUseInput: false,
  });
  if (!image?.webPath) throw new Error('IMAGEM_SEM_WEBPATH');
  return image;
}

export function mensagemDaGaleria(error) {
  const message = String(error?.message || error || '').toLowerCase();
  if (/cancel|canceled|cancelled|no image|no photo/.test(message)) {
    return { type: 'info', text: 'Seleção cancelada. Você pode escolher outra capa quando quiser.' };
  }
  if (/permiss|permission|denied|negad/.test(message)) {
    const recurso = /camera|câmera/.test(message) ? 'à câmera' : 'às fotos';
    return { type: 'error', text: `O acesso ${recurso} não foi autorizado. Verifique as permissões do aplicativo nas configurações do aparelho. Você também pode escolher a capa pela galeria.` };
  }
  if (/notfound|no camera|no video|doesn't have a camera|resolve camera|not available|not supported/.test(message)) {
    return { type: 'error', text: 'A câmera não está disponível neste dispositivo. Use a galeria para escolher a capa.' };
  }
  if (/sem_webpath/.test(message)) {
    return { type: 'error', text: 'A imagem não retornou um caminho válido. Tente selecionar outra capa.' };
  }
  return { type: 'error', text: 'Não foi possível abrir a câmera ou a galeria. Tente novamente; seus dados continuam aqui.' };
}

export async function obterArquivoDaCapa(photo) {
  if (photo.blob instanceof Blob) return photo.blob;
  const response = await fetch(photo.webPath);
  if (!response.ok) throw new Error('Não foi possível ler a imagem selecionada. Escolha a capa novamente.');
  const blob = await response.blob();
  if (!blob.size || !blob.type.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem válido para a capa.');
  }
  if (blob.size > 20 * 1024 * 1024) {
    throw new Error('A capa deve ter até 20 MB. Escolha uma imagem menor.');
  }
  return blob;
}
