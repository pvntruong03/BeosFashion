const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function api(pathStr, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api${pathStr}`,
    method,
    headers
  }, data);
}

// Curated High-Fashion Editorial Image Mapping
const PRODUCT_IMAGE_REGISTRY = {
  // Flagship Items
  "BEO-455359": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", // Oversized Tee
  "BEO-460670": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80", // Thermal Tee
  "BEO-463942": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", // Smart Ankle Pants
  "BEO-460920": "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80", // Down Puffer
  "BEO-467812": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80", // UT Anime Tee
  "BEO-458721": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", // Women Supima Tee
  "BEO-460311": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", // Women Wide-Leg
  "BEO-464850": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", // Women UV Hoodie
  "BEO-465188": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", // Men Linen Shirt
  "BEO-456778": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80", // Men Polo
  "BEO-461083": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80", // Women Cardigan
  "BEO-466820": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", // Women Floral Dress
  "BEO-455490": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", // Men Chino Shorts
  "BEO-453773": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", // Men Pocketable Parka
  "BEO-464484": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", // Shoulder Bag
  "BEO-464332": "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80", // Seamless Bra
  "BEO-LUX-1599": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80", // Silk Heritage

  // 50-Products Catalog
  "BEO-500001": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80", // Merino Sweater
  "BEO-500002": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", // UV Active Hoodie
  "BEO-500003": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", // Oxford Shirt
  "BEO-500004": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", // French Linen Shirt
  "BEO-500005": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", // Supima V-Neck
  "BEO-500006": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80", // Flannel Overshirt
  "BEO-500007": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80", // Pique Polo
  "BEO-500008": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80", // Denim Work Shirt
  "BEO-500009": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", // Slim Chino
  "BEO-500010": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", // Selvedge Denim
  "BEO-500011": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", // Cargo Shorts
  "BEO-500012": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80", // Active Joggers
  "BEO-500013": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80", // Pleated Chinos
  "BEO-500014": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80", // Miracle Air Pants
  "BEO-500015": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80", // Linen Pants
  "BEO-500016": "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80", // 3D Down Parka
  "BEO-500017": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", // Windproof Fleece
  "BEO-500018": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", // Trench Coat
  "BEO-500019": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80", // Mesh Undershirt
  "BEO-500020": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80", // Down Vest
  "BEO-500021": "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80", // Hybrid Parka
  
  // Women Tops, Knits & Dresses (Carefully Curated)
  "BEO-500022": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80", // 3D Knit Cashmere Sweater
  "BEO-500023": "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80", // Georgette Blouse
  "BEO-500024": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", // Boat Neck Tee
  "BEO-500025": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80", // Lambswool Cardigan
  "BEO-500026": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", // Women UV Mesh Hoodie
  "BEO-500027": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80", // Linen Tunic Top
  "BEO-500028": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80", // Silk Camisole
  "BEO-500029": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80", // Souffle Yarn Jumper
  "BEO-500030": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", // Tuck Wide Trousers
  "BEO-500031": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80", // Denim Leggings Pants
  "BEO-500032": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80", // Satin Maxi Skirt
  "BEO-500033": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", // Linen A-Line Dress
  "BEO-500034": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80", // Flared Midi Skirt
  "BEO-500035": "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=800&q=80", // Straight Leg Jeans
  "BEO-500036": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", // Flannel Ankle Pants
  "BEO-500037": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", // Floral Wrap Dress
  "BEO-500038": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80", // Cocoon Midi Dress
  "BEO-500039": "https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80", // Double-Faced Short Coat
  "BEO-500040": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", // Collarless Down Jacket
  "BEO-500041": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", // Fluffy Yarn Fleece
  "BEO-500042": "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80", // Plunge Seamless Bra
  "BEO-500043": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", // Scoop Neck Thermal
  "BEO-500044": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80", // French Terry Sweatshirt
  "BEO-500045": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", // Pleated Chiffon Dress
  
  // Accessories & Lifestyle
  "BEO-500046": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80", // Leather Belt
  "BEO-500047": "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80", // Seamless Briefs
  "BEO-500048": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", // Dumpling Bag
  "BEO-500049": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80", // Scarf & Beanie
  "BEO-500050": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80"  // Metro Hat
};

// Swatch color specific image matcher
function getVariantImage(baseImage, colorName, productName) {
  const normColor = (colorName || '').toUpperCase();
  if (normColor.includes('WHITE') || normColor.includes('OFF WHITE')) {
    if (productName.toLowerCase().includes('shirt') || productName.toLowerCase().includes('t-shirt')) {
      return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80";
    }
  }
  if (normColor.includes('BLACK')) {
    if (productName.toLowerCase().includes('shirt') || productName.toLowerCase().includes('t-shirt')) {
      return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
    }
  }
  if (normColor.includes('BLUE') || normColor.includes('NAVY')) {
    return "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80";
  }
  if (normColor.includes('BEIGE') || normColor.includes('NATURAL')) {
    return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80";
  }
  return baseImage;
}

async function runImageOptimization() {
  console.log('================================================================');
  console.log('🎨 OPTIMIZING BEO MODERN FASHION PRODUCT IMAGES ACROSS DATABASE');
  console.log('================================================================\n');

  // 1. Admin Login
  const loginRes = await api('/auth/login', 'POST', {
    email: 'admin@beofashion.vn',
    password: 'admin123'
  });

  if (loginRes.status !== 200 || !loginRes.body?.data?.token) {
    console.error('Failed to authenticate as Admin:', loginRes);
    process.exit(1);
  }
  const token = loginRes.body.data.token;
  console.log('✅ Admin Authenticated Successfully');

  // 2. Fetch all products
  const prodsRes = await api('/products?sizePerPage=100');
  const products = prodsRes.body?.data?.content || [];
  console.log(`Found ${products.length} products to evaluate.\n`);

  let updatedCount = 0;

  for (const p of products) {
    let idealImage = PRODUCT_IMAGE_REGISTRY[p.code];

    // Handle custom or test products
    if (!idealImage) {
      if (p.name.toLowerCase().includes('blazer')) {
        idealImage = "https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80";
      } else if (p.name.toLowerCase().includes('shirt')) {
        idealImage = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80";
      } else {
        idealImage = p.primaryImageUrl;
      }
    }

    const detailRes = await api(`/products/${p.id}`);
    const productDetail = detailRes.body?.data;
    if (!productDetail) continue;

    // Check if update needed
    const needsPrimaryUpdate = productDetail.primaryImageUrl !== idealImage;
    const variants = productDetail.variants || [];
    let variantsUpdated = false;

    const mappedVariants = variants.map(v => {
      const targetVarImg = getVariantImage(idealImage, v.colorName, p.name);
      if (v.imageUrl !== targetVarImg) variantsUpdated = true;
      return {
        id: v.id,
        sku: v.sku,
        colorName: v.colorName,
        colorHex: v.colorHex,
        size: v.size,
        barcode: v.barcode,
        priceAdjustment: v.priceAdjustment,
        totalStock: v.totalStock,
        imageUrl: targetVarImg
      };
    });

    if (needsPrimaryUpdate || variantsUpdated) {
      const updatePayload = {
        name: productDetail.name,
        code: productDetail.code,
        categoryId: productDetail.categoryId || 1,
        basePrice: productDetail.basePrice,
        salePrice: productDetail.salePrice,
        gender: productDetail.gender,
        collection: productDetail.collection,
        material: productDetail.material,
        careInstruction: productDetail.careInstruction,
        description: productDetail.description,
        overview: productDetail.overview,
        featured: productDetail.featured,
        isNew: productDetail.isNew,
        bestSeller: productDetail.bestSeller,
        limitedOffer: productDetail.limitedOffer,
        primaryImageUrl: idealImage,
        variants: mappedVariants
      };

      const putRes = await api(`/admin/products/${p.id}`, 'PUT', updatePayload, token);
      if (putRes.status === 200) {
        console.log(`  ✨ [UPDATED #${p.id}] ${p.name} (${p.code}) -> ${idealImage.substring(0, 50)}...`);
        updatedCount++;
      } else {
        console.error(`  ❌ [FAILED #${p.id}] ${p.name}: Status ${putRes.status}`, putRes.body || putRes.raw);
      }
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 OPTIMIZATION FINISHED: ${updatedCount} products updated with high-fashion imagery!`);
  console.log('================================================================\n');
}

runImageOptimization().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
