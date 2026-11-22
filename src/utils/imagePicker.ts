/**
 * Compatibilidade do expo-image-picker entre versoes.
 *
 * A forma de dizer "so imagens" mudou:
 *
 *   ate o SDK 51  -> mediaTypes: ImagePicker.MediaTypeOptions.Images
 *   do SDK 52+    -> mediaTypes: ['images']   (MediaTypeOptions depreciado)
 *
 * Fixar uma das duas quebra na outra: usar `MediaTypeOptions` numa versao que
 * ja removeu o objeto lanca "Cannot read property 'Images' of undefined" no
 * momento em que o usuario toca em anexar a foto — ou seja, so aparece em
 * uso, nao na inicializacao.
 *
 * Esta funcao escolhe a forma que a versao instalada entende. Fica em um lugar
 * so para que uma futura mudanca de API seja um ajuste de uma linha.
 */

import * as ImagePicker from 'expo-image-picker';

type OpcoesDeMidia = ImagePicker.ImagePickerOptions['mediaTypes'];

/** Valor de `mediaTypes` que seleciona apenas imagens na versao instalada. */
export function somenteImagens(): OpcoesDeMidia {
  const legado = (
    ImagePicker as unknown as {
      MediaTypeOptions?: { Images?: unknown };
    }
  ).MediaTypeOptions;

  if (legado?.Images !== undefined) {
    return legado.Images as OpcoesDeMidia;
  }

  return ['images'] as OpcoesDeMidia;
}
