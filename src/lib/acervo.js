const DB_NAME = 'livraria-rara';
const DB_VERSION = 1;
const STORE = 'livros';
let databasePromise;

function abrirBanco() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          databasePromise = undefined;
        };
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Feche outras abas deste aplicativo e tente novamente.'));
    }).catch(error => { databasePromise = undefined; throw error; });
  }
  return databasePromise;
}

function aguardarTransacao(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Falha ao salvar os dados.'));
    transaction.onabort = () => reject(transaction.error || new Error('A gravação foi interrompida.'));
  });
}

export async function listarLivros() {
  const db = await abrirBanco();
  const tx = db.transaction(STORE, 'readonly');
  const request = tx.objectStore(STORE).getAll();
  const records = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function salvarLivro(livro) {
  const db = await abrirBanco();
  const tx = db.transaction(STORE, 'readwrite');
  const finished = aguardarTransacao(tx);
  // Guarda os bytes da capa (Blob), nunca uma URI temporária da galeria.
  tx.objectStore(STORE).put(livro);
  await finished;
}

export async function excluirLivro(id) {
  const db = await abrirBanco();
  const tx = db.transaction(STORE, 'readwrite');
  const finished = aguardarTransacao(tx);
  tx.objectStore(STORE).delete(id);
  await finished;
}
