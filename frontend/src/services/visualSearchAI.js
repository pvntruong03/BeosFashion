const MODEL_ID = 'Xenova/clip-vit-base-patch32';

let classifierPromise;

const clean = (value) => String(value || '').trim();

export const productLabel = (product) => {
  const colors = [...new Set((product.variants || [])
    .filter((variant) => variant.active !== false)
    .map((variant) => clean(variant.colorName))
    .filter(Boolean))]
    .slice(0, 3)
    .join(', ');

  return [
    clean(product.name),
    clean(product.categoryName),
    clean(product.gender) && `${clean(product.gender).toLowerCase()} adult fashion`,
    clean(product.material),
    colors && `colors ${colors}`
  ].filter(Boolean).join(', ');
};

const getClassifier = (onProgress) => {
  if (!classifierPromise) {
    classifierPromise = import('@huggingface/transformers').then(async ({ env, pipeline }) => {
      env.allowLocalModels = false;
      return pipeline('zero-shot-image-classification', MODEL_ID, {
        device: 'wasm',
        dtype: 'q8',
        progress_callback: onProgress
      });
    }).catch((error) => {
      classifierPromise = undefined;
      throw error;
    });
  }
  return classifierPromise;
};

export const analyzeImageWithClip = async (imageUrl, products, onProgress = () => {}) => {
  const candidates = products
    .filter((product) => product?.id && product?.active !== false)
    .map((product) => ({ product, label: productLabel(product) }))
    .filter(({ label }) => label);

  if (!candidates.length) {
    throw new Error('Product catalog is empty');
  }

  const classifier = await getClassifier(onProgress);
  const output = await classifier(imageUrl, candidates.map(({ label }) => label));
  const labelToProduct = new Map(candidates.map(({ product, label }) => [label, product]));
  const clipScores = {};

  for (const item of output) {
    const product = labelToProduct.get(item.label);
    if (product && Number.isFinite(item.score)) {
      clipScores[product.id] = item.score;
    }
  }

  return {
    modelId: MODEL_ID,
    clipScores,
    detectedLabels: output.slice(0, 5).map((item) => labelToProduct.get(item.label)?.name || item.label)
  };
};

export { MODEL_ID };
